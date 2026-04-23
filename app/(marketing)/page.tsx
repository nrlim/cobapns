import Link from "next/link";
import Image from "next/image";
import { 
  LineChart, Zap, Cpu, CreditCard, ShieldCheck, 
  CheckCircle2, Star, Rocket, Mail, Phone, 
  Target, TrendingUp, Clock 
} from "lucide-react";
import { getSettings } from "@/app/actions/settings";

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <main className="pt-16">
      {/* 1. Hero Section */}
      <section className="relative px-4 sm:px-6 pt-8 pb-16 md:pt-16 md:pb-32 overflow-hidden bg-surface">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(135deg,#1E73BE,#2DBE60)]" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold tracking-widest uppercase mb-6">Persiapan CPNS 2024</span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-6 md:mb-8">
              <span className="text-brand-blue">Sistem Persiapan CPNS</span>{" "}<br className="hidden md:block" />
              <span className="text-brand-green italic">Paling Mutakhir.</span>
            </h1>
            <p className="text-base md:text-xl text-on-secondary-container leading-relaxed max-w-xl mb-8 md:mb-10">
              Tingkatkan peluang kelulusan Anda dengan teknologi <span className="font-bold text-on-surface underline decoration-primary/30">Smart Shuffle Engine</span> &amp; <span className="font-bold text-on-surface underline decoration-primary/30">Diagnostic Roadmap</span> berstandar nasional. Antarmuka profesional, tanpa distraksi, dan teruji akurat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="primary-gradient text-on-primary px-6 py-3.5 rounded-xl font-bold text-base md:text-lg shadow-2xl shadow-primary/30 transition-transform active:scale-95 text-center">Coba Try Out Gratis</Link>
              <Link href="#harga" className="bg-surface-container-high text-primary px-6 py-3.5 rounded-xl font-bold text-base md:text-lg transition-all hover:bg-surface-container-highest text-center">Lihat Paket ELITE</Link>
            </div>
          </div>
          <div className="md:col-span-5 relative mt-12 md:mt-0">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-surface-container-lowest rotate-2 bg-surface-container-lowest">
              <Image alt="Professional studying" width={600} height={800} className="w-full h-auto object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-OS-zDEcYfpL0OQ0aGPPZBM8Gq6A6vYhXT2U-Gnoyn7SwnNgR0GZHCSkoG5-idKAMbK1Dcj6ZDslorQ3Ea9xlHYu5liWORoLVLxxEjarTtr6z7nteFZRzOJar0Zsec9MMR0v7Tbs2P7ZGexC3kjgv_rdwZGKVOltTpEEzESsq35Pxgq5ftWIiHSR8B8bnrgz8shwz2dJyXhUu7gIYxA5w7SfJ7357DfuXiNYHQi5I8vvJtDAv_Gn6cj2EqX9ZWXfQQ0_ReSxtG7U0" unoptimized />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-10 -left-10 bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline-variant/20 hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary">
                  <LineChart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Diagnostic Accuracy</p>
                  <p className="text-lg font-black text-primary">98.4%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Us Section (Build Trust early) */}
      <section className="py-14 md:py-24 bg-surface-container-low" id="tentang">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter mb-4 md:mb-6">Tentang Kami</h2>
              <p className="text-lg text-on-secondary-container leading-relaxed mb-6">
                COBA PNS didirikan dengan sebuah visi besar: Menjadikan persiapan CPNS lebih dari sekadar rutinitas menghafal. Kami percaya setiap calon abdi negara berhak mendapatkan akses ke teknologi pembelajaran yang cerdas, efisien, dan personal.
              </p>
              <p className="text-lg text-on-secondary-container leading-relaxed">
                Platform kami memadukan data analitik mendalam dengan inovasi <span className="font-bold text-on-surface">Smart Shuffle Engine</span>, yang dirancang khusus untuk memastikan setiap detik waktu belajar Anda menghasilkan progres yang nyata. Kami tidak hanya mendoakan Anda lulus, kami membantu merumuskan strategi matangnya.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest">
                <Image alt="Tim COBA PNS memantau pembelajaran" width={600} height={400} className="w-full h-auto object-cover" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" unoptimized />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-primary text-on-primary p-6 rounded-2xl shadow-xl border border-primary-container hidden md:block">
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-black">50k+</span>
                  <span className="text-sm font-medium opacity-90">User Aktif Setiap Bulan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-14 md:py-24 bg-surface" id="program">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-2xl md:text-5xl font-black text-on-surface tracking-tight mb-4">Inovasi Teknologi Pembelajaran</h2>
            <p className="text-on-secondary-container text-lg max-w-2xl mx-auto">Dikembangkan bersama ahli psikometri dan akademisi untuk memaksimalkan rasio pemahaman materi serta efisiensi waktu belajar Anda.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl transition-transform hover:-translate-y-2 border border-outline-variant/10 shadow-lg shadow-surface-container-lowest/50">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Diagnostic Roadmap</h3>
              <p className="text-on-secondary-container leading-relaxed">
                Pemetaan kelemahan secara presisi. Platform memberikan rekomendasi materi berdasarkan titik tertinggal Anda, menghemat waktu belajar hingga 70%.
              </p>
            </div>
            
            {/* Feature 2 (Center Highlight) */}
            <div className="bg-primary text-on-primary p-8 rounded-3xl shadow-2xl shadow-primary/30 relative overflow-hidden lg:-mt-4 lg:mb-4 transition-transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Cpu className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                  <Cpu className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Shuffle Engine</h3>
                <p className="text-on-primary/90 leading-relaxed">
                  Pola soal dan letak opsi jawaban selalu diacak secara logis setiap sesi. Mencegah penghafalan jawaban buta dan mendorong pemahaman logika asli.
                </p>
                <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest uppercase">Proprietary Tech</span>
                  <ShieldCheck className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl transition-transform hover:-translate-y-2 border border-outline-variant/10 shadow-lg shadow-surface-container-lowest/50">
              <div className="w-14 h-14 rounded-2xl bg-tertiary-container flex items-center justify-center text-tertiary mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Real-time Ranking</h3>
              <p className="text-on-secondary-container leading-relaxed">
                Ukur kemampuan Anda bersaing dengan puluhan ribu peserta lainnya di seluruh Indonesia via grafik performa komprehensif.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl transition-transform hover:-translate-y-2 border border-outline-variant/10 shadow-lg shadow-surface-container-lowest/50">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Time Analytics</h3>
              <p className="text-on-secondary-container leading-relaxed">
                Laporan detail waktu pengerjaan di level setiap soal individu, membantu perbaikan pacing ujian dan menyorot kebuntuan waktu tes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl transition-transform hover:-translate-y-2 border border-outline-variant/10 shadow-lg shadow-surface-container-lowest/50">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Zero-Lag Interface</h3>
              <p className="text-on-secondary-container leading-relaxed">
                Antarmuka CAT yang sangat ringan dan cepat di semua gawai. Simulasi yang 100% mulus untuk melatih stamina ujian Anda.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl transition-transform hover:-translate-y-2 border border-outline-variant/10 shadow-lg shadow-surface-container-lowest/50">
              <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary mb-6 flex-shrink-0">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Auto Activation</h3>
              <p className="text-on-secondary-container leading-relaxed">
                Sistem perbankan terintegrasi dengan beragam pilihan e-Wallet & QRIS membuat paket ujian dapat diakses kurang dari semenit dari check-out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section className="py-14 md:py-24 px-4 sm:px-6 bg-surface-container-low" id="harga">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter mb-4">Pilih Jalur Suksesmu</h2>
            <p className="text-on-secondary-container text-lg">Investasi terbaik untuk masa depan karier abdi negara Anda.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FREE ACCESS */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 flex flex-col h-full transition-transform hover:-translate-y-2 shadow-lg">
              <div className="mb-8">
                <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg uppercase tracking-wider">Coba Dulu</span>
                <h3 className="text-2xl font-bold text-on-surface mt-4 uppercase">Free Access</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-on-surface">Gratis</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  1x Mini Try Out CAT
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Akses materi dasar
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Laporan skor singkat
                </li>
              </ul>
              <Link href="/register" className="w-full py-4 text-center block bg-surface-container-high text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors">Mulai Gratis</Link>
            </div>

            {/* ELITE PREP */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border-2 border-primary ring-4 ring-primary/5 flex flex-col h-full relative transition-transform hover:-translate-y-2 shadow-xl shadow-primary/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Paling Populer</div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-on-surface mt-4 uppercase">Elite Prep</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-on-surface">Rp 129.000</span>
                  <span className="text-sm font-bold text-on-secondary-container">/bulan</span>
                </div>
              </div>
              <div className="mb-6 p-4 bg-primary/5 rounded-2xl">
                <p className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wide">
                  <Star className="w-4 h-4 fill-current" />
                  Feature Highlight
                </p>
                <p className="text-sm font-bold text-on-surface mt-1">Smart Shuffle Engine Enabled</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Unlimited Try Out CAT penuh
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Akses semua materi teks
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Ranking Nasional Real-time
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Analitik & Diagnostik mendalam
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Materi Strategi Digital (E-Book)
                </li>
              </ul>
              <Link href="/register?plan=elite" className="w-full py-4 text-center block primary-gradient text-on-primary font-bold rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity">Pilih Paket Elite</Link>
            </div>

            {/* MASTER STRATEGY */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 flex flex-col h-full transition-transform hover:-translate-y-2 shadow-lg">
              <div className="mb-8">
                <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold rounded-lg uppercase tracking-wider">Full Access</span>
                <h3 className="text-2xl font-bold text-on-surface mt-4 uppercase">Master Strategy</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-on-surface">Rp 249.000</span>
                  <span className="text-sm font-bold text-on-secondary-container">/bulan</span>
                </div>
              </div>
              <div className="mb-6 p-4 bg-tertiary/5 rounded-2xl">
                <p className="text-xs font-bold text-tertiary flex items-center gap-2 uppercase tracking-wide">
                  <Rocket className="w-4 h-4 fill-current" />
                  Premium Tech
                </p>
                <p className="text-sm font-bold text-on-surface mt-1">Diagnostic Roadmap Active</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Semua fitur Elite Prep
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Psikotes & Tes IQ Lengkap
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Video Lesson Eksklusif
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  AI Roadmap & Career Mapping
                </li>
                <li className="flex items-center gap-3 text-on-secondary-container">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  Priority Support 24/7
                </li>
              </ul>
              <Link href="/register?plan=master" className="w-full py-4 text-center block border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors">Dapatkan Full Access</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact Us Section */}
      <section className="py-14 md:py-24 bg-surface" id="kontak">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter mb-4">Layanan Bantuan</h2>
            <p className="text-on-secondary-container text-lg">Membutuhkan informasi lebih lanjut atau dukungan teknis? Tim kami yang berdedikasi senantiasa siap mendampingi persiapan Anda setiap saat.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Email Support</h3>
              <p className="text-on-secondary-container mb-4">Tim admin kami tanggap melayani dan akan membalas email dalam kurun 1x24 jam.</p>
              <a href={`mailto:${settings.contactEmail || 'support@cobapns.com'}`} className="text-primary font-bold hover:underline inline-flex items-center gap-2">
                {settings.contactEmail || 'support@cobapns.com'}
              </a>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-6">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">WhatsApp Official</h3>
              <p className="text-on-secondary-container mb-4">Butuh panduan interaktif yang lebih cepat? Pesan kami segera di jam kerja.</p>
              <a href={`https://wa.me/${settings.contactPhone || '6281234567890'}`} target="_blank" rel="noreferrer" className="text-green-600 dark:text-green-400 font-bold hover:underline inline-flex items-center gap-2">
                Chat via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="py-20 bg-primary-container text-on-primary-container relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight">Siap Mengabdi untuk Negeri?</h2>
          <p className="text-base md:text-xl opacity-90 mb-8 md:mb-10 max-w-2xl mx-auto">Ambil langkah pasti menuju karier masa depan Anda. Persiapkan diri secara komprehensif mulai hari ini dan bergabunglah bersama puluhan ribu abdi negara terbaik lulusan COBA PNS.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/register" className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform">Daftar Sekarang</Link>
            <Link href="#kontak" className="bg-primary-fixed-dim text-on-primary-fixed px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary-fixed transition-colors">Konsultasi Gratis</Link>
          </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-2xl -ml-32 -mb-32"></div>
      </section>
    </main>
  );
}
