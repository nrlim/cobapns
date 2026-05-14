"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { getAIClient, getAIModel } from "@/lib/ai-client"
import {
  AI_MIN_EXAMS_REQUIRED,
  getQuotaForTier,
  getRemainingQuota,
  isNewMonth,
} from "@/lib/ai-feedback-quota"
import type { UserTier } from "@/constants/permissions"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIFeedbackData {
  id: string
  content: string
  examCountAtGen: number
  isStale: boolean
  generatedAt: string
  newExamsSinceGen: number
}

export interface AIFeedbackStatus {
  feedback: AIFeedbackData | null
  quotaUsed: number
  quotaLimit: number
  quotaRemaining: number
  quotaResetAt: string | null
  tier: UserTier
  totalExams: number
  canGenerate: boolean
  reason?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

// SKD 2024 passing grade (Peraturan MenPANRB No. 27 Tahun 2021 → revisi 2023)
const SKD_PASSING_GRADE = {
  TWK: 65,
  TIU: 80,
  TKP: 166,
}

// ─── System Prompt ────────────────────────────────────────────────────────────
// This is the permanent persona & knowledge base injected for EVERY user.
// It establishes domain expertise, output format, and safe boundaries.

const SYSTEM_PROMPT = `Kamu adalah MENTOR CPNS — konsultan belajar PNS yang sangat berpengalaman dengan pengetahuan mendalam tentang seleksi CPNS Indonesia. Kamu sudah membantu ribuan peserta lolos SKD dan SKB.

## PENGETAHUAN DOMAIN YANG KAMU MILIKI

### Sistem Seleksi CPNS (SKD)
- SKD (Seleksi Kompetensi Dasar) terdiri dari 3 sub-tes: TWK, TIU, TKP
- Passing grade SKD: TWK ≥ 65 poin (maksimal 150), TIU ≥ 80 poin (maksimal 175), TKP ≥ 166 poin (maksimal 225)
- Skor maksimal total SKD: 550 poin
- Formasi P1/L1 (penyandang disabilitas) dan P2/L2 (putra-putri daerah tertinggal) memiliki ketentuan tersendiri

### TWK (Tes Wawasan Kebangsaan) - 30 Soal, maks 150 poin
Materi: Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, Bela Negara, Wawasan Nusantara, Sejarah Indonesia, Kebijakan Pemerintah, Hukum & Tata Negara, Pilar Kebangsaan.
Setiap jawaban benar = 5 poin. Salah/tidak menjawab = 0.

### TIU (Tes Intelegensi Umum) - 35 Soal, maks 175 poin
Materi: Kemampuan Verbal (sinonim, antonim, analogi), Kemampuan Numerik (deret angka, aritmatika, perbandingan), Kemampuan Figural (matriks, deret gambar), Kemampuan Penalaran (logika deduktif, silogisme).
Setiap jawaban benar = 5 poin. Salah/tidak menjawab = 0.

### TKP (Tes Karakteristik Pribadi) - 45 Soal, maks 225 poin
Materi: Pelayanan Publik, Jejaring Kerja, Sosial Budaya, TIK, Anti-radikalisme, Profesionalisme, Integritas.
Sistem penilaian 1-5 per soal (tidak ada jawaban 0). Setiap soal memiliki pilihan A-E dengan skor berbeda.

### Strategi Kelulusan Optimal
- Prioritas utama: Pastikan TKP ≥ 166 dulu (karena paling sulit turun dari passing grade)
- TIU adalah diferensiator terbesar antar peserta
- TWK relatif paling mudah ditingkatkan dengan hafalan materi
- Urutan belajar ideal: TKP → TIU → TWK untuk peserta baru
- Untuk peserta yang sudah dekat passing grade: fokus ke sub-materi yang paling sering muncul

## ATURAN YANG HARUS KAMU IKUTI

1. **Hanya bicara tentang CPNS dan persiapan seleksi ASN** — jangan merespons pertanyaan di luar konteks ini
2. **Selalu berbasis data user** — setiap rekomendasi HARUS merujuk pada data try out aktual user
3. **Konkret dan actionable** — hindari saran umum seperti "belajar lebih giat". Selalu sebutkan materi SPESIFIK yang harus dipelajari
4. **Jujur tentang kondisi** — jika skor user jauh dari passing grade, sampaikan dengan empati tapi jelas
5. **Tidak membuat data fiktif** — jika data tidak tersedia (misal psikometri belum dilakukan), katakan demikian
6. **Bahasa Indonesia** — selalu gunakan Bahasa Indonesia yang baik, formal namun hangat
7. **Format terstruktur** — gunakan heading, bullet points, dan bold untuk memudahkan pembacaan

## FORMAT OUTPUT YANG WAJIB DIIKUTI

Gunakan struktur berikut secara KONSISTEN:

## 📊 Ringkasan Performamu
[Gambaran singkat kondisi skor vs passing grade]

## 💪 Kekuatan yang Perlu Dipertahankan
[Poin-poin konkret berdasarkan data]

## ⚠️ Prioritas Perbaikan
[Urutan prioritas berdasarkan gap terbesar ke passing grade]

## 📚 Rencana Belajar Minggu Ini
[3-5 aksi KONKRET dan SPESIFIK]

## 🎯 Target Realistis
[Estimasi yang bisa dicapai jika menjalankan rencana]

---
*Rekomendasi ini dibuat berdasarkan data try out aktual yang kamu kerjakan di platform COBA PNS.*`

// ─── User Context Builder ─────────────────────────────────────────────────────
// Builds a rich, structured prompt with all user data injected dynamically.

interface ExamResultWithExam {
  scoreTWK: number
  scoreTIU: number
  scoreTKP: number
  totalScore: number
  passTWK: boolean
  passTIU: boolean
  passTKP: boolean
  overallPass: boolean
  submittedAt: Date
  exam: { title: string }
}

interface PsychResult {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  integrity: number
  stressResilience: number
  teamwork: number
  personalityType: string | null
  careerRecs: unknown
}

interface IQResultData {
  totalIQ: number
  interpretation: string | null
  verbalRaw: number
  numericRaw: number
  logicRaw: number
  spatialRaw: number
}

interface UserProfile {
  name: string
  targetInstansi: string | null
  jabatan: string | null
  jenjang: string | null
  learningGoal: string | null
  profession: string | null
}

function buildUserContextPrompt(
  user: UserProfile,
  examResults: ExamResultWithExam[],
  examCount: number,
  psychResult: PsychResult | null,
  iqResult: IQResultData | null
): string {
  const lines: string[] = []

  // ── Profile section ──────────────────────────────────────────────────────
  lines.push("# DATA PESERTA")
  lines.push(`- Nama: ${user.name}`)
  if (user.targetInstansi) lines.push(`- Target Instansi: ${user.targetInstansi}`)
  if (user.jabatan)        lines.push(`- Formasi Jabatan: ${user.jabatan}`)
  if (user.jenjang)        lines.push(`- Jenjang Pendidikan: ${user.jenjang}`)
  if (user.learningGoal)   lines.push(`- Tujuan Belajar: ${user.learningGoal}`)
  if (user.profession)     lines.push(`- Profesi Saat Ini: ${user.profession}`)

  // ── Exam stats ────────────────────────────────────────────────────────────
  lines.push(`\n# RIWAYAT TRY OUT (Total: ${examCount} ujian)`)

  if (examResults.length > 0) {
    // Average scores
    const avgTWK = Math.round(examResults.reduce((s, r) => s + r.scoreTWK, 0) / examResults.length)
    const avgTIU = Math.round(examResults.reduce((s, r) => s + r.scoreTIU, 0) / examResults.length)
    const avgTKP = Math.round(examResults.reduce((s, r) => s + r.scoreTKP, 0) / examResults.length)
    const avgTotal = Math.round(examResults.reduce((s, r) => s + r.totalScore, 0) / examResults.length)

    // Best scores
    const bestTWK = Math.max(...examResults.map((r) => r.scoreTWK))
    const bestTIU = Math.max(...examResults.map((r) => r.scoreTIU))
    const bestTKP = Math.max(...examResults.map((r) => r.scoreTKP))

    // Pass rates
    const passTWKRate = Math.round((examResults.filter((r) => r.passTWK).length / examResults.length) * 100)
    const passTIURate = Math.round((examResults.filter((r) => r.passTIU).length / examResults.length) * 100)
    const passTKPRate = Math.round((examResults.filter((r) => r.passTKP).length / examResults.length) * 100)
    const overallPassRate = Math.round((examResults.filter((r) => r.overallPass).length / examResults.length) * 100)

    lines.push(`\n## Statistik Keseluruhan (dari ${examResults.length} try out terakhir)`)
    lines.push(`| Sub-Tes | Rata-rata | Terbaik | Passing Grade | % Lolos PG |`)
    lines.push(`|---------|-----------|---------|---------------|------------|`)
    lines.push(`| TWK     | ${avgTWK}      | ${bestTWK}   | ${SKD_PASSING_GRADE.TWK}         | ${passTWKRate}%        |`)
    lines.push(`| TIU     | ${avgTIU}      | ${bestTIU}   | ${SKD_PASSING_GRADE.TIU}         | ${passTIURate}%        |`)
    lines.push(`| TKP     | ${avgTKP}      | ${bestTKP}   | ${SKD_PASSING_GRADE.TKP}        | ${passTKPRate}%        |`)
    lines.push(`| Total   | ${avgTotal}    |         |               | ${overallPassRate}% lulus semua PG |`)

    // Gap analysis
    lines.push(`\n## Analisis Gap ke Passing Grade`)
    const gapTWK = SKD_PASSING_GRADE.TWK - avgTWK
    const gapTIU = SKD_PASSING_GRADE.TIU - avgTIU
    const gapTKP = SKD_PASSING_GRADE.TKP - avgTKP
    lines.push(`- TWK: rata-rata ${avgTWK} → ${gapTWK > 0 ? `kurang ${gapTWK} poin dari PG` : `surplus ${Math.abs(gapTWK)} poin di atas PG ✅`}`)
    lines.push(`- TIU: rata-rata ${avgTIU} → ${gapTIU > 0 ? `kurang ${gapTIU} poin dari PG` : `surplus ${Math.abs(gapTIU)} poin di atas PG ✅`}`)
    lines.push(`- TKP: rata-rata ${avgTKP} → ${gapTKP > 0 ? `kurang ${gapTKP} poin dari PG` : `surplus ${Math.abs(gapTKP)} poin di atas PG ✅`}`)

    // Trend (last 3 vs previous)
    if (examResults.length >= 4) {
      const last3 = examResults.slice(0, 3)
      const prev = examResults.slice(3)
      const avgLast3 = Math.round(last3.reduce((s, r) => s + r.totalScore, 0) / last3.length)
      const avgPrev = Math.round(prev.reduce((s, r) => s + r.totalScore, 0) / prev.length)
      const trend = avgLast3 - avgPrev
      lines.push(`\n## Tren Performa`)
      lines.push(`Rata-rata skor 3 try out terbaru: ${avgLast3} vs sebelumnya: ${avgPrev} → ${trend >= 0 ? `📈 Naik ${trend} poin` : `📉 Turun ${Math.abs(trend)} poin`}`)
    }

    // Detail per try out
    lines.push(`\n## Detail Try Out (${examResults.length} Terbaru)`)
    examResults.forEach((r, i) => {
      const date = r.submittedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
      const status = r.overallPass ? "✅ LULUS" : `❌ Gagal [${!r.passTWK ? "TWK " : ""}${!r.passTIU ? "TIU " : ""}${!r.passTKP ? "TKP" : ""}]`
      lines.push(`${i + 1}. ${r.exam.title} (${date}): TWK=${r.scoreTWK} TIU=${r.scoreTIU} TKP=${r.scoreTKP} Total=${r.totalScore} → ${status}`)
    })
  }

  // ── Psychometric ──────────────────────────────────────────────────────────
  if (psychResult) {
    lines.push(`\n# PROFIL KEPRIBADIAN (Big Five)`)
    lines.push(`- Tipe Kepribadian: ${psychResult.personalityType ?? "Tidak terdeteksi"}`)
    lines.push(`- Keterbukaan (Openness): ${psychResult.openness.toFixed(0)}%`)
    lines.push(`- Kedisiplinan (Conscientiousness): ${psychResult.conscientiousness.toFixed(0)}%`)
    lines.push(`- Ekstraversi: ${psychResult.extraversion.toFixed(0)}%`)
    lines.push(`- Keramahan (Agreeableness): ${psychResult.agreeableness.toFixed(0)}%`)
    lines.push(`- Stabilitas Emosi (low Neuroticism): ${(100 - psychResult.neuroticism).toFixed(0)}%`)
    lines.push(`- Integritas: ${psychResult.integrity.toFixed(0)}%`)
    lines.push(`- Ketahanan Stres: ${psychResult.stressResilience.toFixed(0)}%`)
    lines.push(`- Kerja Tim: ${psychResult.teamwork.toFixed(0)}%`)
    lines.push(`\nCatatan: Profil ini sangat relevan untuk membaca skor TKP karena TKP mengukur karakteristik serupa.`)
  } else {
    lines.push(`\n# PROFIL KEPRIBADIAN: Belum dikerjakan`)
    lines.push(`User belum menyelesaikan Psikotes. Rekomendasikan untuk segera mengerjakannya agar analisis lebih akurat.`)
  }

  // ── IQ Result ─────────────────────────────────────────────────────────────
  if (iqResult) {
    lines.push(`\n# HASIL TES IQ`)
    lines.push(`- Skor IQ Total: ${iqResult.totalIQ} (${iqResult.interpretation ?? "tidak ada interpretasi"})`)
    lines.push(`- Sub-tes Verbal: ${iqResult.verbalRaw} jawaban benar → relevan dengan TIU Verbal`)
    lines.push(`- Sub-tes Numerik: ${iqResult.numericRaw} jawaban benar → relevan dengan TIU Numerik`)
    lines.push(`- Sub-tes Logika: ${iqResult.logicRaw} jawaban benar → relevan dengan TIU Penalaran`)
    lines.push(`- Sub-tes Spasial: ${iqResult.spatialRaw} jawaban benar → relevan dengan TIU Figural`)
  } else {
    lines.push(`\n# HASIL TES IQ: Belum dikerjakan`)
    lines.push(`Rekomendasikan user untuk mengerjakan Tes IQ agar korelasi dengan TIU bisa dianalisis.`)
  }

  // ── Final instruction ─────────────────────────────────────────────────────
  lines.push(`\n---`)
  lines.push(`Berdasarkan semua data di atas, buatlah REKOMENDASI BELAJAR PERSONAL yang sangat spesifik untuk ${user.name}. Ikuti format output yang sudah ditentukan dalam system prompt. Pastikan setiap poin rekomendasi MERUJUK langsung pada data yang ada, bukan generik.`)

  return lines.join("\n")
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getAIFeedbackStatus(): Promise<AIFeedbackStatus> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) throw new Error("UNAUTHENTICATED")

    const userId = session.userId

    const [dbUser, feedback, examCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          subscriptionEnds: true,
          aiFeedbackUsed: true,
          aiFeedbackResetAt: true,
        },
      }),
      prisma.aIFeedback.findUnique({ where: { userId } }),
      prisma.examResult.count({ where: { userId } }),
    ])

    if (!dbUser) throw new Error("USER_NOT_FOUND")

    const rawTier = dbUser.subscriptionTier ?? "FREE"
    const effectiveTier: UserTier =
      rawTier !== "FREE" &&
        dbUser.subscriptionEnds &&
        new Date(dbUser.subscriptionEnds) < new Date()
        ? "FREE"
        : (rawTier as UserTier)

    const quotaLimit = getQuotaForTier(effectiveTier)
    const quotaRemaining = getRemainingQuota(effectiveTier, dbUser.aiFeedbackUsed, dbUser.aiFeedbackResetAt)
    const quotaUsed = isNewMonth(dbUser.aiFeedbackResetAt) ? 0 : dbUser.aiFeedbackUsed

    const newExamsSinceGen = feedback && examCount > feedback.examCountAtGen
      ? examCount - feedback.examCountAtGen
      : 0

    let canGenerate = true
    let reason: string | undefined

    if (effectiveTier === "FREE") {
      canGenerate = false
      reason = "Fitur ini hanya tersedia untuk paket Elite dan Master."
    } else if (quotaRemaining <= 0) {
      canGenerate = false
      reason = "Kuota rekomendasi bulan ini sudah habis."
    } else if (examCount < AI_MIN_EXAMS_REQUIRED) {
      canGenerate = false
      reason = `Kerjakan minimal ${AI_MIN_EXAMS_REQUIRED} try out terlebih dahulu.`
    }

    return {
      feedback: feedback ? {
        id: feedback.id,
        content: feedback.content,
        examCountAtGen: feedback.examCountAtGen,
        isStale: feedback.isStale,
        generatedAt: feedback.generatedAt.toISOString(),
        newExamsSinceGen,
      } : null,
      quotaUsed,
      quotaLimit,
      quotaRemaining,
      quotaResetAt: dbUser.aiFeedbackResetAt?.toISOString() ?? null,
      tier: effectiveTier,
      totalExams: examCount,
      canGenerate,
      reason,
    }
  } catch (err) {
    console.error("[getAIFeedbackStatus] error:", err)
    return {
      feedback: null,
      quotaUsed: 0,
      quotaLimit: 0,
      quotaRemaining: 0,
      quotaResetAt: null,
      tier: "FREE",
      totalExams: 0,
      canGenerate: false,
      reason: "Gagal memuat status. Silakan muat ulang halaman.",
    }
  }
}

export async function generateAIFeedback(): Promise<{ success: boolean; error?: string; feedback?: AIFeedbackData }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    const session = token ? await verifySession(token) : null
    if (!session) return { success: false, error: "Unauthenticated" }

    const userId = session.userId

    // Fetch all data needed for the prompt
    const [dbUser, examResults, psychResult, iqResult, examCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          targetInstansi: true,
          jabatan: true,
          jenjang: true,
          learningGoal: true,
          profession: true,
          subscriptionTier: true,
          subscriptionEnds: true,
          aiFeedbackUsed: true,
          aiFeedbackResetAt: true,
        },
      }),
      prisma.examResult.findMany({
        where: { userId },
        orderBy: { submittedAt: "desc" },
        take: 10,
        include: { exam: { select: { title: true } } },
      }),
      prisma.psychometricResult.findUnique({ where: { userId } }),
      prisma.iQResult.findUnique({ where: { userId } }),
      prisma.examResult.count({ where: { userId } }),
    ])

    if (!dbUser) return { success: false, error: "User tidak ditemukan." }

    // Quota check
    const effectiveTier = (dbUser.subscriptionTier as UserTier)
    const quotaRemaining = getRemainingQuota(effectiveTier, dbUser.aiFeedbackUsed, dbUser.aiFeedbackResetAt)
    if (quotaRemaining <= 0) return { success: false, error: "Kuota habis." }
    if (examCount < AI_MIN_EXAMS_REQUIRED) {
      return { success: false, error: `Kerjakan minimal ${AI_MIN_EXAMS_REQUIRED} try out terlebih dahulu.` }
    }

    // Build context prompt from user's actual data
    const userContextPrompt = buildUserContextPrompt(
      {
        name: dbUser.name,
        targetInstansi: dbUser.targetInstansi,
        jabatan: dbUser.jabatan,
        jenjang: dbUser.jenjang,
        learningGoal: dbUser.learningGoal,
        profession: dbUser.profession,
      },
      examResults as ExamResultWithExam[],
      examCount,
      psychResult as PsychResult | null,
      iqResult as IQResultData | null
    )

    // Call AI with full system prompt + user context
    const [aiClient, aiModel] = await Promise.all([getAIClient(), getAIModel()])
    const response = await aiClient.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: userContextPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.4, // Low temperature for consistent, factual output
    })

    const aiContent = response.choices[0]?.message?.content
    if (!aiContent) return { success: false, error: "Gagal mendapatkan respons." }

    const now = new Date()
    const monthRolled = isNewMonth(dbUser.aiFeedbackResetAt)

    await prisma.$transaction([
      prisma.aIFeedback.upsert({
        where: { userId },
        update: { content: aiContent, examCountAtGen: examCount, isStale: false, generatedAt: now },
        create: { userId, content: aiContent, examCountAtGen: examCount, isStale: false },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          aiFeedbackUsed: monthRolled ? 1 : { increment: 1 },
          aiFeedbackResetAt: monthRolled ? now : undefined,
        },
      }),
    ])

    revalidatePath("/dashboard/diagnostik")

    return {
      success: true,
      feedback: {
        id: "new",
        content: aiContent,
        examCountAtGen: examCount,
        isStale: false,
        generatedAt: now.toISOString(),
        newExamsSinceGen: 0,
      }
    }
  } catch (err) {
    console.error("[generateAIFeedback] error:", err)
    return { success: false, error: "Terjadi kesalahan saat membuat rekomendasi." }
  }
}

export async function markAIFeedbackStale(userId: string): Promise<void> {
  try {
    await prisma.aIFeedback.updateMany({
      where: { userId },
      data: { isStale: true },
    })
  } catch { }
}
