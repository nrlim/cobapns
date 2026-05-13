import { PrismaClient, QuestionCategory, MaterialType, MaterialAccessTier, QuestionDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VERY detailed CPNS materials (Text Only)...');

  const materials = [
    // --- TWK MATERIALS ---
    {
      title: 'Panduan Ekstensif TWK: Nasionalisme, Integritas, dan 4 Pilar Kebangsaan',
      slug: 'twk-panduan-ekstensif',
      category: QuestionCategory.TWK,
      subCategory: 'Pilar Negara',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      isPublished: true,
      order: 1,
      content: `
# Panduan Ekstensif TWK: Nasionalisme, Integritas, dan 4 Pilar Kebangsaan

Selamat datang di modul persiapan Tes Wawasan Kebangsaan (TWK) CPNS yang dirancang khusus untuk memastikan pemahaman mendalam Anda. TWK tidak hanya menguji hafalan Anda, melainkan **Kemampuan Implementatif (HOTS)** terhadap nilai-nilai kebangsaan.

## BAB 1: Nasionalisme dan Bela Negara
*   **Nasionalisme**: Berkaitan dengan "Perasaan Cinta" atau ikatan emosional terhadap tanah air. Contoh: Bangga memakai batik, menggunakan bahasa Indonesia dengan baik.
*   **Patriotisme**: Berkaitan dengan "Sikap Rela Berkorban" demi bangsa. Contoh: Pahlawan gugur di medan perang.
*   **Bela Negara**: Tindakan terstruktur warga negara sesuai dengan profesinya untuk mempertahankan kelangsungan hidup bangsa. Contoh: Seorang guru mengajar dengan tulus di daerah 3T.

## BAB 2: Integritas Nasional
Integritas berarti kesatuan antara pikiran, perkataan, dan perbuatan. KPK menetapkan **9 Nilai Integritas Antikorupsi**:
1. Jujur
2. Peduli
3. Mandiri
4. Disiplin
5. Tanggung Jawab
6. Kerja Keras
7. Sederhana
8. Berani
9. Adil

## BAB 3: Pengamalan Sila Pancasila (HOTS)
*   **Sila 1**: Toleransi beragama, kebebasan beribadah.
*   **Sila 2**: Memanusiakan manusia, aksi relawan bencana, menolak perundungan.
*   **Sila 3**: Rela berkorban, cinta produk dalam negeri.
*   **Sila 4**: Demokrasi, musyawarah mufakat, menerima hasil rapat.
*   **Sila 5**: Keseimbangan hak dan kewajiban, keadilan hukum, membayar pajak, tidak merusak fasilitas umum.
      `
    },
    {
      title: 'Sejarah Lengkap Pergerakan Nasional & Tokoh Penting',
      slug: 'twk-sejarah-pergerakan-nasional',
      category: QuestionCategory.TWK,
      subCategory: 'Sejarah',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      isPublished: true,
      order: 2,
      content: `
# Sejarah Lengkap Pergerakan Nasional & Tokoh Penting

Memahami sejarah bukan sekadar mengingat tahun dan nama, melainkan memahami *benang merah* perjuangan bangsa Indonesia menuju kemerdekaan.

## 1. Masa Perintis (Kebangkitan Nasional)
Dimulai dengan berdirinya **Budi Utomo** pada 20 Mei 1908 oleh Dr. Soetomo dan para mahasiswa STOVIA.
*   **Fokus Tujuan**: Kemajuan pendidikan dan kebudayaan.
*   **Makna HOTS**: Awal mula perlawanan tanpa fisik, melainkan melalui pendidikan dan organisasi (intelektual).

## 2. Masa Penegas (Sumpah Pemuda)
Terjadi pada Kongres Pemuda II, 28 Oktober 1928, digagas oleh PPPI (Perhimpunan Pelajar Pelajar Indonesia).
*   **Isi Sumpah Pemuda**: Bertumpah darah satu, berbangsa satu, menjunjung bahasa persatuan (Indonesia).
*   **Makna HOTS**: Penegasan identitas ke-Indonesia-an. Mengikis ego kesukuan demi satu tujuan: Indonesia Merdeka.

## 3. Masa Pendobrak (Kemerdekaan)
Proklamasi 17 Agustus 1945 oleh Soekarno-Hatta.
*   **Peristiwa Rengasdengklok**: Penculikan Soekarno-Hatta oleh golongan muda agar segera memproklamasikan kemerdekaan tanpa menunggu janji Jepang (PPKI).
*   **Makna HOTS**: Sikap anti-kolonialisme absolut dan kemandirian bangsa.
      `
    },
    {
      title: 'Kupas Tuntas UUD 1945, Amandemen, & Sistem Tata Negara',
      slug: 'twk-uud-1945-konstitusi',
      category: QuestionCategory.TWK,
      subCategory: 'Pilar Negara',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SULIT,
      isPublished: true,
      order: 3,
      content: `
# Kupas Tuntas UUD 1945, Amandemen, & Sistem Tata Negara

UUD 1945 adalah hukum dasar tertulis (konstitusi) tertinggi di Indonesia. Pemahaman atas esensi pasal-pasalnya sangat krusial.

## 1. Sejarah Amandemen (4 Kali)
- **Amandemen I (1999)**: Membatasi kekuasaan Presiden agar tidak otoriter (maksimal 2 periode).
- **Amandemen II (2000)**: Penambahan pasal tentang Pemerintah Daerah, DPR, dan HAM (Pasal 28 A-J).
- **Amandemen III (2001)**: Penegasan Indonesia sebagai Negara Hukum, pembentukan DPD, MK, dan KY.
- **Amandemen IV (2002)**: Penghapusan DPA, aturan pergantian presiden jika mangkat, dan bab Pendidikan (anggaran 20%).

## 2. Pasal-Pasal Sering Keluar (Hafalan Wajib)
- **Pasal 1 Ayat 3**: Negara Indonesia adalah negara hukum.
- **Pasal 27 Ayat 1**: Asas Equality Before the Law (Kesamaan kedudukan di mata hukum).
- **Pasal 27 Ayat 3**: Hak dan kewajiban Bela Negara.
- **Pasal 29 Ayat 2**: Kebebasan beragama dan beribadah.
- **Pasal 31**: Hak mendapat pendidikan (Ayat 1) dan kewajiban pemerintah membiayai wajib belajar (Ayat 2).
- **Pasal 33**: Perekonomian disusun berdasarkan asas kekeluargaan (Koperasi). Bumi, air, dan kekayaan alam dikuasai negara.
      `
    },
    {
      title: 'Bahasa Indonesia: Ejaan, Tanda Baca, & Gagasan Utama',
      slug: 'twk-bahasa-indonesia-ejaan',
      category: QuestionCategory.TWK,
      subCategory: 'Bahasa Indonesia',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      isPublished: true,
      order: 4,
      content: `
# Bahasa Indonesia: Ejaan, Tanda Baca, & Gagasan Utama

Soal Bahasa Indonesia di TWK menguji ketelitian Anda dalam membaca teks panjang serta penguasaan PUEBI (Pedoman Umum Ejaan Bahasa Indonesia).

## 1. Menentukan Gagasan Utama (Ide Pokok)
Gagasan utama adalah kalimat yang menjadi inti dari sebuah paragraf.
- **Deduktif**: Ide pokok berada di **Awal** paragraf. Kalimat selanjutnya bersifat menjelaskan. (Ciri: Kalimat pertama langsung pada *point*, kalimat kedua ada repetisi kata).
- **Induktif**: Ide pokok berada di **Akhir** paragraf. (Ciri: Diakhiri dengan kata kesimpulan seperti *Oleh karena itu, Dengan demikian, Kesimpulannya*).
- **Campuran**: Ide pokok berada di awal dan akhir paragraf (dipertegas).

## 2. Penggunaan Huruf Kapital
Kesalahan yang paling sering diuji:
- **Nama Geografi**: Kapital jika diikuti nama spesifik (*Gunung Merapi, Selat Sunda*). Tidak kapital jika bukan nama geografis (*mandi di sungai, berlayar ke teluk*).
- **Nama Jabatan**: Kapital jika diikuti nama orang/instansi (*Presiden Joko Widodo, Gubernur Jawa Tengah*). Tidak kapital jika berdiri sendiri (*Ia baru saja dilantik menjadi presiden*).
- **Nama Suku/Bangsa**: Kapital pada suku/bangsanya saja (*suku Dani, bahasa Inggris*). Tidak kapital jika menjadi bentuk turunan (*keinggris-inggrisan*).

## 3. Penulisan Partikel (pun & per)
- **Partikel 'pun'**: Ditulis terpisah (*Siapa pun, kapan pun, malam pun*). KECUALI 12 kata hubung yang sudah padu (*Adapun, walaupun, meskipun, sungguhpun, sekalipun, biarpun*).
- **Partikel 'per'**: Ditulis terpisah jika berarti *demi*, *tiap*, atau *mulai*. (*Satu per satu, per 1 Januari, dibayar per bulan*).
      `
    },

    // --- TIU MATERIALS ---
    {
      title: 'Masterclass TIU: Rumus Lengkap Numerik & Soal Cerita',
      slug: 'tiu-masterclass-lengkap',
      category: QuestionCategory.TIU,
      subCategory: 'Numerik',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SULIT,
      isPublished: true,
      order: 1,
      content: `
# Masterclass TIU: Rumus Lengkap Numerik & Soal Cerita

Tes Intelegensia Umum (TIU) sering kali dirancang mengecoh. Jika Anda menghitung dengan cara sekolah (manual), waktu Anda akan habis. Gunakan Trik Cepat!

## 1. Pecahan Istimewa
Hafalkan konversi ini untuk berhitung kilat:
*   **12,5%** = 1/8
*   **33,33%** = 1/3
*   **16,67%** = 1/6
*   **37,5%** = 3/8
*   **66,67%** = 2/3
*   **87,5%** = 7/8

*Contoh: 16,67% dari 420 = (1/6) x 420 = 70.*

## 2. Perbandingan Kuantitatif (Senilai & Berbalik Nilai)
*   **Senilai (A naik, B naik)**: Contoh Bensin dan Jarak. Rumus: \`A1 / B1 = A2 / B2\`
*   **Berbalik Nilai (A naik, B turun)**: Contoh Pekerja dan Waktu. Rumus: \`A1 x B1 = A2 x B2\`

*Trik Soal Proyek Berhenti (Henti Kerja):*
> Tambahan Pekerja = (Sisa hari libur × Pekerja Awal) / Sisa hari baru

## 3. Rumus Kecepatan Berpapasan & Menyusul
*   **Berpapasan (Berangkat Bersamaan)**: \`Waktu = Jarak Total / (K1 + K2)\`
*   **Menyusul (Berangkat Berbeda Waktu)**: \`Waktu = Selisih Jarak / (K2 - K1)\`
      `
    },
    {
      title: 'Trik Kilat TIU Verbal: Sinonim, Antonim, dan Analogi',
      slug: 'tiu-verbal-trik-kilat',
      category: QuestionCategory.TIU,
      subCategory: 'Verbal',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.MUDAH,
      isPublished: true,
      order: 2,
      content: `
# Trik Kilat TIU Verbal: Sinonim, Antonim, dan Analogi

## 1. Analogi (Padanan Hubungan)
Analogi meminta Anda mencari hubungan kata yang *sama persis* posisinya.
**Trik Utama: Buatlah Kalimat Penghubung!**
*   *Soal*: HUJAN : BANJIR = KEMARAU : ...
*   *Kalimat*: "Hujan yang berlebihan menyebabkan banjir, maka kemarau yang berlebihan menyebabkan..."
*   *Jawaban*: Kekeringan.

*Peringatan*: Jangan membolak-balik posisi (ruas kiri ke kanan).

## 2. Sinonim (Persamaan) & Antonim (Lawan Kata)
Jika ada kata serapan asing yang tidak Anda ketahui artinya, gunakan ilmu *Kira-Kira*:
1. **Eliminasi Sinonim**: Jika dalam opsi A, B, dan C memiliki arti yang mirip satu sama lain, ketiganya pasti salah. Jawaban adalah opsi yang maknanya paling beda.
2. **Eliminasi Antonim**: Cari dua opsi yang saling berlawanan. Jawaban kemungkinan besar ada di antara dua opsi tersebut.

Kata Langka Sering Keluar:
- *Absolut* = Mutlak
- *Ad Interim* = Sementara
- *Nirwana* = Surga
- *Sinergi* = Kerja sama
      `
    },
    {
      title: 'Pola Deret Angka & Huruf (Rahasia Lompatan)',
      slug: 'tiu-deret-angka-huruf',
      category: QuestionCategory.TIU,
      subCategory: 'Numerik',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      isPublished: true,
      order: 3,
      content: `
# Pola Deret Angka & Huruf (Rahasia Lompatan)

Soal deret angka dirancang untuk menguji kepekaan Anda terhadap pola matematika berulang.

## 1. Kenali Karakteristik Pola
- **Pola Konstan/Lambat**: Angka naik/turun dengan jarak kecil. (Pasti Penjumlahan/Pengurangan). Contoh: 2, 5, 8, 11 (+3).
- **Pola Eksponensial/Cepat**: Angka melonjak drastis. (Pasti Perkalian/Perpangkatan). Contoh: 2, 6, 18, 54 (x3).
- **Pola Fluktuatif**: Angka naik, lalu turun, lalu naik lagi. Ini menandakan **Pola Larik (Lompat)**. Jangan hitung berurutan, tapi lompati 1 atau 2 angka!

## 2. Deret Bertingkat (Fibonacci & Prima)
- **Fibonacci**: Angka berikutnya adalah penjumlahan 2 angka sebelumnya. (Contoh: 1, 1, 2, 3, 5, 8, 13).
- **Bilangan Prima**: Angka yang hanya bisa dibagi 1 dan dirinya sendiri. Sering diselipkan sebagai pengecoh. (Contoh: 2, 3, 5, 7, 11, 13, 17).

## 3. Deret Huruf
Cara paling mudah mengerjakan deret huruf adalah dengan **mengonversinya menjadi angka**.
A=1, B=2, C=3, ..., Z=26.
*Contoh Soal*: A, C, F, J, O, ...
*Konversi*: 1, 3, 6, 10, 15, ...
*Pola*: +2, +3, +4, +5. Maka selanjutnya +6 (21). Huruf ke-21 adalah U.
      `
    },

    // --- TKP MATERIALS ---
    {
      title: 'Buku Saku TKP: Pedoman Rahasia ASN Profesional (Indikator 5 Poin)',
      slug: 'tkp-buku-saku-profesional',
      category: QuestionCategory.TKP,
      subCategory: 'Profesionalisme',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SULIT,
      isPublished: true,
      order: 1,
      content: `
# Buku Saku TKP: Pedoman Rahasia ASN Profesional

Tes Karakteristik Pribadi (TKP) tidak memiliki jawaban salah, melainkan rentang nilai 1-5. Anda wajib mengejar Poin 5 untuk lulus *passing grade* dengan tenang.

## 1. Pahami "Core Values" ASN (BerAKHLAK)
1. **Berorientasi Pelayanan**: Ramah, cekatan, solutif, sesuai SOP.
2. **Akuntabel**: Jujur, tidak menyalahgunakan wewenang (menolak suap/gratifikasi).
3. **Kompeten**: Terus belajar, melaksanakan tugas dengan kualitas terbaik.
4. **Harmonis**: Menghargai keberagaman, toleran.
5. **Loyal**: Memegang teguh Pancasila, menjaga rahasia instansi.
6. **Adaptif**: Inovatif dan proaktif menghadapi era digital.
7. **Kolaboratif**: Terbuka bekerja sama antar divisi/instansi.

## 2. Strategi Analisis Opsi Eliminasi (A.O.E)
- **Coret opsi berbau emosi negatif** (marah, lari dari masalah, membalas perlakuan buruk). Ini pasti bernilai 1 atau 2.
- **Coret opsi positif yang "pasif"** (berharap orang lain berubah, pasrah menunggu atasan). Ini pasti bernilai 3.
- **Pilih Opsi Komprehensif** untuk nilai 5: Tindakan yang tidak hanya menyelesaikan masalah sementara, namun juga menyelesaikan akar masalah secara *win-win solution* dan berpegang pada SOP.
      `
    },
    {
      title: 'TKP: Etika Bekerja di Era Digital & Literasi Digital',
      slug: 'tkp-etika-digital',
      category: QuestionCategory.TKP,
      subCategory: 'TIK',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      isPublished: true,
      order: 2,
      content: `
# TKP: Etika Bekerja di Era Digital & Literasi Digital

Aspek TIK dalam TKP difokuskan pada *Digital Ethics* dan adaptasi *Smart ASN*.

## 1. Literasi Digital & Keamanan Data
- **Skenario**: Menggunakan komputer publik atau ada teman meminjam flashdisk/akun Anda.
- **Sikap (Skor 5)**: Memastikan flashdisk bebas virus, selalu melakukan *logout* dari fasilitas umum, dan **tidak pernah** memberikan password atau hak akses sistem internal kepada siapa pun, meskipun itu rekan kerja satu divisi.

## 2. Etika Ber-Sosial Media
- **Skenario**: Menemukan berita hoax atau viral yang memojokkan instansi pemerintah.
- **Sikap (Skor 5)**: Tidak ikut berdebat kasar di kolom komentar (menjaga nama baik institusi), serta melaporkan link tersebut kepada tim Humas instansi agar dibuatkan klarifikasi resmi.

## 3. Adaptasi Sistem Baru
- **Skenario**: Kantor menerapkan aplikasi baru yang masih sering error.
- **Sikap (Skor 5)**: Menolak kembali ke cara manual. Anda tetap menggunakan aplikasi baru tersebut sambil mencatat error yang terjadi untuk dilaporkan sebagai *feedback* konstruktif kepada tim IT.
      `
    },
    {
      title: 'Jejaring Kerja & Problem Solving (Manajemen Konflik)',
      slug: 'tkp-jejaring-kerja-konflik',
      category: QuestionCategory.TKP,
      subCategory: 'Jejaring Kerja',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SULIT,
      isPublished: true,
      order: 3,
      content: `
# Jejaring Kerja & Problem Solving (Manajemen Konflik)

Dalam dunia kerja nyata di birokrasi, Anda akan bertemu rekan yang tidak kooperatif, atasan yang kaku, dan berbagai konflik kepentingan.

## 1. Jejaring Kerja (Networking)
*Tujuan: Kolaborasi aktif dan bersinergi demi mencapai target instansi.*
- **Jika ada anggota baru**: Proaktif mengajak berdiskusi, membantu orientasinya, dan mendengarkan ide segarnya.
- **Jika rekan kesulitan**: Menawarkan bantuan JIKA tugas utama Anda sendiri sudah tuntas. Jangan membantu orang lain tetapi mengorbankan *deadline* Anda sendiri.

## 2. Problem Solving & Manajemen Konflik
- **Skenario Beda Pendapat Saat Rapat**: Pendapat Anda ditolak atau ada dua kubu yang bersitegang.
- **Sikap (Skor 5)**: Menjadi penengah yang obyektif. Mengajak forum untuk kembali melihat data dan fakta, mengambil jalan tengah yang paling menguntungkan institusi, dan lapang dada menerima hasil kesepakatan akhir meskipun ide Anda tertolak.

## 3. Profesionalisme (Urusan Pribadi vs Pekerjaan)
- **Skenario**: Anak sedang sakit di rumah, padahal ada laporan penting yang harus diselesaikan sore ini.
- **Sikap (Skor 5)**: Menyelesaikan tugas kantor dengan fokus dan efisien terlebih dahulu, barulah meminta izin atau menelepon keluarga di rumah. ASN dituntut untuk tidak membiarkan urusan domestik merusak pelayanan/kinerja publik.
      `
    }
  ];

  for (const material of materials) {
    const created = await prisma.material.upsert({
      where: { slug: material.slug },
      update: material,
      create: material,
    });
    console.log('Seeded text material:', created.title);
  }

  // --- DELETE ANY EXISTING VIDEO MATERIALS IF THEY EXIST ---
  const slugsToDelete = [
    'tiu-hitungan-pecahan-video',
    'twk-uud-1945-video',
    'tkp-simulasi-pembahasan-video'
  ];
  const deleted = await prisma.material.deleteMany({
    where: { slug: { in: slugsToDelete } }
  });
  console.log('Deleted legacy video materials:', deleted.count);

  console.log('Premium Text-Only Materials seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
