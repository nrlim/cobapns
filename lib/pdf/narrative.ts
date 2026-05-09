/**
 * PDF Narrative Engine
 * Converts raw numeric data into professional Indonesian-language narrative text.
 */

// ─── IQ Narrative ────────────────────────────────────────────────────────────

export const IQ_BANDS = [
  { min: 130, label: "Sangat Superior",     advice: "Kemampuan kognitif Anda berada di level tertinggi. Fokus pada posisi yang membutuhkan analisis kompleks dan pengambilan keputusan strategis." },
  { min: 120, label: "Superior",            advice: "Anda memiliki kecerdasan yang jauh di atas rata-rata. Pertimbangkan jabatan teknis tinggi atau posisi kepemimpinan berbasis data." },
  { min: 110, label: "Di Atas Rata-rata",   advice: "Kemampuan intelektual Anda kuat. Tingkatkan kecepatan pemecahan masalah untuk bersaing di posisi kompetitif." },
  { min: 90,  label: "Rata-rata",           advice: "Skor Anda berada di kisaran normal nasional. Fokus pada latihan soal logika dan numerik intensif untuk meningkatkan performa." },
  { min: 80,  label: "Di Bawah Rata-rata",  advice: "Prioritaskan latihan harian di sub-tes Numerik dan Logika. Konsistensi berlatih selama 30–60 menit per hari akan signifikan." },
  { min: 0,   label: "Perlu Peningkatan",   advice: "Mulai dengan materi dasar secara bertahap. Gunakan fitur Diagnostic Roadmap untuk mendapatkan jalur belajar yang dipersonalisasi." },
]

export function getIQBand(iq: number) {
  return IQ_BANDS.find(b => iq >= b.min) ?? IQ_BANDS[IQ_BANDS.length - 1]
}

export function getSubTestNarrative(label: string, raw: number, total: number): string {
  const pct = (raw / total) * 100
  if (pct >= 85) return `${label}: Sangat baik (${raw}/${total}). Pertahankan performa ini.`
  if (pct >= 65) return `${label}: Cukup baik (${raw}/${total}). Masih ada ruang untuk peningkatan.`
  return `${label}: Perlu perhatian khusus (${raw}/${total}). Intensifkan latihan di sub-tes ini.`
}

// ─── Tryout Score Narrative ───────────────────────────────────────────────────

export function getTryoutNarrative(
  scoreTWK: number, passingTWK: number,
  scoreTIU: number, passingTIU: number,
  scoreTKP: number, passingTKP: number,
  overallPass: boolean
): { headline: string; details: string[]; recommendation: string } {
  const details: string[] = []
  if (scoreTWK < passingTWK)
    details.push(`TWK (${scoreTWK}/${passingTWK}): Di bawah ambang batas. Perkuat pemahaman materi Pancasila, UUD 1945, dan Wawasan Kebangsaan.`)
  else
    details.push(`TWK (${scoreTWK}/${passingTWK}): Lulus. Pertahankan kemampuan ini.`)
  
  if (scoreTIU < passingTIU)
    details.push(`TIU (${scoreTIU}/${passingTIU}): Di bawah ambang batas. Fokus pada latihan logika analitis, numerik, dan verbal intensif.`)
  else
    details.push(`TIU (${scoreTIU}/${passingTIU}): Lulus. Terus tingkatkan kecepatan pengerjaan.`)
  
  if (scoreTKP < passingTKP)
    details.push(`TKP (${scoreTKP}/${passingTKP}): Di bawah ambang batas. Pahami nilai-nilai dasar ASN dan situasional judgment dengan lebih mendalam.`)
  else
    details.push(`TKP (${scoreTKP}/${passingTKP}): Lulus. Profil kepribadian ASN Anda sudah kuat.`)

  return {
    headline: overallPass
      ? "Selamat! Anda memenuhi semua ambang batas kelulusan SKD."
      : "Anda belum memenuhi seluruh ambang batas SKD. Teruslah berlatih.",
    details,
    recommendation: overallPass
      ? "Lanjutkan persiapan ke tahap SKB. Pelajari materi kompetensi teknis jabatan yang Anda incar."
      : `Saran: Prioritaskan sesi latihan intensif pada sub-materi yang belum lulus. Gunakan fitur Try Out tematik di platform COBA PNS untuk latihan terfokus.`,
  }
}

// ─── Personality Narrative ────────────────────────────────────────────────────

export const PERSONALITY_NARRATIVES: Record<string, {
  tagline: string
  description: string
  strengths: string[]
  growthAreas: string[]
}> = {
  Analyst: {
    tagline: "Pemikir Logis & Terstruktur",
    description: "Anda cenderung memecahkan masalah secara sistematis dengan pendekatan berbasis data dan fakta. Kemampuan analitis yang tinggi menjadi keunggulan utama Anda dalam lingkungan kerja yang membutuhkan ketelitian.",
    strengths: ["Analitis mendalam", "Pengambilan keputusan berbasis data", "Konsistensi kerja tinggi"],
    growthAreas: ["Komunikasi interpersonal", "Fleksibilitas dalam perubahan", "Kerja tim lintas disiplin"],
  },
  Diplomat: {
    tagline: "Kolaborator & Pemersatu",
    description: "Anda memiliki empati tinggi dan kemampuan alami untuk membangun konsensus antar tim. Peran mediator dan koordinator sangat sesuai dengan profil kepribadian Anda.",
    strengths: ["Empati dan komunikasi", "Membangun relasi", "Resolusi konflik"],
    growthAreas: ["Ketegasan dalam pengambilan keputusan", "Manajemen prioritas individuell"],
  },
  Sentinel: {
    tagline: "Pelaksana Andal & Disiplin",
    description: "Anda adalah tipe individu yang sangat dapat diandalkan, disiplin, dan terorganisir. Kemampuan Anda untuk mengeksekusi rencana secara konsisten adalah aset besar di birokrasi PNS.",
    strengths: ["Disiplin tinggi", "Loyalitas", "Eksekusi rencana yang konsisten"],
    growthAreas: ["Kreativitas dalam problem solving", "Adaptasi terhadap perubahan cepat"],
  },
  Explorer: {
    tagline: "Inovator & Pemikir Bebas",
    description: "Anda kreatif, adaptif, dan selalu mencari cara baru dalam menyelesaikan masalah. Lingkungan kerja yang dinamis dan memberikan otonomi akan memaksimalkan potensi Anda.",
    strengths: ["Kreativitas", "Adaptabilitas", "Pemikiran out-of-the-box"],
    growthAreas: ["Konsistensi tugas jangka panjang", "Mengikuti prosedur baku"],
  },
  Generalist: {
    tagline: "Profil Multidimensi & Seimbang",
    description: "Anda memiliki profil kepribadian yang seimbang antara berbagai dimensi. Fleksibilitas ini membuat Anda adaptif di berbagai lingkungan kerja dan peran organisasi.",
    strengths: ["Fleksibilitas peran", "Keseimbangan emosional", "Adaptasi lingkungan"],
    growthAreas: ["Mengembangkan spesialisasi unik", "Menonjolkan keunggulan kompetitif"],
  },
}

// ─── Career Mapping Logic ──────────────────────────────────────────────────────

export function generateCareerSuggestions(
  personalityType: string,
  iqScore: number,
  integrity: number,
  teamwork: number
): { positions: string[]; instansi: string[]; rationale: string } {
  const positions: string[] = []
  const instansi: string[] = []

  const highIQ = iqScore >= 110
  const highIntegrity = integrity >= 70
  const highTeamwork = teamwork >= 70

  // Logic-based career matrix
  if (personalityType === "Analyst" && highIQ) {
    positions.push("Analis Kebijakan", "Auditor Internal", "Perencana Litbang")
    instansi.push("BAPPENAS", "BPK RI", "Kementerian Keuangan")
  } else if (personalityType === "Analyst") {
    positions.push("Pranata Komputer", "Analis Data", "Verifikator")
    instansi.push("BPJS Kesehatan", "Kementerian Kominfo", "BPS RI")
  }

  if (personalityType === "Diplomat" && highTeamwork) {
    positions.push("Penyuluh Sosial", "Mediator Hubungan Industrial", "Pranata Humas")
    instansi.push("Kementerian Sosial", "Kemenaker RI", "Kementerian PANRB")
  } else if (personalityType === "Diplomat") {
    positions.push("Administrasi Umum", "Pengelola Hubungan Masyarakat")
    instansi.push("Setjen DPR RI", "Pemda Provinsi")
  }

  if (personalityType === "Sentinel" && highIntegrity) {
    positions.push("Pemeriksa Pajak", "Inspektur Keimigrasian", "Pengawas")
    instansi.push("DJP Kemenkeu", "Ditjen Imigrasi", "BPOM RI")
  }

  if (personalityType === "Explorer") {
    positions.push("Perekayasa", "Peneliti Muda", "Analis Inovasi")
    instansi.push("BRIN", "Kementerian PUPR", "BPPT")
  }

  // Fallback
  if (positions.length === 0) {
    positions.push("Pengelola Pengadaan", "Analis SDM", "Administrasi Pemerintahan")
    instansi.push("Kementerian PANRB", "BKN RI", "LAN RI")
  }

  const rationale = `Rekomendasi dihasilkan berdasarkan tipe kepribadian ${personalityType}, skor IQ ${iqScore} (${getIQBand(iqScore).label}), integritas ${Math.round(integrity)}%, dan kerja tim ${Math.round(teamwork)}%.`

  return {
    positions: positions.slice(0, 5),
    instansi: instansi.slice(0, 4),
    rationale,
  }
}
