export type Feature = {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
};

export const PLATFORM_FEATURES: Feature[] = [
  {
    id: "smart-cat",
    title: "Smart CAT Engine",
    description:
      "Sistem soal adaptif yang mensimulasikan ujian CPNS resmi BKN dengan bobot dan distribusi soal yang akurat.",
    icon: "BrainCircuit",
  },
  {
    id: "national-ranking",
    title: "Ranking Nasional",
    description:
      "Bandingkan skormu dengan peserta se-Indonesia secara real-time. Pantau posisimu di leaderboard nasional.",
    icon: "BarChart3",
  },
  {
    id: "deep-analytics",
    title: "Analitik Mendalam",
    description:
      "Lacak progres belajarmu dengan laporan detail per kategori soal: TWK, TIU, dan TKP.",
    icon: "LineChart",
  },
  {
    id: "time-analytics",
    title: "Time Analytics",
    description:
      "Ukur kecepatan dan akurasi menjawab per sub-kategori untuk mengidentifikasi bottleneck waktu ujianmu.",
    icon: "Timer",
  },
  {
    id: "ebook-materi",
    title: "E-Book & Materi",
    description:
      "Materi ringkas berbasis pola soal CPNS terbaru, tersedia dalam format PDF yang bisa diunduh dan dipelajari offline.",
    icon: "BookOpen",
  },
  {
    id: "ai-diagnostic",
    title: "AI Diagnostic",
    description:
      "Rekomendasi belajar berbasis AI yang disesuaikan dengan profil kelemahan dan kekuatan unik setiap peserta.",
    icon: "Sparkles",
  },
];

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Anisa Rahmawati",
    role: `Lulus CPNS Kementerian Keuangan ${new Date().getFullYear()}`,
    initials: "AR",
    scoreImprovement: "+127 poin",
    quote:
      "Sistem ranking nasional COBA PNS membuat saya selalu termotivasi. Saya bisa tahu persis di mana posisi saya dan apa yang harus diperbaiki.",
  },
  {
    id: "t2",
    name: "Budi Santoso",
    role: "Lulus CPNS Pemerintah Provinsi Jawa Barat",
    initials: "BS",
    scoreImprovement: "+89 poin",
    quote:
      "AI Diagnostic-nya luar biasa. Langsung tahu mana sub-materi yang harus saya fokuskan. Lebih efisien dari belajar sendiri.",
  },
  {
    id: "t3",
    name: "Clara Dewi Putri",
    role: "Lulus CPNS Badan Pemeriksa Keuangan",
    initials: "CD",
    scoreImprovement: "+203 poin",
    quote:
      "Dari skor 230 menjadi 433 dalam 3 bulan. Smart Shuffle Engine-nya benar-benar membantu saya menguasai pola soal yang sering keluar.",
  },
];
