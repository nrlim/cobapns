export const SKB_BIDANG_PRESETS = [
  "Umum",
  "Administrasi Pemerintahan",
  "Arsip/Perpustakaan/Budaya",
  "Ekonomi/Perdagangan/Industri",
  "Hukum",
  "Keamanan & Pengawasan",
  "Kesehatan",
  "Keuangan",
  "Pendidikan",
  "Pertanian & Perikanan",
  "Sosial & Pemberdayaan",
  "Teknik & Infrastruktur",
  "Teknologi Informasi",
  "Transportasi",
] as const

export type SKBBidang = (typeof SKB_BIDANG_PRESETS)[number]

const POSITION_TO_BIDANG_RULES: Array<{ keywords: string[]; bidang: SKBBidang }> = [
  {
    bidang: "Kesehatan",
    keywords: ["dokter", "kesehatan", "medik", "perawat", "bidan", "apoteker", "farmasi", "terapis", "fisioterapis", "epidemiolog", "entomolog", "sanitarian", "gizi", "radiografer", "anestesi", "veteriner"],
  },
  {
    bidang: "Teknologi Informasi",
    keywords: ["komputer", "informatika", "database", "data ilmiah", "telekomunikasi", "manggala informatika", "sistem informasi", "teknologi pembelajaran", "siaran"],
  },
  {
    bidang: "Hukum",
    keywords: ["hukum", "jaksa", "peradilan", "legislatif", "keimigrasian", "kekayaan intelektual", "mediator", "kurator keperdataan", "perundang", "dokumentalis hukum"],
  },
  {
    bidang: "Keuangan",
    keywords: ["anggaran", "keuangan", "pajak", "bea", "cukai", "perbendaharaan", "apbn", "barang milik", "penilai", "account representative", "pembiayaan", "transaksi keuangan", "juru sita keuangan"],
  },
  {
    bidang: "Pendidikan",
    keywords: ["guru", "dosen", "widyaiswara", "widyaprada", "instruktur", "edukator", "pelatih", "pembelajaran"],
  },
  {
    bidang: "Pertanian & Perikanan",
    keywords: ["pertanian", "perikanan", "karantina", "pangan", "akuakultur", "perkebun", "penyuluh perikanan", "penyuluh pertanian", "kelautan", "kehutanan", "hasil hutan", "benih", "hama"],
  },
  {
    bidang: "Transportasi",
    keywords: ["kapal", "mualim", "masinis", "kelasi", "juru mudi", "juru mesin", "juru minyak", "jenang", "kasab", "markonis", "mandor mesin", "vts", "penerbangan", "udara", "bandar udara", "kereta", "perkeretaapian", "transportasi", "navigasi"],
  },
  {
    bidang: "Teknik & Infrastruktur",
    keywords: ["tambang", "migas", "minyak dan gas", "panas bumi", "ketenagalistrikan", "teknik", "pekerjaan umum", "infrastruktur", "kadastral", "metrolog", "perekayasa", "penguji", "prasarana", "sarana"],
  },
  {
    bidang: "Arsip/Perpustakaan/Budaya",
    keywords: ["arsip", "perpustakaan", "pustakawan", "kataloger", "filolog", "cagar budaya", "konservator", "museum", "buku", "penerjemah", "widyabasa", "kurator koleksi", "ilustrator", "editor"],
  },
  {
    bidang: "Keamanan & Pengawasan",
    keywords: ["intelijen", "pengamanan", "pertahanan", "polisi", "pemasyarakatan", "bela negara", "kebakaran", "penyelamat", "bencana", "pengawas", "auditor", "pemeriksa", "inspektur", "pengendali", "pemberantasan tindak pidana korupsi"],
  },
  {
    bidang: "Ekonomi/Perdagangan/Industri",
    keywords: ["perdagangan", "industri", "pariwisata", "ekonomi kreatif", "pasar", "standardisasi", "mutu", "konsultan industri", "usaha", "investasi"],
  },
  {
    bidang: "Sosial & Pemberdayaan",
    keywords: ["sosial", "adiksi", "rehabilitasi", "pemberdayaan", "kemasyarakatan", "konselor", "fasilitator", "pekerja sosial"],
  },
]

export function mapJabatanToBidang(jabatan?: string | null): SKBBidang {
  if (!jabatan) return "Umum"
  const normalized = jabatan.toLowerCase()
  for (const rule of POSITION_TO_BIDANG_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) return rule.bidang
  }
  return "Administrasi Pemerintahan"
}

export function isKnownSKBBidang(value: string): value is SKBBidang {
  return (SKB_BIDANG_PRESETS as readonly string[]).includes(value)
}
