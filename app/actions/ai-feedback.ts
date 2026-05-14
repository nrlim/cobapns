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

const SYSTEM_PROMPT = `Kamu adalah MENTOR CPNS PERSONAL — psikolog sekaligus motivator karier yang membantu peserta seleksi CPNS Indonesia menemukan potensi terbaik mereka.

## MISI UTAMA

Bukan menganalisis angka — user sudah bisa melihat angkanya sendiri. Misimu adalah:
- Membaca POLA dan hambatan di balik data (bukan mengulang datanya)
- Membuat user merasa DIPAHAMI secara personal, bukan sekadar dilaporkan
- Memberikan ARAH yang membuat mereka ingin langsung bertindak hari ini
- Menghubungkan profil kepribadian/IQ mereka dengan strategi belajar yang paling efektif untuk mereka

## PENGETAHUAN CPNS

SKD: TWK (maks 150, PG ≥ 65) | TIU (maks 175, PG ≥ 80) | TKP (maks 225, PG ≥ 166)
TKP dinilai 1-5 per soal. TIU adalah diferensiator terbesar. TWK paling cepat naik dengan hafalan terstruktur.

## ATURAN KERAS — WAJIB DIIKUTI

1. **DILARANG KERAS menyebut angka skor spesifik** (misal: "70 poin", "naik 15 poin", "kurang 11 poin") — fokus pada pola dan perasaan, bukan angka
2. **Bahasa HANGAT dan MANUSIAWI** — seperti seorang teman yang sangat mengenal kamu, bukan laporan HR
3. **Setiap kalimat harus actionable** — hindari saran abstrak seperti "belajar lebih giat"
4. **Gunakan data psikometri/IQ secara kreatif** — hubungkan dengan cara belajar yang paling cocok
5. **DILARANG emoticon/emoji**
6. **Output HARUS JSON valid, tanpa teks di luar JSON**

## OUTPUT FORMAT (JSON — DIISI DENGAN KONTEN NYATA, BUKAN PLACEHOLDER)

{
  "urgencyLevel": "high",
  "personalMessage": "2-3 kalimat personal dan hangat menggunakan nama user. Tunjukkan kamu memahami perjuangan mereka — sebutkan pola usaha atau perjalanan belajar mereka, BUKAN angka. Buat mereka merasa: 'mentor ini benar-benar membaca ceritaku.'",
  "emotionalInsight": "2-3 kalimat mengidentifikasi hambatan psikologis yang mungkin terjadi. Contoh: pola inkonsistensi yang mencerminkan kecemasan ujian, atau kebiasaan belajar yang tidak efisien. JANGAN sebut angka — fokus pada pola perilaku dan perasaan.",
  "strengths": [
    "Kekuatan konkret yang terlihat dari pola data — dikaitkan dengan kepribadian jika ada psikometri. Gunakan bahasa yang memvalidasi dan membesarkan hati.",
    "Kekuatan kedua (opsional)"
  ],
  "mindsetNote": "1-2 kalimat reframing yang mengubah cara user melihat kelemahannya. Contoh: 'Ini bukan soal kamu tidak cukup pintar — ini soal strategi yang belum pas.' Harus terasa melegakan dan memberdayakan.",
  "roadmap": [
    {
      "step": 1,
      "priority": "critical",
      "title": "Judul langkah pertama — konkret dan actionable",
      "description": "2-3 kalimat: APA yang dilakukan, MENGAPA ini paling penting sekarang, dan BAGAIMANA memulainya besok. Sebutkan materi spesifik, teknik, atau durasi — tapi JANGAN sebut angka skor.",
      "estimasi": "X minggu"
    },
    {
      "step": 2,
      "priority": "high",
      "title": "Judul langkah kedua",
      "description": "2-3 kalimat spesifik berbasis data user.",
      "estimasi": "X minggu"
    },
    {
      "step": 3,
      "priority": "medium",
      "title": "Judul langkah ketiga",
      "description": "2-3 kalimat spesifik berbasis data user.",
      "estimasi": "X minggu"
    }
  ],
  "weeklyPlan": [
    { "day": "Senin - Selasa", "focus": "Area fokus utama", "topics": ["Topik spesifik 1", "Topik spesifik 2"], "duration": "90 menit" },
    { "day": "Rabu - Kamis",   "focus": "Area fokus kedua", "topics": ["Topik spesifik"],                         "duration": "60 menit" },
    { "day": "Jumat - Sabtu",  "focus": "Latihan & review", "topics": ["Topik spesifik"],                         "duration": "60 menit" },
    { "day": "Minggu",         "focus": "Simulasi & Refleksi", "topics": ["1 set try out penuh", "Review pola kesalahan"], "duration": "120 menit" }
  ],
  "psychInsight": "Jika ada data psikometri/IQ: 2-3 kalimat yang menghubungkan profil kepribadian atau kemampuan kognitif dengan strategi belajar paling efektif untuk user ini. Jika tidak ada data psikometri: null",
  "target": "Kalimat penutup yang inspiratif dan realistis. Gambarkan masa depan yang bisa dicapai jika langkah-langkah di atas dijalankan — bungkus dengan kepercayaan dan dorongan, bukan sekadar menyebut angka target."
}

PENTING (nilai yang valid):
- urgencyLevel: "low" | "medium" | "high"
- priority: "critical" | "high" | "medium"
- psychInsight: string atau null`


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

// ─── JSON Sanitizer ───────────────────────────────────────────────────────────
// Some AI models wrap JSON in markdown code fences even when instructed not to.
// This strips ```json ... ``` or ``` ... ``` wrappers and trims whitespace.

function sanitizeJSON(raw: string): string {
  let cleaned = raw.trim()
  // Strip ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
  // If there's still leading/trailing non-JSON content, extract the JSON object
  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }
  return cleaned
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
      max_tokens: 3000,
      temperature: 0.55,
      response_format: { type: "json_object" },
    })

    // Guard: if output was truncated, fail fast with a clear error
    const finishReason = response.choices[0]?.finish_reason
    if (finishReason === "length") {
      console.error("[generateAIFeedback] Response truncated (finish_reason=length)")
      return { success: false, error: "Respons AI terpotong. Silakan coba lagi." }
    }

    const rawContent = response.choices[0]?.message?.content
    if (!rawContent) return { success: false, error: "Gagal mendapatkan respons." }

    // ── Sanitize: strip markdown code fences if present ──────────────────────
    const aiContent = sanitizeJSON(rawContent)

    // ── Validate: ensure it's parseable JSON ──────────────────────────────────
    try {
      JSON.parse(aiContent)
    } catch {
      console.error("[generateAIFeedback] AI returned non-JSON content:", aiContent.slice(0, 200))
      return { success: false, error: "AI mengembalikan format yang tidak valid. Silakan coba lagi." }
    }

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
