import { PrismaClient, QuestionCategory, MaterialType, MaterialAccessTier, QuestionDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding materials...');

  const materialsData = [
    // TWK Materials
    {
      title: 'Pancasila sebagai Dasar Negara',
      slug: 'pancasila-sebagai-dasar-negara',
      category: QuestionCategory.TWK,
      subCategory: 'Pancasila',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.MUDAH,
      content: '<p>Pancasila adalah ideologi dasar bagi negara Indonesia. Nama ini terdiri dari dua kata dari Sanskerta: pañca berarti lima dan śīla berarti prinsip atau asas.</p>',
      isPublished: true,
      order: 1,
    },
    {
      title: 'Sejarah Perumusan Pancasila - Video Lengkap',
      slug: 'sejarah-perumusan-pancasila-video',
      category: QuestionCategory.TWK,
      subCategory: 'Pancasila',
      type: MaterialType.VIDEO,
      accessTier: MaterialAccessTier.ELITE,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Video materi pembahasan mengenai sejarah perumusan Pancasila dari masa BPUPKI hingga PPKI.</p>',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy video
      isPublished: true,
      order: 2,
    },
    {
      title: 'UUD 1945 dan Amandemen I-IV',
      slug: 'uud-1945-dan-amandemen',
      category: QuestionCategory.TWK,
      subCategory: 'Undang-Undang Dasar 1945',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SULIT,
      content: '<p>Penjelasan lengkap mengenai pasal-pasal UUD 1945 serta riwayat amandemen yang pernah dilakukan pada tahun 1999, 2000, 2001, dan 2002.</p>',
      isPublished: true,
      order: 3,
    },
    {
      title: 'Bhinneka Tunggal Ika dalam Kehidupan Berbangsa',
      slug: 'bhinneka-tunggal-ika-kehidupan',
      category: QuestionCategory.TWK,
      subCategory: 'Bhinneka Tunggal Ika',
      type: MaterialType.PDF,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Modul PDF mengenai pengamalan semboyan Bhinneka Tunggal Ika di tengah masyarakat multikultural.</p>',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isPublished: true,
      order: 4,
    },
    {
      title: 'Konsep Negara Kesatuan Republik Indonesia (NKRI)',
      slug: 'konsep-nkri',
      category: QuestionCategory.TWK,
      subCategory: 'NKRI',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.ELITE,
      difficulty: QuestionDifficulty.MUDAH,
      content: '<p>Pengertian NKRI, tujuan negara, serta fungsi pokok negara berdasarkan konstitusi.</p>',
      isPublished: true,
      order: 5,
    },
    {
      title: 'Nasionalisme: Sejarah dan Implementasi',
      slug: 'nasionalisme-sejarah-implementasi',
      category: QuestionCategory.TWK,
      subCategory: 'Nasionalisme',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.MASTER,
      difficulty: QuestionDifficulty.SULIT,
      content: '<p>Artikel mendalam mengenai akar sejarah nasionalisme di Indonesia, mulai dari Budi Utomo hingga Sumpah Pemuda.</p>',
      isPublished: true,
      order: 6,
    },

    // TIU Materials
    {
      title: 'Kemampuan Verbal: Sinonim dan Antonim',
      slug: 'tiu-verbal-sinonim-antonim',
      category: QuestionCategory.TIU,
      subCategory: 'Kemampuan Verbal',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.MUDAH,
      content: '<p>Panduan praktis mengingat dan menjawab soal sinonim (persamaan kata) dan antonim (lawan kata) dalam TIU.</p>',
      isPublished: true,
      order: 7,
    },
    {
      title: 'Analisa Silogisme dengan Cepat',
      slug: 'analisa-silogisme-cepat',
      category: QuestionCategory.TIU,
      subCategory: 'Logika Silogisme',
      type: MaterialType.VIDEO,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Pelajari rumusan umum silogisme (Modus Ponens, Modus Tollens) secara visual dan interaktif.</p>',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isPublished: true,
      order: 8,
    },
    {
      title: 'Deret Angka dan Pola Bilangan',
      slug: 'deret-angka-pola-bilangan',
      category: QuestionCategory.TIU,
      subCategory: 'Kemampuan Numerik',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Cara menebak pola bilangan aritmatika, geometri, dan pola bertingkat pada tes deret angka.</p>',
      isPublished: true,
      order: 9,
    },
    {
      title: 'Trik Cepat Soal Cerita Matematika Dasar',
      slug: 'trik-cepat-soal-cerita',
      category: QuestionCategory.TIU,
      subCategory: 'Kemampuan Numerik',
      type: MaterialType.PDF,
      accessTier: MaterialAccessTier.ELITE,
      difficulty: QuestionDifficulty.SULIT,
      content: '<p>Berisi perbandingan senilai, perbandingan berbalik nilai, dan trik mengerjakannya dalam hitungan detik.</p>',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isPublished: true,
      order: 10,
    },
    {
      title: 'Kemampuan Figural: Rotasi Gambar',
      slug: 'kemampuan-figural-rotasi',
      category: QuestionCategory.TIU,
      subCategory: 'Kemampuan Figural',
      type: MaterialType.VIDEO,
      accessTier: MaterialAccessTier.MASTER,
      difficulty: QuestionDifficulty.SULIT,
      content: '<p>Video penyelesaian soal figural tipe rotasi objek 2D dan 3D.</p>',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isPublished: true,
      order: 11,
    },
    {
      title: 'Penalaran Analitis: Susunan Posisi Duduk',
      slug: 'penalaran-analitis-posisi-duduk',
      category: QuestionCategory.TIU,
      subCategory: 'Penalaran Analitis',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.ELITE,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Tips membuat skema coretan untuk soal penalaran analitis berupa posisi duduk melingkar atau berbaris.</p>',
      isPublished: true,
      order: 12,
    },

    // TKP Materials
    {
      title: 'Pelayanan Publik yang Prima',
      slug: 'pelayanan-publik-prima',
      category: QuestionCategory.TKP,
      subCategory: 'Pelayanan Publik',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.MUDAH,
      content: '<p>Materi inti mengenai standar pelayanan publik sebagai seorang ASN.</p>',
      isPublished: true,
      order: 13,
    },
    {
      title: 'Jejaring Kerja dan Kolaborasi',
      slug: 'jejaring-kerja-kolaborasi',
      category: QuestionCategory.TKP,
      subCategory: 'Jejaring Kerja',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Memahami bagaimana cara membangun hubungan baik (networking) secara efisien di lingkungan kerja.</p>',
      isPublished: true,
      order: 14,
    },
    {
      title: 'Sosial Budaya dan Adaptasi',
      slug: 'sosial-budaya-adaptasi',
      category: QuestionCategory.TKP,
      subCategory: 'Sosial Budaya',
      type: MaterialType.VIDEO,
      accessTier: MaterialAccessTier.ELITE,
      difficulty: QuestionDifficulty.SULIT,
      content: '<p>Panduan video cara bersikap inklusif di lingkungan sosial budaya yang beragam tanpa kehilangan profesionalitas kerja.</p>',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isPublished: true,
      order: 15,
    },
    {
      title: 'Teknologi Informasi dan Komunikasi dalam ASN',
      slug: 'tik-dalam-asn',
      category: QuestionCategory.TKP,
      subCategory: 'TIK',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.MASTER,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Pentingnya menguasai dasar teknologi informasi, serta cara memanfaatkannya untuk mempercepat proses birokrasi dan inovasi.</p>',
      isPublished: true,
      order: 16,
    },
    {
      title: 'Profesionalisme Kerja',
      slug: 'profesionalisme-kerja',
      category: QuestionCategory.TKP,
      subCategory: 'Profesionalisme',
      type: MaterialType.PDF,
      accessTier: MaterialAccessTier.FREE,
      difficulty: QuestionDifficulty.MUDAH,
      content: '<p>Bacaan wajib: 10 etika dan kewajiban utama untuk bersikap profesional di dalam dan di luar jam kantor.</p>',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isPublished: true,
      order: 17,
    },
    {
      title: 'Anti Radikalisme - Panduan Lengkap',
      slug: 'anti-radikalisme-panduan-lengkap',
      category: QuestionCategory.TKP,
      subCategory: 'Anti Radikalisme',
      type: MaterialType.TEXT,
      accessTier: MaterialAccessTier.ELITE,
      difficulty: QuestionDifficulty.SEDANG,
      content: '<p>Materi terkait indikasi paparan radikalisme, cara melaporkan, dan upaya preventif dalam kerangka bela negara ASN.</p>',
      isPublished: true,
      order: 18,
    }
  ];

  for (const material of materialsData) {
    const existing = await prisma.material.findUnique({
      where: { slug: material.slug },
    });

    if (existing) {
      console.log(`Material already exists: ${material.slug}`);
    } else {
      await prisma.material.create({
        data: material,
      });
      console.log(`Created material: ${material.title}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
