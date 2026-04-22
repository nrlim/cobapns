import { PrismaClient, LookupType } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

async function getInstances() {
  const instances = new Set<string>();
  
  try {
    // 1. Scrape Ministries from Wikipedia
    const res = await fetch('https://id.wikipedia.org/w/api.php?action=parse&page=Kementerian_Indonesia&format=json');
    if (res.ok) {
       const json = await res.json();
       const html = json.parse?.text?.['*'];
       if (html) {
         const $ = cheerio.load(html);
         // Find all links in tables
         $('table.wikitable td a').each((_, el) => {
            const name = $(el).text().trim();
            if (name.toLowerCase().includes('kementerian') || name.toLowerCase().includes('badan')) {
                instances.add(name);
            }
         });
       }
    }
  } catch(e) { console.warn("Failed fetching ministries", e); }

  try {
    // 2. Fetch Provinces and Regencies/Cities from Emsifa API
    const provRes = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
    if (provRes.ok) {
        const provs = await provRes.json();
        for (const p of provs) {
            instances.add(`Pemerintah Provinsi ${p.name}`);
            
            // fetch regencies for this province
            const regRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${p.id}.json`);
            if (regRes.ok) {
                const regs = await regRes.json();
                for (const r of regs) {
                    instances.add(`Pemerintah ${r.name}`);
                }
            }
        }
    }
  } catch(e) { console.warn("Failed fetching wilayah API", e); }

  // Fallback defaults
  if (instances.size < 10) {
      const defaults = [
          "Pemerintah Provinsi DKI Jakarta",
          "Pemerintah Provinsi Jawa Barat",
          "Pemerintah Provinsi Jawa Tengah",
          "Pemerintah Provinsi Jawa Timur",
          "Kementerian Kesehatan",
          "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
          "Kementerian Hukum dan Hak Asasi Manusia",
          "Kementerian Keuangan",
          "Badan Pusat Statistik",
          "Pemerintah Kota Bandung",
          "Pemerintah Kota Surabaya"
      ];
      defaults.forEach(d => instances.add(d));
  }
  
  return Array.from(instances).map(name => ({
      name,
      type: LookupType.INSTANCE,
      isActive: true
  }));
}

async function getPositions() {
  const positions = new Set<string>();
  
  try {
    // Scrape Wikipedia Jabatan Fungsional
    const res = await fetch('https://id.wikipedia.org/w/api.php?action=parse&page=Jabatan_fungsional_Pegawai_Negeri_Sipil&format=json');
    if (res.ok) {
       const json = await res.json();
       const html = json.parse?.text?.['*'];
       if (html) {
         const $ = cheerio.load(html);
         // grab titles from list items
         $('ul > li > a').each((_, el) => {
            const txt = $(el).text().trim();
            if (txt.length > 5 && !txt.includes(':') && !txt.includes('Artikel') && !txt.includes('Kategori') && !txt.includes('Wikipedia')) {
               positions.add(txt);
            }
         });
         
         // extract from typical text
         $('p').each((_, el) => {
             const text = $(el).text();
             if (text.includes('Analis')) {
                 const words = text.split(' ').filter(w => w.length > 0);
                 // We rely on fallback more heavily for positions due to unstructured data on Wikipedia
             }
         });
       }
    }
  } catch (e) {
      console.warn("Failed fetching jabatan", e);
  }

  // Fallback / Defaults
  const fallback = [
      "Penelaah Teknis Kebijakan",
      "Analis Kebijakan", 
      "Arsiparis", 
      "Auditor", 
      "Dokter Ahli Pertama", 
      "Perawat Terampil", 
      "Bidan Terampil",
      "Pranata Komputer Ahli Pertama", 
      "Pranata Komputer Terampil",
      "Analis Keuangan Pusat dan Daerah", 
      "Pengelola Barang Milik Negara",
      "Guru Ahli Pertama", 
      "Dosen Asisten Ahli", 
      "Penyuluh Pertanian",
      "Statistisi Ahli Pertama",
      "Apoteker Ahli Pertama",
      "Auditor Ahli Pertama",
      "Widyaiswara Ahli Pertama",
      "Penerjemah Ahli Pertama",
      "Pengawas Farmasi dan Makanan"
  ];
  fallback.forEach(f => positions.add(f));

  return Array.from(positions).map(name => ({
      name,
      type: LookupType.POSITION,
      isActive: true
  }));
}

async function getEducations() {
  const educations = [
      "SMA/SMK Sederajat",
      "D1",
      "D2",
      "D3",
      "D4",
      "S1",
      "S2",
      "S3",
      "Profesi"
  ];
  return educations.map(name => ({ name, type: LookupType.EDUCATION, isActive: true }));
}

async function getMajors() {
   const majors = new Set<string>();
   
   try {
     const res = await fetch('https://raw.githubusercontent.com/cahyadsn/data/master/prodi.json');
     if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d)) {
            d.forEach(m => {
                if (m.nama) majors.add(m.nama);
            });
        }
     }
   } catch(e) { console.warn("Failed fetching prodi JSON", e); }

   // Fallback extensive list of common majors
   const fallback = [
       "Kedokteran", "Kedokteran Gigi", "Keperawatan", "Kesehatan Masyarakat", "Farmasi", "Kebidanan", "Ilmu Gizi", "Fisioterapi",
       "Sistem Informasi", "Teknik Informatika", "Ilmu Komputer", "Manajemen Informatika", "Rekayasa Perangkat Lunak", "Teknologi Informasi",
       "Teknik Sipil", "Teknik Mesin", "Teknik Elektro", "Teknik Industri", "Arsitektur", "Teknik Lingkungan", "Teknik Kimia",
       "Ilmu Hukum", "Hukum Pidana", "Hukum Perdata", "Hukum Tata Negara",
       "Akuntansi", "Manajemen", "Ilmu Ekonomi", "Ekonomi Pembangunan", "Ekonomi Syariah", "Bisnis Digital",
       "Administrasi Negara", "Administrasi Publik", "Ilmu Komunikasi", "Hubungan Internasional", "Sosiologi", "Ilmu Pemerintahan",
       "Pendidikan Guru Sekolah Dasar (PGSD)", "Pendidikan Matematika", "Pendidikan Bahasa Inggris", "Pendidikan Bahasa Indonesia", "Pendidikan Agama Islam", "Bimbingan dan Konseling",
       "Psikologi", "Kesejahteraan Sosial", 
       "Statistika", "Matematika", "Biologi", "Kimia", "Fisika",
       "Agribisnis", "Agroteknologi", "Kehutanan", "Peternakan", "Ilmu Kelautan",
       "Desain Komunikasi Visual (DKV)", "Seni Rupa", "Televisi dan Film"
   ];
   fallback.forEach(p => majors.add(p));

   return Array.from(majors).map(name => ({ name, type: LookupType.MAJOR, isActive: true }));
}

async function main() {
    console.log("==========================================");
    console.log("  Scraping & Seeding CPNS Lookup Data...  ");
    console.log("==========================================\n");
    
    console.log("[1/4] Fetching INSTANCES (Kementerian & Pemda)...");
    const instances: any = await getInstances();
    console.log(` -> Added ${instances.length} instances.`);

    console.log("[2/4] Fetching POSITIONS (Jabatan)...");
    const positions: any = await getPositions();
    console.log(` -> Added ${positions.length} positions.`);

    console.log("[3/4] Formulating EDUCATIONS (Jenjang)...");
    const educations: any = await getEducations();
    console.log(` -> Added ${educations.length} educations.`);

    console.log("[4/4] Fetching MAJORS (Program Studi)...");
    const majors: any = await getMajors();
    console.log(` -> Added ${majors.length} majors.`);

    const allLookups = [...instances, ...positions, ...educations, ...majors];
    
    console.log(`\nTotal scraped/prepared data: ${allLookups.length} records.`);
    console.log("Clearing existing lookups and preparing for database insertion...");

    // Delete existing so we don't end up with duplicates
    await prisma.lookup.deleteMany();
    
    // Batch insert
    const BATCH_SIZE = 500;
    for (let i = 0; i < allLookups.length; i += BATCH_SIZE) {
        const batch = allLookups.slice(i, i + BATCH_SIZE);
        await prisma.lookup.createMany({
            data: batch
        });
        console.log(` -> Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} records)`);
    }

    console.log("\n==========================================");
    console.log("  Successfully completed the Seeding!     ");
    console.log("==========================================");
}

main()
  .catch(e => {
    console.error("An error occurred during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
