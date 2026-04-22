/**
 * prisma/seed-psych-iq.ts
 * Bank soal Psikotes & IQ – seeder untuk default questions
 * Jalankan: npx tsx prisma/seed-psych-iq.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ─── Psych Questions (50 soal, 8 dimensi) ─────────────────────────────────────

const PSYCH_QUESTIONS = [
  // ── Openness (7 soal) ────────────────────────────────────────────────────────
  {
    text: "Saya senang mencoba pendekatan baru ketika menghadapi masalah yang belum pernah saya temui sebelumnya.",
    dimension: "openness",
    dimensionLabel: "Keterbukaan",
    order: 1,
  },
  {
    text: "Saya tertarik untuk mempelajari hal-hal di luar bidang tugas utama saya demi memperluas wawasan.",
    dimension: "openness",
    dimensionLabel: "Keterbukaan",
    order: 2,
  },
  {
    text: "Saya lebih suka cara kerja yang sudah terbukti daripada mencoba metode yang belum familiar bagi saya.",
    dimension: "openness",
    dimensionLabel: "Keterbukaan",
    order: 3,
  },
  {
    text: "Saya aktif mengikuti perkembangan tren dan inovasi yang relevan dengan pekerjaan saya.",
    dimension: "openness",
    dimensionLabel: "Keterbukaan",
    order: 4,
  },
  {
    text: "Saya merasa bersemangat ketika diajak berdiskusi tentang ide-ide yang belum pernah dicoba sebelumnya.",
    dimension: "openness",
    dimensionLabel: "Keterbukaan",
    order: 5,
  },
  {
    text: "Saya lebih menyukai rutinitas yang teratur daripada perubahan yang terus-menerus.",
    dimension: "openness",
    dimensionLabel: "Keterbukaan",
    order: 6,
  },
  {
    text: "Saya percaya bahwa belajar dari pengalaman orang lain di luar organisasi saya sangat bermanfaat.",
    dimension: "openness",
    dimensionLabel: "Keterbukaan",
    order: 7,
  },

  // ── Conscientiousness (7 soal) ───────────────────────────────────────────────
  {
    text: "Saya selalu menyelesaikan tugas sesuai tenggat waktu yang ditetapkan, bahkan di bawah tekanan.",
    dimension: "conscientiousness",
    dimensionLabel: "Kedisiplinan",
    order: 8,
  },
  {
    text: "Sebelum memulai pekerjaan, saya selalu membuat rencana dan daftar prioritas secara terstruktur.",
    dimension: "conscientiousness",
    dimensionLabel: "Kedisiplinan",
    order: 9,
  },
  {
    text: "Saya sering menunda pekerjaan karena sulit memulainya atau kurang termotivasi.",
    dimension: "conscientiousness",
    dimensionLabel: "Kedisiplinan",
    order: 10,
  },
  {
    text: "Saya memeriksa kembali pekerjaan saya untuk memastikan tidak ada kesalahan sebelum diserahkan.",
    dimension: "conscientiousness",
    dimensionLabel: "Kedisiplinan",
    order: 11,
  },
  {
    text: "Saya menjaga tempat kerja dan dokumen saya tetap teratur dan mudah ditemukan.",
    dimension: "conscientiousness",
    dimensionLabel: "Kedisiplinan",
    order: 12,
  },
  {
    text: "Saya kesulitan mempertahankan fokus pada satu pekerjaan apabila ada banyak gangguan.",
    dimension: "conscientiousness",
    dimensionLabel: "Kedisiplinan",
    order: 13,
  },
  {
    text: "Saya bertanggung jawab penuh terhadap setiap tugas yang saya emban hingga selesai.",
    dimension: "conscientiousness",
    dimensionLabel: "Kedisiplinan",
    order: 14,
  },

  // ── Extraversion (6 soal) ────────────────────────────────────────────────────
  {
    text: "Saya merasa bersemangat dan berenergi saat bekerja dalam tim atau lintas unit.",
    dimension: "extraversion",
    dimensionLabel: "Ekstraversi",
    order: 15,
  },
  {
    text: "Saya tidak segan untuk memulai percakapan dengan kolega baru atau pimpinan dalam forum resmi.",
    dimension: "extraversion",
    dimensionLabel: "Ekstraversi",
    order: 16,
  },
  {
    text: "Saya lebih produktif saat bekerja sendiri tanpa banyak interaksi dengan orang lain.",
    dimension: "extraversion",
    dimensionLabel: "Ekstraversi",
    order: 17,
  },
  {
    text: "Saya menikmati menjadi pusat perhatian dalam presentasi atau rapat besar.",
    dimension: "extraversion",
    dimensionLabel: "Ekstraversi",
    order: 18,
  },
  {
    text: "Saya mudah menjalin hubungan baik dengan orang yang baru saya kenal.",
    dimension: "extraversion",
    dimensionLabel: "Ekstraversi",
    order: 19,
  },
  {
    text: "Interaksi sosial yang berlebihan cenderung membuat saya merasa kelelahan.",
    dimension: "extraversion",
    dimensionLabel: "Ekstraversi",
    order: 20,
  },

  // ── Agreeableness (6 soal) ───────────────────────────────────────────────────
  {
    text: "Saya memprioritaskan kepentingan organisasi di atas kepentingan pribadi saat mengambil keputusan.",
    dimension: "agreeableness",
    dimensionLabel: "Keramahan",
    order: 21,
  },
  {
    text: "Saya merasa puas ketika bisa membantu rekan kerja mengatasi kesulitan dalam pekerjaannya.",
    dimension: "agreeableness",
    dimensionLabel: "Keramahan",
    order: 22,
  },
  {
    text: "Saya mudah berempati terhadap kondisi yang dihadapi masyarakat dan berusaha memberikan pelayanan terbaik.",
    dimension: "agreeableness",
    dimensionLabel: "Keramahan",
    order: 23,
  },
  {
    text: "Saya lebih suka bekerja sama daripada bersaing dengan rekan kerja.",
    dimension: "agreeableness",
    dimensionLabel: "Keramahan",
    order: 24,
  },
  {
    text: "Saya selalu berusaha mempertimbangkan perasaan orang lain sebelum mengambil tindakan.",
    dimension: "agreeableness",
    dimensionLabel: "Keramahan",
    order: 25,
  },
  {
    text: "Saya kadang merasa sulit untuk menyetujui pendapat orang lain meskipun mereka benar.",
    dimension: "agreeableness",
    dimensionLabel: "Keramahan",
    order: 26,
  },

  // ── Neuroticism (6 soal) ─────────────────────────────────────────────────────
  {
    text: "Saya sering merasa gelisah atau khawatir ketika mengemban tanggung jawab yang besar.",
    dimension: "neuroticism",
    dimensionLabel: "Stabilitas Emosi",
    order: 27,
  },
  {
    text: "Kritik atau tekanan dari atasan membuat saya mudah kehilangan motivasi.",
    dimension: "neuroticism",
    dimensionLabel: "Stabilitas Emosi",
    order: 28,
  },
  {
    text: "Saya mampu bersikap tenang dan rasional meski berada dalam situasi yang penuh tekanan.",
    dimension: "neuroticism",
    dimensionLabel: "Stabilitas Emosi",
    order: 29,
  },
  {
    text: "Perasaan cemas saya kadang muncul bahkan saat tidak ada ancaman nyata.",
    dimension: "neuroticism",
    dimensionLabel: "Stabilitas Emosi",
    order: 30,
  },
  {
    text: "Saya mudah terpengaruh oleh suasana hati orang-orang di sekitar saya.",
    dimension: "neuroticism",
    dimensionLabel: "Stabilitas Emosi",
    order: 31,
  },
  {
    text: "Saya dapat pulih dengan cepat dari kekecewaan atau kegagalan.",
    dimension: "neuroticism",
    dimensionLabel: "Stabilitas Emosi",
    order: 32,
  },

  // ── Integrity (6 soal) ───────────────────────────────────────────────────────
  {
    text: "Saya akan melaporkan pelanggaran prosedur yang saya temukan meski pelakunya adalah rekan dekat saya.",
    dimension: "integrity",
    dimensionLabel: "Integritas",
    order: 33,
  },
  {
    text: "Saya berpegang teguh pada aturan dan etika profesi bahkan ketika tidak ada yang mengawasi.",
    dimension: "integrity",
    dimensionLabel: "Integritas",
    order: 34,
  },
  {
    text: "Ada kalanya membenarkan tindakan yang sedikit menyimpang dari aturan demi hasil yang lebih baik.",
    dimension: "integrity",
    dimensionLabel: "Integritas",
    order: 35,
  },
  {
    text: "Saya selalu transparan dalam memberikan informasi kepada atasan dan rekan kerja.",
    dimension: "integrity",
    dimensionLabel: "Integritas",
    order: 36,
  },
  {
    text: "Saya menolak pemberian atau gratifikasi meski dalam jumlah kecil dari pihak luar.",
    dimension: "integrity",
    dimensionLabel: "Integritas",
    order: 37,
  },
  {
    text: "Saya tidak ragu mengungkapkan pendapat yang berbeda dari mayoritas jika saya yakin itu benar.",
    dimension: "integrity",
    dimensionLabel: "Integritas",
    order: 38,
  },

  // ── Stress Resilience (6 soal) ───────────────────────────────────────────────
  {
    text: "Ketika beban kerja meningkat drastis, saya tetap dapat menjaga kualitas output saya.",
    dimension: "stressResilience",
    dimensionLabel: "Ketahanan Stres",
    order: 39,
  },
  {
    text: "Saya memiliki strategi yang efektif untuk pulih secara mental setelah menghadapi situasi sulit.",
    dimension: "stressResilience",
    dimensionLabel: "Ketahanan Stres",
    order: 40,
  },
  {
    text: "Stres kerja yang berkepanjangan sering memengaruhi kesehatan fisik maupun mental saya secara signifikan.",
    dimension: "stressResilience",
    dimensionLabel: "Ketahanan Stres",
    order: 41,
  },
  {
    text: "Saya mampu mengelola beberapa pekerjaan sekaligus tanpa kehilangan konsentrasi.",
    dimension: "stressResilience",
    dimensionLabel: "Ketahanan Stres",
    order: 42,
  },
  {
    text: "Saat menghadapi konflik di tempat kerja, saya dapat mengendalikan reaksi emosional saya.",
    dimension: "stressResilience",
    dimensionLabel: "Ketahanan Stres",
    order: 43,
  },
  {
    text: "Tekanan dari deadline yang ketat membuat saya lebih fokus dan produktif.",
    dimension: "stressResilience",
    dimensionLabel: "Ketahanan Stres",
    order: 44,
  },

  // ── Teamwork (6 soal) ────────────────────────────────────────────────────────
  {
    text: "Saya secara aktif berbagi informasi dan pengetahuan dengan anggota tim untuk mencapai tujuan bersama.",
    dimension: "teamwork",
    dimensionLabel: "Kerja Sama Tim",
    order: 45,
  },
  {
    text: "Saya menghargai perbedaan pendapat dalam rapat dan menganggapnya sebagai sumber ide yang berharga.",
    dimension: "teamwork",
    dimensionLabel: "Kerja Sama Tim",
    order: 46,
  },
  {
    text: "Ketika proyek tim gagal, saya bersedia mengambil bagian dari tanggung jawab meski bukan kesalahan saya.",
    dimension: "teamwork",
    dimensionLabel: "Kerja Sama Tim",
    order: 47,
  },
  {
    text: "Saya lebih suka mengerjakan tugas secara mandiri daripada bergantung pada tim.",
    dimension: "teamwork",
    dimensionLabel: "Kerja Sama Tim",
    order: 48,
  },
  {
    text: "Saya selalu mendukung anggota tim yang sedang kesulitan, bahkan jika itu bukan tanggung jawab saya.",
    dimension: "teamwork",
    dimensionLabel: "Kerja Sama Tim",
    order: 49,
  },
  {
    text: "Saya percaya bahwa keberhasilan tim lebih penting dari keberhasilan individual.",
    dimension: "teamwork",
    dimensionLabel: "Kerja Sama Tim",
    order: 50,
  },
]

// ─── IQ Questions ─────────────────────────────────────────────────────────────

// VERBAL (20 soal)
const IQ_VERBAL = [
  {
    text: "Pilih kata yang paling tepat untuk melengkapi: 'Panas' adalah lawan dari ___.",
    options: [{ key: "A", label: "Terang" }, { key: "B", label: "Dingin" }, { key: "C", label: "Basah" }, { key: "D", label: "Gelap" }, { key: "E", label: "Tinggi" }],
    answerKey: "B", order: 1,
  },
  {
    text: "Kata yang memiliki arti paling mendekati 'Integritas' adalah:",
    options: [{ key: "A", label: "Keberanian" }, { key: "B", label: "Kecerdasan" }, { key: "C", label: "Kejujuran" }, { key: "D", label: "Kerajinan" }, { key: "E", label: "Kesopanan" }],
    answerKey: "C", order: 2,
  },
  {
    text: "Sapi : Kandang = Tahanan : ___",
    options: [{ key: "A", label: "Pengadilan" }, { key: "B", label: "Penjara" }, { key: "C", label: "Polisi" }, { key: "D", label: "Hakim" }, { key: "E", label: "Hukuman" }],
    answerKey: "B", order: 3,
  },
  {
    text: "Manakah kata yang TIDAK sejenis dengan yang lain?",
    options: [{ key: "A", label: "Merah" }, { key: "B", label: "Biru" }, { key: "C", label: "Segitiga" }, { key: "D", label: "Hijau" }, { key: "E", label: "Kuning" }],
    answerKey: "C", order: 4,
  },
  {
    text: "Pilih pasangan kata yang benar: ___ : Membaca = Pensil : ___",
    options: [{ key: "A", label: "Buku : Menulis" }, { key: "B", label: "Perpustakaan : Kertas" }, { key: "C", label: "Tinta : Pena" }, { key: "D", label: "Majalah : Lukisan" }, { key: "E", label: "Koran : Cat" }],
    answerKey: "A", order: 5,
  },
  {
    text: "Antonim dari 'Abadi' adalah:",
    options: [{ key: "A", label: "Kekal" }, { key: "B", label: "Fana" }, { key: "C", label: "Besar" }, { key: "D", label: "Sejati" }, { key: "E", label: "Luhur" }],
    answerKey: "B", order: 6,
  },
  {
    text: "Guru : Mengajar = Dokter : ___",
    options: [{ key: "A", label: "Rumah Sakit" }, { key: "B", label: "Menyembuhkan" }, { key: "C", label: "Obat" }, { key: "D", label: "Pasien" }, { key: "E", label: "Laboratorium" }],
    answerKey: "B", order: 7,
  },
  {
    text: "Manakah kalimat yang menggunakan sinonim dari kata 'Inovatif'?",
    options: [{ key: "A", label: "Dia sangat tradisional dalam bekerja" }, { key: "B", label: "Solusinya sangat kreatif dan baru" }, { key: "C", label: "Laporan itu ditulis dengan rapi" }, { key: "D", label: "Hasil kerjanya memenuhi standar minimum" }, { key: "E", label: "Ia selalu taat pada prosedur lama" }],
    answerKey: "B", order: 8,
  },
  {
    text: "'Efisien' paling tepat diartikan sebagai:",
    options: [{ key: "A", label: "Melakukan pekerjaan tanpa peduli hasilnya" }, { key: "B", label: "Menggunakan sumber daya minimal untuk hasil optimal" }, { key: "C", label: "Bekerja keras tanpa istirahat" }, { key: "D", label: "Menyelesaikan banyak pekerjaan sekaligus" }, { key: "E", label: "Mengikuti prosedur dengan ketat" }],
    answerKey: "B", order: 9,
  },
  {
    text: "Kepala : Topi = Kaki : ___",
    options: [{ key: "A", label: "Lantai" }, { key: "B", label: "Kaos kaki" }, { key: "C", label: "Sarung tangan" }, { key: "D", label: "Sandal" }, { key: "E", label: "Tangan" }],
    answerKey: "D", order: 10,
  },
  {
    text: "Manakah kata yang bermakna paling NEGATIF?",
    options: [{ key: "A", label: "Bijaksana" }, { key: "B", label: "Koruptif" }, { key: "C", label: "Responsif" }, { key: "D", label: "Inovatif" }, { key: "E", label: "Akuntabel" }],
    answerKey: "B", order: 11,
  },
  {
    text: "Laut : Ikan = Hutan : ___",
    options: [{ key: "A", label: "Batu" }, { key: "B", label: "Sungai" }, { key: "C", label: "Pohon" }, { key: "D", label: "Harimau" }, { key: "E", label: "Pasir" }],
    answerKey: "D", order: 12,
  },
  {
    text: "Manakah yang merupakan antonim 'Transparansi'?",
    options: [{ key: "A", label: "Keterbukaan" }, { key: "B", label: "Kejelasan" }, { key: "C", label: "Ketertutupan" }, { key: "D", label: "Kejujuran" }, { key: "E", label: "Akuntabilitas" }],
    answerKey: "C", order: 13,
  },
  {
    text: "Apa kata yang paling tepat untuk melengkapi: 'Seorang pemimpin yang baik memiliki ___ yang tinggi terhadap bawahannya.'",
    options: [{ key: "A", label: "Emosi" }, { key: "B", label: "Empati" }, { key: "C", label: "Ambisi" }, { key: "D", label: "Euforia" }, { key: "E", label: "Apati" }],
    answerKey: "B", order: 14,
  },
  {
    text: "Manakah kelompok kata yang PALING BERHUBUNGAN dengan pelayanan publik?",
    options: [{ key: "A", label: "Profitabilitas, Dividen, Saham" }, { key: "B", label: "Akuntabilitas, Transparansi, Integritas" }, { key: "C", label: "Aset, Liabilitas, Modal" }, { key: "D", label: "Produksi, Distribusi, Konsumsi" }, { key: "E", label: "Ekspor, Impor, Devisa" }],
    answerKey: "B", order: 15,
  },
  {
    text: "Sinonim dari kata 'Kapabel' adalah:",
    options: [{ key: "A", label: "Lemah" }, { key: "B", label: "Cepat" }, { key: "C", label: "Mampu" }, { key: "D", label: "Gagah" }, { key: "E", label: "Tegas" }],
    answerKey: "C", order: 16,
  },
  {
    text: "Air : Dahaga = Makanan : ___",
    options: [{ key: "A", label: "Masak" }, { key: "B", label: "Lapar" }, { key: "C", label: "Restoran" }, { key: "D", label: "Kenyang" }, { key: "E", label: "Meja" }],
    answerKey: "B", order: 17,
  },
  {
    text: "Manakah kata yang PALING TEPAT untuk melengkapi: 'Pegawai yang ___ akan selalu hadir tepat waktu.'",
    options: [{ key: "A", label: "Disiplin" }, { key: "B", label: "Kreatif" }, { key: "C", label: "Ambisius" }, { key: "D", label: "Komunikatif" }, { key: "E", label: "Ekstrovert" }],
    answerKey: "A", order: 18,
  },
  {
    text: "Antonim dari kata 'Proaktif' adalah:",
    options: [{ key: "A", label: "Aktif" }, { key: "B", label: "Pasif" }, { key: "C", label: "Reaktif" }, { key: "D", label: "Interaktif" }, { key: "E", label: "Dinamis" }],
    answerKey: "B", order: 19,
  },
  {
    text: "Singa : Rimba = Raja : ___",
    options: [{ key: "A", label: "Rakyat" }, { key: "B", label: "Istana" }, { key: "C", label: "Mahkota" }, { key: "D", label: "Kerajaan" }, { key: "E", label: "Tahta" }],
    answerKey: "D", order: 20,
  },
]

// NUMERIC (18 soal)
const IQ_NUMERIC = [
  {
    text: "Berapa hasil dari 15 × 8 − 47?",
    options: [{ key: "A", label: "73" }, { key: "B", label: "133" }, { key: "C", label: "120" }, { key: "D", label: "81" }, { key: "E", label: "76" }],
    answerKey: "A", order: 1,
  },
  {
    text: "Jika x + 7 = 19, maka 2x − 4 = ?",
    options: [{ key: "A", label: "20" }, { key: "B", label: "22" }, { key: "C", label: "24" }, { key: "D", label: "18" }, { key: "E", label: "26" }],
    answerKey: "A", order: 2,
  },
  {
    text: "Sebuah kereta menempuh 360 km dalam 4,5 jam. Berapa kecepatan rata-ratanya (km/jam)?",
    options: [{ key: "A", label: "70" }, { key: "B", label: "75" }, { key: "C", label: "80" }, { key: "D", label: "85" }, { key: "E", label: "90" }],
    answerKey: "C", order: 3,
  },
  {
    text: "Jika 30% dari suatu bilangan adalah 90, berapakah bilangan tersebut?",
    options: [{ key: "A", label: "270" }, { key: "B", label: "300" }, { key: "C", label: "330" }, { key: "D", label: "250" }, { key: "E", label: "280" }],
    answerKey: "B", order: 4,
  },
  {
    text: "Deret: 3, 6, 12, 24, ___. Angka selanjutnya adalah?",
    options: [{ key: "A", label: "36" }, { key: "B", label: "42" }, { key: "C", label: "48" }, { key: "D", label: "54" }, { key: "E", label: "60" }],
    answerKey: "C", order: 5,
  },
  {
    text: "Harga barang Rp250.000. Diskon 20%. Berapa harga setelah diskon?",
    options: [{ key: "A", label: "Rp180.000" }, { key: "B", label: "Rp190.000" }, { key: "C", label: "Rp200.000" }, { key: "D", label: "Rp210.000" }, { key: "E", label: "Rp220.000" }],
    answerKey: "C", order: 6,
  },
  {
    text: "3² + 4² = ___²",
    options: [{ key: "A", label: "5" }, { key: "B", label: "6" }, { key: "C", label: "7" }, { key: "D", label: "8" }, { key: "E", label: "9" }],
    answerKey: "A", order: 7,
  },
  {
    text: "Rata-rata dari 8, 12, 10, 14, 16 adalah:",
    options: [{ key: "A", label: "10" }, { key: "B", label: "11" }, { key: "C", label: "12" }, { key: "D", label: "13" }, { key: "E", label: "14" }],
    answerKey: "C", order: 8,
  },
  {
    text: "Jika p = 4 dan q = 3, maka p² + 2pq + q² = ?",
    options: [{ key: "A", label: "25" }, { key: "B", label: "49" }, { key: "C", label: "36" }, { key: "D", label: "42" }, { key: "E", label: "16" }],
    answerKey: "B", order: 9,
  },
  {
    text: "Sebuah pekerjaan dapat diselesaikan 8 orang dalam 6 hari. Berapa hari jika dikerjakan 12 orang?",
    options: [{ key: "A", label: "2" }, { key: "B", label: "3" }, { key: "C", label: "4" }, { key: "D", label: "5" }, { key: "E", label: "6" }],
    answerKey: "C", order: 10,
  },
  {
    text: "Deret: 1, 4, 9, 16, 25, ___",
    options: [{ key: "A", label: "30" }, { key: "B", label: "34" }, { key: "C", label: "36" }, { key: "D", label: "49" }, { key: "E", label: "35" }],
    answerKey: "C", order: 11,
  },
  {
    text: "Jika bunga tabungan 6% per tahun dan modal Rp5.000.000, bunga setelah 2 tahun adalah:",
    options: [{ key: "A", label: "Rp600.000" }, { key: "B", label: "Rp300.000" }, { key: "C", label: "Rp180.000" }, { key: "D", label: "Rp500.000" }, { key: "E", label: "Rp250.000" }],
    answerKey: "A", order: 12,
  },
  {
    text: "Deret Fibonacci: 1, 1, 2, 3, 5, 8, ___",
    options: [{ key: "A", label: "11" }, { key: "B", label: "12" }, { key: "C", label: "13" }, { key: "D", label: "15" }, { key: "E", label: "14" }],
    answerKey: "C", order: 13,
  },
  {
    text: "Sebuah kolam berbentuk lingkaran berdiameter 14 m. Berapa luas kolam? (π = 22/7)",
    options: [{ key: "A", label: "44 m²" }, { key: "B", label: "154 m²" }, { key: "C", label: "176 m²" }, { key: "D", label: "308 m²" }, { key: "E", label: "616 m²" }],
    answerKey: "B", order: 14,
  },
  {
    text: "Jika 5x = 3x + 14, maka x = ?",
    options: [{ key: "A", label: "5" }, { key: "B", label: "6" }, { key: "C", label: "7" }, { key: "D", label: "8" }, { key: "E", label: "9" }],
    answerKey: "C", order: 15,
  },
  {
    text: "Deret: 2, 6, 18, 54, ___",
    options: [{ key: "A", label: "108" }, { key: "B", label: "162" }, { key: "C", label: "216" }, { key: "D", label: "196" }, { key: "E", label: "144" }],
    answerKey: "B", order: 16,
  },
  {
    text: "Berapa persen 35 dari 140?",
    options: [{ key: "A", label: "15%" }, { key: "B", label: "20%" }, { key: "C", label: "25%" }, { key: "D", label: "30%" }, { key: "E", label: "35%" }],
    answerKey: "C", order: 17,
  },
  {
    text: "Sebuah truk menempuh 480 km dengan kecepatan rata-rata 60 km/jam. Berapa jam perjalanannya?",
    options: [{ key: "A", label: "6" }, { key: "B", label: "7" }, { key: "C", label: "8" }, { key: "D", label: "9" }, { key: "E", label: "10" }],
    answerKey: "C", order: 18,
  },
]

// LOGIC (18 soal)
const IQ_LOGIC = [
  {
    text: "Semua PNS wajib menjaga integritas. Ahmad adalah seorang PNS. Kesimpulan yang tepat adalah:",
    options: [{ key: "A", label: "Ahmad mungkin menjaga integritas" }, { key: "B", label: "Ahmad wajib menjaga integritas" }, { key: "C", label: "Ahmad tidak perlu menjaga integritas" }, { key: "D", label: "Tidak dapat disimpulkan" }, { key: "E", label: "Ahmad adalah manusia yang baik" }],
    answerKey: "B", order: 1,
  },
  {
    text: "Jika hari ini Senin, lusa adalah hari apa?",
    options: [{ key: "A", label: "Selasa" }, { key: "B", label: "Rabu" }, { key: "C", label: "Kamis" }, { key: "D", label: "Jumat" }, { key: "E", label: "Sabtu" }],
    answerKey: "B", order: 2,
  },
  {
    text: "Tidak semua pegawai yang rajin mendapatkan promosi. Budi adalah pegawai yang rajin. Kesimpulan yang PALING TEPAT:",
    options: [{ key: "A", label: "Budi pasti mendapat promosi" }, { key: "B", label: "Budi tidak mendapat promosi" }, { key: "C", label: "Budi mungkin mendapat atau tidak mendapat promosi" }, { key: "D", label: "Budi lebih baik dari pegawai lain" }, { key: "E", label: "Semua pegawai rajin mendapat promosi" }],
    answerKey: "C", order: 3,
  },
  {
    text: "A lebih tua dari B. B lebih tua dari C. D lebih tua dari A. Urutan dari termuda ke tertua adalah:",
    options: [{ key: "A", label: "C, B, A, D" }, { key: "B", label: "D, A, B, C" }, { key: "C", label: "C, A, B, D" }, { key: "D", label: "B, C, A, D" }, { key: "E", label: "A, B, C, D" }],
    answerKey: "A", order: 4,
  },
  {
    text: "Jika 'Semua X adalah Y' dan 'Tidak ada Y yang Z', maka:",
    options: [{ key: "A", label: "Beberapa X adalah Z" }, { key: "B", label: "Tidak ada X yang Z" }, { key: "C", label: "Semua X adalah Z" }, { key: "D", label: "Beberapa Z adalah X" }, { key: "E", label: "Tidak dapat disimpulkan" }],
    answerKey: "B", order: 5,
  },
  {
    text: "Dalam 5 hari berturut-turut, Rina masuk kantor pada hari ganjil (Senin, Rabu, Jumat) dan izin pada hari genap. Hari ini Rabu. Berapa hari lagi dia akan izin berikutnya?",
    options: [{ key: "A", label: "1 hari" }, { key: "B", label: "2 hari" }, { key: "C", label: "3 hari" }, { key: "D", label: "4 hari" }, { key: "E", label: "5 hari" }],
    answerKey: "A", order: 6,
  },
  {
    text: "Jika hanya pemimpin yang bervisi yang bisa membawa perubahan, dan Pak Rudi tidak bisa membawa perubahan, maka:",
    options: [{ key: "A", label: "Pak Rudi adalah pemimpin" }, { key: "B", label: "Pak Rudi tidak bervisi" }, { key: "C", label: "Pak Rudi bukan pemimpin atau tidak bervisi" }, { key: "D", label: "Perubahan hanya bisa dibawa oleh Pak Rudi" }, { key: "E", label: "Tidak dapat disimpulkan" }],
    answerKey: "C", order: 7,
  },
  {
    text: "Sebuah kantor buka Senin-Jumat, tutup Sabtu-Minggu. Tanggal 1 Maret adalah Senin. Tanggal 15 Maret jatuh pada hari apa?",
    options: [{ key: "A", label: "Senin" }, { key: "B", label: "Selasa" }, { key: "C", label: "Rabu" }, { key: "D", label: "Kamis" }, { key: "E", label: "Jumat" }],
    answerKey: "C", order: 8,
  },
  {
    text: "Semua aparatur yang transparan dipercaya rakyat. Sebagian aparatur tidak dipercaya rakyat. Kesimpulan?",
    options: [{ key: "A", label: "Semua aparatur transparan" }, { key: "B", label: "Sebagian aparatur tidak transparan" }, { key: "C", label: "Tidak ada aparatur yang transparan" }, { key: "D", label: "Rakyat tidak mempercayai siapapun" }, { key: "E", label: "Sebagian rakyat transparan" }],
    answerKey: "B", order: 9,
  },
  {
    text: "P ⇒ Q, ¬Q, maka:",
    options: [{ key: "A", label: "P benar" }, { key: "B", label: "¬P (P salah)" }, { key: "C", label: "P dan Q keduanya benar" }, { key: "D", label: "Tidak dapat disimpulkan" }, { key: "E", label: "Q bisa benar atau salah" }],
    answerKey: "B", order: 10,
  },
  {
    text: "Empat instansi A, B, C, D mendapat anggaran berturut-turut. A mendapat lebih dari C. D mendapat lebih dari A. B mendapat kurang dari C. Urutan anggaran terbesar ke terkecil?",
    options: [{ key: "A", label: "D, A, C, B" }, { key: "B", label: "A, D, C, B" }, { key: "C", label: "D, C, A, B" }, { key: "D", label: "B, C, A, D" }, { key: "E", label: "D, B, A, C" }],
    answerKey: "A", order: 11,
  },
  {
    text: "Jika semua mahasiswa belajar keras lulus ujian, dan Rini tidak lulus ujian, maka:",
    options: [{ key: "A", label: "Rini adalah mahasiswa" }, { key: "B", label: "Rini belajar keras" }, { key: "C", label: "Rini tidak belajar keras" }, { key: "D", label: "Semua mahasiswa gagal" }, { key: "E", label: "Tidak dapat disimpulkan" }],
    answerKey: "C", order: 12,
  },
  {
    text: "Pola: 2, 5, 10, 17, 26, ___",
    options: [{ key: "A", label: "35" }, { key: "B", label: "37" }, { key: "C", label: "38" }, { key: "D", label: "36" }, { key: "E", label: "40" }],
    answerKey: "B", order: 13,
  },
  {
    text: "Kata dalam kurung melengkapi kalimat: Lebih baik mencegah (... ) daripada mengobati.",
    options: [{ key: "A", label: "penyakit" }, { key: "B", label: "luka" }, { key: "C", label: "kematian" }, { key: "D", label: "kebakaran" }, { key: "E", label: "kesialan" }],
    answerKey: "A", order: 14,
  },
  {
    text: "Lima orang duduk berjajar: P di sebelah kiri Q, R di sebelah kiri P, S di sebelah kanan Q, T berada di ujung kanan. Urutan dari kiri ke kanan adalah:",
    options: [{ key: "A", label: "R, P, Q, S, T" }, { key: "B", label: "T, S, Q, P, R" }, { key: "C", label: "R, Q, P, S, T" }, { key: "D", label: "P, R, Q, S, T" }, { key: "E", label: "S, Q, P, R, T" }],
    answerKey: "A", order: 15,
  },
  {
    text: "Beberapa guru adalah sarjana. Semua sarjana pintar. Maka:",
    options: [{ key: "A", label: "Semua guru pintar" }, { key: "B", label: "Beberapa guru pintar" }, { key: "C", label: "Tidak ada guru yang pintar" }, { key: "D", label: "Beberapa sarjana adalah guru" }, { key: "E", label: "Jawaban A dan B keduanya benar" }],
    answerKey: "B", order: 16,
  },
  {
    text: "Pola: 1, 3, 7, 15, 31, ___",
    options: [{ key: "A", label: "57" }, { key: "B", label: "61" }, { key: "C", label: "63" }, { key: "D", label: "65" }, { key: "E", label: "67" }],
    answerKey: "C", order: 17,
  },
  {
    text: "Semua K adalah L. Beberapa L adalah M. Kesimpulan yang PASTI BENAR:",
    options: [{ key: "A", label: "Semua K adalah M" }, { key: "B", label: "Beberapa K adalah M" }, { key: "C", label: "Tidak ada K yang M" }, { key: "D", label: "Tidak dapat disimpulkan apakah K adalah M" }, { key: "E", label: "Semua M adalah K" }],
    answerKey: "D", order: 18,
  },
]

// SPATIAL (16 soal)
const IQ_SPATIAL = [
  {
    text: "Sebuah kubus dilukis merah di semua sisi, lalu dipotong menjadi 27 kubus kecil sama besar. Berapa kubus kecil yang memiliki TEPAT 2 sisi merah?",
    options: [{ key: "A", label: "8" }, { key: "B", label: "12" }, { key: "C", label: "6" }, { key: "D", label: "1" }, { key: "E", label: "24" }],
    answerKey: "B", order: 1,
  },
  {
    text: "Jika sebuah peta menggunakan skala 1:50.000, dan jarak di peta adalah 6 cm, berapa jarak sebenarnya (km)?",
    options: [{ key: "A", label: "1 km" }, { key: "B", label: "2 km" }, { key: "C", label: "3 km" }, { key: "D", label: "4 km" }, { key: "E", label: "6 km" }],
    answerKey: "C", order: 2,
  },
  {
    text: "Sebuah segitiga sama sisi memiliki keliling 36 cm. Berapa luas segitiga tersebut? (√3 ≈ 1,73)",
    options: [{ key: "A", label: "54,43 cm²" }, { key: "B", label: "62,28 cm²" }, { key: "C", label: "46,77 cm²" }, { key: "D", label: "72 cm²" }, { key: "E", label: "36 cm²" }],
    answerKey: "A", order: 3,
  },
  {
    text: "Sebuah balok berukuran 4×3×2 cm. Berapa jumlah kubus satuan yang dibutuhkan untuk memenuhi balok tersebut?",
    options: [{ key: "A", label: "18" }, { key: "B", label: "20" }, { key: "C", label: "24" }, { key: "D", label: "28" }, { key: "E", label: "30" }],
    answerKey: "C", order: 4,
  },
  {
    text: "Sebuah lingkaran memiliki diameter 14 cm. Berapa keliling dan luas lingkaran tersebut? (π ≈ 22/7)",
    options: [{ key: "A", label: "K=44 cm, L=154 cm²" }, { key: "B", label: "K=44 cm, L=196 cm²" }, { key: "C", label: "K=88 cm, L=308 cm²" }, { key: "D", label: "K=22 cm, L=77 cm²" }, { key: "E", label: "K=66 cm, L=231 cm²" }],
    answerKey: "A", order: 5,
  },
  {
    text: "Jika benda 3D dirotasi 90° searah jarum jam, bayangan manakah yang benar? (Bayangkan sebuah huruf 'L' tegak, diputar 90° ke kanan.)",
    options: [{ key: "A", label: "L terbalik (Γ)" }, { key: "B", label: "L berbaring kaki ke kiri (⌐)" }, { key: "C", label: "L berbaring kaki ke atas (⌐ terbalik)" }, { key: "D", label: "L tetap sama" }, { key: "E", label: "L terlihat seperti T" }],
    answerKey: "B", order: 6,
  },
  {
    text: "Sebuah persegi panjang ABCD memiliki panjang AB=10 cm dan BC=6 cm. Titik P adalah titik tengah BC. Berapa luas segitiga APD?",
    options: [{ key: "A", label: "30 cm²" }, { key: "B", label: "45 cm²" }, { key: "C", label: "36 cm²" }, { key: "D", label: "40 cm²" }, { key: "E", label: "50 cm²" }],
    answerKey: "A", order: 7,
  },
  {
    text: "Berapa banyak segitiga yang terbentuk dalam sebuah segitiga besar yang dibagi oleh 3 garis dari masing-masing sudut?",
    options: [{ key: "A", label: "4" }, { key: "B", label: "6" }, { key: "C", label: "8" }, { key: "D", label: "12" }, { key: "E", label: "9" }],
    answerKey: "B", order: 8,
  },
  {
    text: "Sebuah tangga bersandar ke dinding vertikal. Panjang tangga 10 m, jarak kaki tangga dari dinding 6 m. Berapa tinggi ujung tangga dari lantai?",
    options: [{ key: "A", label: "6 m" }, { key: "B", label: "7 m" }, { key: "C", label: "8 m" }, { key: "D", label: "9 m" }, { key: "E", label: "10 m" }],
    answerKey: "C", order: 9,
  },
  {
    text: "Jika sebuah kubus mempunyai volume 64 cm³, berapa panjang rusuknya?",
    options: [{ key: "A", label: "2 cm" }, { key: "B", label: "4 cm" }, { key: "C", label: "8 cm" }, { key: "D", label: "16 cm" }, { key: "E", label: "6 cm" }],
    answerKey: "B", order: 10,
  },
  {
    text: "Pada koordinat kartesius, titik A(2,3) digeser 3 satuan ke kanan dan 4 satuan ke bawah. Koordinat A yang baru adalah:",
    options: [{ key: "A", label: "(5, 7)" }, { key: "B", label: "(5, -1)" }, { key: "C", label: "(-1, 7)" }, { key: "D", label: "(5, -4)" }, { key: "E", label: "(-1, -1)" }],
    answerKey: "B", order: 11,
  },
  {
    text: "Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Berapa volume tabung? (π ≈ 22/7)",
    options: [{ key: "A", label: "1540 cm³" }, { key: "B", label: "2200 cm³" }, { key: "C", label: "770 cm³" }, { key: "D", label: "4400 cm³" }, { key: "E", label: "3080 cm³" }],
    answerKey: "A", order: 12,
  },
  {
    text: "Sebuah bola besi berdiameter 6 cm. Berapa volume bola? (π ≈ 22/7)",
    options: [{ key: "A", label: "88 cm³" }, { key: "B", label: "113,1 cm³" }, { key: "C", label: "72 cm³" }, { key: "D", label: "792/7 cm³" }, { key: "E", label: "52,8 cm³" }],
    answerKey: "B", order: 13,
  },
  {
    text: "Dua buah persegi masing-masing bersisi 4 cm dan 6 cm. Berapa perbandingan luas keduanya?",
    options: [{ key: "A", label: "2:3" }, { key: "B", label: "4:6" }, { key: "C", label: "4:9" }, { key: "D", label: "8:12" }, { key: "E", label: "16:36" }],
    answerKey: "C", order: 14,
  },
  {
    text: "Suatu prisma segitiga memiliki alas segitiga siku-siku dengan kaki 3 cm dan 4 cm. Tinggi prisma 10 cm. Berapa volumenya?",
    options: [{ key: "A", label: "60 cm³" }, { key: "B", label: "90 cm³" }, { key: "C", label: "120 cm³" }, { key: "D", label: "180 cm³" }, { key: "E", label: "240 cm³" }],
    answerKey: "A", order: 15,
  },
  {
    text: "Sebuah kerucut memiliki jari-jari alas 7 cm dan tinggi 12 cm. Volume kerucut adalah: (π = 22/7)",
    options: [{ key: "A", label: "616 cm³" }, { key: "B", label: "1232 cm³" }, { key: "C", label: "308 cm³" }, { key: "D", label: "924 cm³" }, { key: "E", label: "462 cm³" }],
    answerKey: "A", order: 16,
  },
]

// ─── IQ SubTest Config defaults ───────────────────────────────────────────────

const IQ_SUBTEST_CONFIGS = [
  { subTest: "VERBAL",  timeSeconds: 300 },
  { subTest: "NUMERIC", timeSeconds: 300 },
  { subTest: "LOGIC",   timeSeconds: 360 },
  { subTest: "SPATIAL", timeSeconds: 300 },
]

// ─── Main Seeder ──────────────────────────────────────────────────────────────

async function main() {
  console.log("🧠 Seeding Psych & IQ Question Banks...")

  // ── Psych Questions ──────────────────────────────────────────────────────────
  let psychCreated = 0
  let psychSkipped = 0
  for (const q of PSYCH_QUESTIONS) {
    const exists = await prisma.psychQuestion.findFirst({
      where: { text: q.text },
    })
    if (exists) {
      psychSkipped++
      continue
    }
    await prisma.psychQuestion.create({ data: q })
    psychCreated++
  }
  console.log(`  ✅ PsychQuestions: ${psychCreated} created, ${psychSkipped} skipped`)

  // ── IQ Questions ─────────────────────────────────────────────────────────────
  const iqSections = [
    { subTest: "VERBAL" as const,  questions: IQ_VERBAL },
    { subTest: "NUMERIC" as const, questions: IQ_NUMERIC },
    { subTest: "LOGIC" as const,   questions: IQ_LOGIC },
    { subTest: "SPATIAL" as const, questions: IQ_SPATIAL },
  ]

  let iqCreated = 0
  let iqSkipped = 0
  for (const section of iqSections) {
    for (const q of section.questions) {
      const exists = await prisma.iQQuestion.findFirst({
        where: { text: q.text, subTest: section.subTest },
      })
      if (exists) {
        iqSkipped++
        continue
      }
      await prisma.iQQuestion.create({
        data: {
          subTest:   section.subTest,
          text:      q.text,
          options:   q.options,
          answerKey: q.answerKey,
          order:     q.order,
          isActive:  true,
        },
      })
      iqCreated++
    }
  }
  console.log(`  ✅ IQQuestions: ${iqCreated} created, ${iqSkipped} skipped`)

  // ── IQ SubTest Configs ───────────────────────────────────────────────────────
  for (const cfg of IQ_SUBTEST_CONFIGS) {
    await prisma.iQSubTestConfig.upsert({
      where:  { subTest: cfg.subTest as any },
      create: { subTest: cfg.subTest as any, timeSeconds: cfg.timeSeconds, updatedAt: new Date() },
      update: { timeSeconds: cfg.timeSeconds, updatedAt: new Date() },
    })
  }
  console.log("  ✅ IQSubTestConfigs: upserted")

  console.log("\n🎉 Seeder selesai!")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
