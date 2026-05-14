export type PricingTier = {
  id: string;
  name: string;
  badge: string;
  badgeVariant: "default" | "featured" | "premium";
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free Access",
    badge: "Gratis",
    badgeVariant: "default",
    price: "Rp 0",
    priceNote: "Selamanya gratis",
    description: "Mulai latihan tanpa biaya. Ideal untuk eksplorasi platform.",
    features: [
      "1x Try Out CAT Resmi",
      "Analitik Dasar",
      "Akses 7 Hari",
      "Laporan Skor Singkat",
      "❌ Rekomendasi Belajar Personal Tidak Tersedia",
    ],
    cta: "Mulai Gratis",
    highlighted: false,
  },
  {
    id: "elite",
    name: "Elite Prep",
    badge: "Terpopuler",
    badgeVariant: "featured",
    price: "Rp 99.000",
    priceNote: "per bulan",
    description: "Untuk peserta serius yang ingin ranking teratas secara konsisten.",
    features: [
      "Unlimited Try Out CAT",
      "Smart Shuffle Engine",
      "Ranking Nasional Real-time",
      "Time Analytics per Sub-Kategori",
      "E-Book PDF Materi PNS",
      "Laporan Progres Mingguan",
      "✨ Rekomendasi Belajar Personal — 3x per bulan",
    ],
    cta: "Pilih Elite",
    highlighted: true,
  },
  {
    id: "master",
    name: "Master Strategy",
    badge: "Terbaik",
    badgeVariant: "premium",
    price: "Rp 149.000",
    priceNote: "per bulan",
    description: "Solusi komprehensif dengan panduan personal untuk memastikan kelulusan.",
    features: [
      "Semua fitur Elite Prep",
      "Video Series Eksklusif",
      "Deep Competitor Analytics",
      "Career Mapping & Panduan Karir",
      "Konsultasi Strategi Belajar",
      "Priority Support",
      "✨ Rekomendasi Belajar Personal — 10x per bulan",
    ],
    cta: "Pilih Master",
    highlighted: false,
  },
];

export const PLATFORM_STATS = [
  { value: "50.000+", label: "Peserta Aktif" },
  { value: "1.2 Juta+", label: "Soal Dikerjakan" },
  { value: "89%", label: "Tingkat Kelulusan" },
];
