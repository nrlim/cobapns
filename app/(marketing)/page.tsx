import Link from "next/link";
import Image from "next/image";
import { 
  LineChart, Zap, Cpu, CreditCard, ShieldCheck, 
  CheckCircle2, Star, Rocket, Mail, Phone, 
  Target, TrendingUp, Clock, MonitorPlay, 
  BarChart, Trophy, Map, CheckCircle
} from "lucide-react";
import { getSettings } from "@/app/actions/settings";
import { CURRENT_YEAR } from "@/lib/utils";
import { TestimonialCarousel, type DynamicTestimonial } from "@/components/ui/testimonial-carousel";
import { prisma } from "@/lib/prisma";
import { PricingTable } from "@/components/ui/pricing-table";

export const revalidate = 60;

export default async function HomePage() {
  const settings = await getSettings();

  const raw = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 10
  });
  
  const testimonialsData: DynamicTestimonial[] = raw.map(t => ({
      id: t.id,
      name: t.user?.name || t.guestName || "Pengguna CPNS",
      role: t.guestRole || (t.isVerified ? "Pengguna Terverifikasi" : "Pengguna Setia COBA PNS"),
      quote: t.content,
      image: t.user?.avatarUrl || t.guestAvatar || null,
      tags: t.tags,
      rating: t.rating || 5
    }));

  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative px-4 sm:px-6 pt-8 pb-16 md:pt-16 md:pb-32 overflow-hidden bg-surface">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(135deg,#1E73BE,#2DBE60)]" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold tracking-widest uppercase mb-6">Persiapan CPNS {CURRENT_YEAR}</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mb-6">
              <span className="text-brand-blue">Cara Pintar & Mudah</span>{" "}<br className="hidden md:block" />
              <span className="text-brand-green italic">Lulus CPNS Tahun Ini!</span>
            </h1>
            <p className="text-base md:text-xl text-on-secondary-container leading-relaxed max-w-xl mb-8">
              Belajar nggak perlu pusing. COBACPNS hadir dengan sistem belajar yang <strong>simpel, terarah, dan mirip aslinya</strong>. Mulai dari materi lengkap hingga tryout berstandar BKN, semua ada di sini.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="primary-gradient text-on-primary px-6 py-3.5 rounded-xl font-bold text-base md:text-lg shadow-2xl shadow-primary/30 transition-transform active:scale-95 text-center">Coba Gratis Sekarang</Link>
              <Link href="#harga" className="bg-surface-container-high text-primary px-6 py-3.5 rounded-xl font-bold text-base md:text-lg transition-all hover:bg-surface-container-highest text-center">Lihat Paket Belajar</Link>
            </div>
          </div>
          <div className="md:col-span-5 relative mt-12 md:mt-0">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-surface-container-lowest rotate-2 bg-surface-container-lowest">
              <Image
                alt="Belajar CPNS"
                width={600}
                height={800}
                className="w-full h-auto object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-OS-zDEcYfpL0OQ0aGPPZBM8Gq6A6vYhXT2U-Gnoyn7SwnNgR0GZHCSkoG5-idKAMbK1Dcj6ZDslorQ3Ea9xlHYu5liWORoLVLxxEjarTtr6z7nteFZRzOJar0Zsec9MMR0v7Tbs2P7ZGexC3kjgv_rdwZGKVOltTpEEzESsq35Pxgq5ftWIiHSR8B8bnrgz8shwz2dJyXhUu7gIYxA5w7SfJ7357DfuXiNYHQi5I8vvJtDAv_Gn6cj2EqX9ZWXfQQ0_ReSxtG7U0"
                priority
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-10 -left-10 bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline-variant/20 hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Tingkat Kelulusan</p>
                  <p className="text-lg font-black text-primary">Tinggi!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kenapa orang pilih belajar di cobacpns? */}
      <section className="py-14 md:py-24 bg-surface-container-low" id="kenapa-kami">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight mb-4 text-balance">Alasan COBACPNS Jadi Pilihan Utama Para Pejuang NIP</h2>
            <p className="text-on-secondary-container text-lg max-w-2xl mx-auto">Kami menghadirkan teknologi dan metode belajar modern untuk memastikan kesiapan maksimal Anda.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Smart Shuffle Engine</h3>
              <p className="text-on-secondary-container text-sm">Sistem pengacak soal canggih yang memastikan setiap sesi latihan memberikan tantangan baru, mencegah Anda sekadar menghafal posisi jawaban.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Ranking Nasional Real-time</h3>
              <p className="text-on-secondary-container text-sm">Bandingkan kemampuan Anda dengan ribuan peserta lain di seluruh Indonesia secara langsung setiap kali menyelesaikan simulasi ujian.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">AI Diagnostic Roadmap</h3>
              <p className="text-on-secondary-container text-sm">Teknologi AI kami menganalisis hasil latihan Anda untuk menyusun peta jalan belajar yang dipersonalisasi sesuai kelemahan materi Anda.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Akses Fleksibel</h3>
              <p className="text-on-secondary-container text-sm">Belajar kapan saja dan di mana saja. Platform kami dioptimalkan sepenuhnya untuk akses via HP, Tablet, maupun Laptop.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Materi Terupdate</h3>
              <p className="text-on-secondary-container text-sm">Bank soal dan modul materi selalu diperbarui mengikuti kisi-kisi (FR) terbaru setiap tahunnya oleh tim ahli kami.</p>
            </div>
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-outline-variant/10 text-center hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Harga Terjangkau</h3>
              <p className="text-on-secondary-container text-sm">Dapatkan akses ke fitur premium dengan harga yang sangat ekonomis. Investasi cerdas untuk masa depan karier Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Fitur Unggulan Dashboard */}
      <section className="py-14 md:py-24 bg-surface" id="fitur-unggulan">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight mb-4">Satu Platform, Solusi Lengkap Lulus CPNS</h2>
            <p className="text-on-secondary-container text-lg max-w-2xl mx-auto">Fitur lengkap dan canggih untuk menemani perjuanganmu meraih NIP.</p>
          </div>

          <div className="space-y-20">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold text-on-surface mb-4 flex items-center gap-3">
                  <MonitorPlay className="w-8 h-8 text-primary" /> Learning Hub
                </h3>
                <p className="text-lg text-on-secondary-container mb-6">
                  Pusat materi belajar yang rapi dan terstruktur. Tersedia dalam bentuk teks maupun video yang mudah dipahami. Semua materi disusun runut dari dasar hingga tingkat mahir.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Modul terstruktur sesuai kisi-kisi</li>
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Video pembelajaran interaktif</li>
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Ringkasan materi untuk review cepat</li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-surface-container-low p-4 rounded-3xl border border-outline-variant/20 shadow-xl">
                <div className="aspect-video bg-surface rounded-2xl border border-outline-variant/10 flex items-center justify-center overflow-hidden relative">
                   <Image src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Learning Hub" width={800} height={450} className="object-cover w-full h-full opacity-90 hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                   <div className="absolute bottom-4 left-4 text-white font-bold text-lg">Platform Belajar Terpusat</div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-surface-container-low p-4 rounded-3xl border border-outline-variant/20 shadow-xl">
                <div className="aspect-video bg-surface rounded-2xl border border-outline-variant/10 flex items-center justify-center overflow-hidden relative">
                   <Image src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Tryout & Exam" width={800} height={450} className="object-cover w-full h-full opacity-90 hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                   <div className="absolute bottom-4 left-4 text-white font-bold text-lg">Simulasi Ujian Realistis</div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-on-surface mb-4 flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" /> Tryout & Exam
                </h3>
                <p className="text-lg text-on-secondary-container mb-6">
                  Uji kemampuanmu dengan simulasi tryout yang 100% mirip dengan sistem CAT BKN. Latih manajemen waktumu dan rasakan atmosfer ujian sesungguhnya.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Interface anti-lag mirip CAT asli</li>
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Timer per sesi ujian</li>
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Soal terupdate tingkat nasional</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold text-on-surface mb-4 flex items-center gap-3">
                  <LineChart className="w-8 h-8 text-primary" /> Performa & Statistik
                </h3>
                <p className="text-lg text-on-secondary-container mb-6">
                  Lihat grafik perkembangan nilaimu dari waktu ke waktu. Sistem kami akan memberitahu topik mana yang kamu kuasai dan topik mana yang masih butuh perbaikan.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Analisa kelemahan otomatis</li>
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Grafik progres nilai Tryout</li>
                  <li className="flex items-center gap-2 text-on-surface"><CheckCircle2 className="w-5 h-5 text-green-500" /> Ranking nasional real-time</li>
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-surface-container-low p-4 rounded-3xl border border-outline-variant/20 shadow-xl">
                <div className="aspect-video bg-surface rounded-2xl border border-outline-variant/10 flex items-center justify-center overflow-hidden relative">
                   <Image src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Performa & Statistik" width={800} height={450} className="object-cover w-full h-full opacity-90 hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                   <div className="absolute bottom-4 left-4 text-white font-bold text-lg">Grafik Analisa Mendalam</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Lihat Progres Belajarmu Setiap Saat */}
      <section className="py-14 md:py-24 bg-surface-container-lowest" id="progres-belajar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-surface-container-low p-6 rounded-[2.5rem] border border-outline-variant/20 shadow-2xl relative z-10 overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Dashboard Analytics" width={800} height={600} className="rounded-3xl shadow-lg" />
                {/* Floating Stats Cards */}
                <div className="absolute top-12 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-outline-variant/10 animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Skor Rata-rata</p>
                      <p className="text-lg font-black text-primary">485.5</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-outline-variant/10 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Sisa Waktu</p>
                      <p className="text-lg font-black text-primary">00:45:20</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] -z-0 blur-2xl"></div>
            </div>
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">Evaluasi Berbasis Data</span>
              <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter leading-tight mb-6">
                Belajar Lebih Terukur dengan <br />
                <span className="text-brand-green">Analitik Cerdas.</span>
              </h2>
              <p className="text-lg text-on-secondary-container leading-relaxed mb-10">
                Jangan belajar tanpa arah. Dengan sistem analitik kami, Anda tahu persis sejauh mana persiapan Anda dan topik mana yang harus segera diperbaiki sebelum hari H.
              </p>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <BarChart className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Grafik Analisa Detail</h4>
                    <p className="text-on-secondary-container">Dapatkan laporan mendalam setelah setiap tryout. Lihat perolehan skor per kategori (TWK, TIU, TKP) dengan tampilan visual yang mudah dimengerti.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Target className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Evaluasi Titik Lemah</h4>
                    <p className="text-on-secondary-container">Sistem kami mendeteksi sub-materi yang paling sering salah Anda jawab, sehingga Anda bisa fokus belajar pada bagian yang paling krusial.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">Manajemen Waktu</h4>
                    <p className="text-on-secondary-container">Lihat berapa lama waktu yang Anda habiskan untuk setiap soal. Latih kecepatan berpikir Anda agar tidak kehabisan waktu saat ujian asli.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Perjalanan Menjadi ASN */}
      <section className="py-14 md:py-24 bg-surface-container-low" id="perjalanan">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight mb-4">Langkah Mudahnya</h2>
            <p className="text-on-secondary-container text-lg max-w-2xl mx-auto">Perjalanan kamu menuju Nomor Induk Pegawai (NIP) dimulai dari sini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-outline-variant/20 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 bg-surface p-6 rounded-2xl shadow border border-outline-variant/10 text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 border-4 border-surface">1</div>
              <h4 className="font-bold text-on-surface mb-2">Daftar Akun</h4>
              <p className="text-sm text-on-secondary-container">Buat akun gratismu hanya dalam waktu 1 menit.</p>
            </div>
            <div className="relative z-10 bg-surface p-6 rounded-2xl shadow border border-outline-variant/10 text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 border-4 border-surface">2</div>
              <h4 className="font-bold text-on-surface mb-2">Belajar Materi</h4>
              <p className="text-sm text-on-secondary-container">Pahami konsep dasar dengan modul & video pembelajaran.</p>
            </div>
            <div className="relative z-10 bg-surface p-6 rounded-2xl shadow border border-outline-variant/10 text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 border-4 border-surface">3</div>
              <h4 className="font-bold text-on-surface mb-2">Latihan Tryout</h4>
              <p className="text-sm text-on-secondary-container">Uji kemampuan dengan sistem CAT BKN yang sesungguhnya.</p>
            </div>
            <div className="relative z-10 bg-surface p-6 rounded-2xl shadow border border-outline-variant/10 text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 border-4 border-surface">4</div>
              <h4 className="font-bold text-on-surface mb-2">Lulus CPNS!</h4>
              <p className="text-sm text-on-secondary-container">Raih impianmu dengan percaya diri di hari ujian.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tentang COBACPNS */}
      <section className="py-14 md:py-24 bg-surface" id="tentang">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest">
                <Image alt="Tentang COBACPNS" width={600} height={400} className="w-full h-auto object-cover" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter mb-4 md:mb-6">Tentang COBACPNS</h2>
              <p className="text-lg text-on-secondary-container leading-relaxed mb-6">
                Kami hadir dengan niat sederhana: Membantu kamu belajar CPNS tanpa harus pusing cari materi sana-sini. Kami mengumpulkan pakar materi dan menggabungkannya dengan teknologi agar belajarmu jadi lebih gampang.
              </p>
              <p className="text-lg text-on-secondary-container leading-relaxed mb-8">
                Dengan COBACPNS, kamu nggak cuma sekadar latihan soal, tapi kamu juga dibimbing buat tahu mana kelebihanmu dan mana materi yang masih harus kamu kejar. Mari berjuang bersama, dan jadikan tahun ini sebagai tahun kelulusanmu!
              </p>
              <div className="flex items-center gap-4 bg-surface-container p-4 rounded-2xl inline-flex border border-outline-variant/20 shadow-sm">
                <div className="text-center px-4">
                  <h4 className="text-2xl font-black text-primary">50rb+</h4>
                  <p className="text-sm text-on-secondary-container">Pengguna Aktif</p>
                </div>
                <div className="w-px h-10 bg-outline-variant/30"></div>
                <div className="text-center px-4">
                  <h4 className="text-2xl font-black text-green-600">Terpercaya</h4>
                  <p className="text-sm text-on-secondary-container">Platform Nasional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Apa Kata Mereka Yang Lulus? / Testimoni */}
      <section className="py-14 md:py-24 bg-surface" id="testimoni">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Cerita Sukses <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">Alumni</span>
            </h2>
            <p className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan peserta lain yang telah membuktikan keakuratan sistem kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
              <div className="text-4xl font-black text-slate-900 mb-1">98%</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tingkat Kemiripan</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
              <div className="text-4xl font-black text-slate-900 mb-1">4.9/5</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Rating Peserta</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
              <div className="text-4xl font-black text-slate-900 mb-1">10k+</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pengguna Aktif</div>
            </div>
          </div>
          
          {/* Video Testimonials — loaded lazily so they don't block page render */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xl border border-outline-variant/20 relative" style={{ aspectRatio: '16/9' }}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                title="Testimoni Video 1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xl border border-outline-variant/20 relative" style={{ aspectRatio: '16/9' }}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                title="Testimoni Video 2"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          <TestimonialCarousel testimonials={testimonialsData} />
        </div>
      </section>
      
      {/* 7. Pricing Section */}
      <section className="py-14 md:py-24 px-4 sm:px-6 bg-surface-container-low" id="harga">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter mb-4">Pilih Jalur Suksesmu</h2>
            <p className="text-on-secondary-container text-lg">Investasi terbaik untuk masa depan karier abdi negara Anda.</p>
          </div>
          <PricingTable />

        </div>
      </section>

      {/* 8. Contact Us Section */}
      <section className="py-14 md:py-24 bg-surface" id="kontak">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter mb-4">Butuh Bantuan?</h2>
            <p className="text-on-secondary-container text-lg">Jangan ragu untuk menghubungi kami jika ada pertanyaan seputar pendaftaran atau fitur.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Email Kami</h3>
              <p className="text-on-secondary-container mb-4">Kirim email kapan saja, admin kami akan merespons secepatnya.</p>
              <a href={`mailto:${settings.contactEmail || 'support@cobapns.com'}`} className="text-primary font-bold hover:underline inline-flex items-center gap-2">
                {settings.contactEmail || 'support@cobapns.com'}
              </a>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mx-auto mb-6">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Chat WhatsApp</h3>
              <p className="text-on-secondary-container mb-4">Lebih suka chat langsung? Hubungi admin via WhatsApp di jam kerja.</p>
              <a href={`https://wa.me/${settings.contactPhone || '6281234567890'}`} target="_blank" rel="noreferrer" className="text-green-600 font-bold hover:underline inline-flex items-center gap-2">
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-20 bg-primary-container text-on-primary-container relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight">Siap Memulai Belajarmu?</h2>
          <p className="text-base md:text-xl opacity-90 mb-8 md:mb-10 max-w-2xl mx-auto">Jangan tunda lagi! Semakin cepat kamu mulai, semakin besar peluangmu untuk lulus CPNS tahun ini.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/register" className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform">Daftar Akun Gratis</Link>
            <Link href="#kontak" className="bg-primary-fixed-dim text-on-primary-fixed px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary-fixed transition-colors">Tanya Admin</Link>
          </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-2xl -ml-32 -mb-32"></div>
      </section>
    </>
  );
}
