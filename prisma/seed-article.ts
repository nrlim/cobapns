import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample article...");
  
  // Check if article already exists to prevent duplicate runs
  const existing = await prisma.article.findUnique({
    where: { slug: "rahasia-sukses-passing-grade-skd-cpns-2025" }
  });

  if (existing) {
    console.log("Article already exists. Skipping seed.");
    return;
  }

  const article = await prisma.article.create({
    data: {
      title: "7 Rahasia Sukses Menembus Passing Grade SKD CPNS 2025",
      slug: "rahasia-sukses-passing-grade-skd-cpns-2025",
      excerpt: "Panduan lengkap dan strategi jitu untuk menaklukkan soal SKD CPNS. Pelajari cara manajemen waktu, teknik menjawab soal sulit, dan mindset juara agar lulus dengan aman.",
      content: `Menghadapi Seleksi Kompetensi Dasar (SKD) CPNS seringkali menjadi momen yang mendebarkan. Ribuan peserta gugur di tahap ini bukan karena kurang cerdas, tetapi karena kurang strategi. Tes yang berbasis *Computer Assisted Test* (CAT) ini menuntut kecepatan, ketepatan, dan ketahanan mental.

Jika Anda ingin mengamankan kursi ASN tahun ini, kerja keras saja tidak cukup. Anda butuh **kerja cerdas**. Berikut adalah 7 strategi rahasia yang terbukti ampuh membantu peserta menembus *passing grade* dengan skor aman.

## 1. Kenali Medan Tempur: Pahami Kisi-Kisi SKD
Sebelum berperang, kenali dulu medannya. SKD terdiri dari tiga sub-tes dengan karakteristik berbeda:
- **Tes Wawasan Kebangsaan (TWK) - 30 Soal:** Menguji hafalan dan pemahaman implementasi nilai-nilai kebangsaan, Pancasila, UUD 1945, Bhinneka Tunggal Ika, dan NKRI.
- **Tes Intelegensia Umum (TIU) - 35 Soal:** Menguji logika analitis, kemampuan numerik (berhitung cepat), dan figural (pola gambar).
- **Tes Karakteristik Pribadi (TKP) - 45 Soal:** Menguji respons Anda terhadap berbagai situasi dunia kerja untuk melihat kecocokan dengan core values ASN (BerAKHLAK).

> **💡 Tips Cerdas:** Fokus pada kelemahan Anda. Jika Anda lemah di matematika, perbanyak porsi belajar dan latihan TIU numerik jauh-jauh hari.

## 2. Strategi Eksekusi: Pola TKP - TWK - TIU
Manajemen waktu adalah kunci utama dalam SKD. Anda memiliki **110 soal** untuk dikerjakan dalam **100 menit**. Artinya, rata-rata Anda hanya punya waktu 54 detik per soal!

Banyak peserta sukses menyarankan pola pengerjaan: **TKP → TWK → TIU**.
1. **TKP:** Soalnya panjang-panjang namun tidak perlu perhitungan matematis. TKP memiliki skor 1-5 (tidak ada nilai 0). Kerjakan di menit pertama saat otak masih segar untuk membaca teks panjang.
2. **TWK:** Membutuhkan daya ingat dan ketelitian literasi. Jika tahu jawabannya, langsung klik. Jika tidak, tebak dengan logika terdekat dan *flag* (tandai) untuk dikaji ulang nanti jika ada sisa waktu.
3. **TIU:** Dikerjakan paling akhir karena membutuhkan *coret-coretan* dan sering menjebak peserta untuk menghabiskan terlalu banyak waktu di satu soal.

## 3. Kuasai Teknik "Tembak Cerdas" di TIU
Dalam TIU, terkadang ada soal matematika atau deret angka yang terlihat sangat rumit padahal bisa diselesaikan dengan teknik eliminasi.
- Jangan terobsesi mencari jawaban pasti jika Anda sudah *stuck* lebih dari 1 menit.
- Gunakan logika pendekatan (estimasi nilai/pembulatan).
- Lihat pola jawaban di pilihan ganda. Terkadang jawaban yang benar sangat mencolok perbedaannya dibanding opsi lain.

## 4. Mindset TKP: Jadilah "Malaikat Tanpa Sayap"
Di soal TKP, Anda diminta merespons masalah di lingkungan pelayanan publik. Ingat, ujian ini mencari sosok "ASN Ideal". Saat menjawab, buang ego pribadi Anda. Posisikan diri Anda sebagai ASN yang:
- Sangat profesional, taat aturan, dan anti-KKN.
- Ramah dan selalu mengutamakan kepuasan masyarakat (pelayanan publik).
- Adaptif terhadap perubahan dan teknologi (Pilih jawaban yang mengarah pada digitalisasi atau efisiensi sistem).
- Mampu bekerja sama dengan rekan kerja dari berbagai latar belakang.

## 5. Simulasi Tryout CAT Secara Rutin
Membaca buku atau PDF ringkasan materi saja **tidak akan cukup**. Otak Anda perlu dibiasakan dengan tekanan waktu mundur dan antarmuka sistem CAT.
Ikuti *Tryout* secara rutin di COBAPNS dengan kondisi yang disimulasikan seperti aslinya:
- Gunakan *timer* yang ketat.
- Singkirkan *handphone* dan jangan gunakan kalkulator.
- **Evaluasi hasil tryout!** Jangan puas hanya melihat skor akhir. Analisis soal tipe apa yang paling sering salah dan topik mana yang menghabiskan waktu paling lama.

## 6. Persiapan Fisik H-1 Ujian
Malam sebelum ujian bukanlah waktu untuk SKS (Sistem Kebut Semalam). Otak yang kelelahan akan berpotensi besar mengalami *blank* saat ujian berlangsung.
- Berhenti belajar total pada sore hari di H-1.
- Siapkan semua dokumen wajib (KTP asli, Kartu Peserta Ujian, alat tulis) ke dalam satu map transparan malam itu juga.
- Tidur minimal 7-8 jam.
- Sarapan secukupnya sebelum berangkat (jangan terlalu kenyang agar tidak mengantuk saat menatap layar komputer).

## 7. Afirmasi Positif dan Doa
Ini mungkin terdengar klise, namun kekuatan doa, rasa percaya diri, dan restu (terutama dari orang tua) memiliki energi luar biasa yang bisa memberikan ketenangan batin. Panik adalah musuh terbesar saat SKD. Tarik napas panjang sebelum menekan tombol *Mulai Ujian*.

---

### Kesimpulan
Lulus SKD CPNS bukanlah sesuatu yang mustahil atau hanya mengandalkan keberuntungan. Berlatihlah secara terarah, perbanyak simulasi ujian, dan terapkan manajemen waktu yang ketat.

**Siap mengukur kemampuan Anda?** Segera buka menu **Tryout Premium** di dashboard COBAPNS dan mulai simulasi untuk melihat apakah skor Anda sudah menembus passing grade!`,
      coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop",
      category: "Tips CPNS",
      tags: ["SKD", "Tips", "Passing Grade", "TWK", "TIU", "TKP"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      metaTitle: "7 Tips Lulus Passing Grade SKD CPNS 2025 Terbukti Ampuh",
      metaDescription: "Panduan lengkap rahasia sukses menembus passing grade SKD CPNS. Pelajari urutan mengerjakan soal, tips hitung cepat TIU, dan trik menjawab TKP.",
      metaKeywords: "tips lulus cpns, cara lolos skd, tips skd cpns 2025, passing grade cpns, cara mengerjakan tiu, trik tkp cpns",
    },
  });

  console.log("Seeding complete. Article created:", article.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
