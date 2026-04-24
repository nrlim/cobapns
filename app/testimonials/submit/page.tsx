import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, BookOpen, LineChart, Quote } from "lucide-react"
import { TestimonialSubmitForm } from "./TestimonialSubmitForm"

export const metadata = {
  title: "Submit Testimonial - COBA PNS",
  description: "Share your success story with the COBA PNS community.",
}

export default async function SubmitTestimonialPage() {
  const config = await prisma.systemConfig.findUnique({
    where: { id: "global_config" }
  })

  // Common Layout Wrapper for consistent Branding
  const PageWrapper = ({ children, isError = false }: { children: React.ReactNode, isError?: boolean }) => (
    <main className="fixed inset-0 w-full h-full bg-white z-[9999] overflow-hidden font-sans">
      <div className="w-full flex flex-col lg:flex-row h-full">
        {/* Left Side: Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between px-16 py-12 relative overflow-hidden h-full bg-gradient-to-br from-[#0F4FA8] to-[#1E73BE]">
          <Link href="/" className="group z-10 flex items-center gap-2 w-fit">
            <img src="/icon-cpns.png" alt="COBA PNS Logo" className="h-12 w-auto drop-shadow-md hover:-translate-y-0.5 transition-transform brightness-0 invert" />
            <h2 className="text-2xl font-black leading-none tracking-tight group-hover:opacity-90 transition-opacity">
              <span className="text-white">COBA</span>
              <span className="text-[#2DBE60]">PNS</span>
            </h2>
          </Link>

          <div className="absolute inset-0 opacity-10">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPDyEIDoncNBJJQCDk9w5UXVhcT2oBlRc6GBmETKFrRXa3ZCGa4ncclQBzxBLmQ-ot1Sv5l38zqHCUpIrnwBpXTjapK3JpDbkIPlj1_3fEVeQ8gITI8QKO7jYqwufaJPLqlQkg2zVATeMz-UHCFqGBfkJF9D0uBbNx9vnXu6JsMky8YBsCk5bF0M8XQvnl-Yft6WDIa9VSUMWMJgipnp9pQUBs25GQUQtIvARktoxjdp2cryIGJsCxjTth9PVPFmFCNgydMjqYLfg7"
              alt="Professional background"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="relative z-10">
            <div className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
              Masa Depan Abdi Negara
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
              {isError ? "Halaman Tidak" : "Bagikan Cerita"} <br />
              <span className="text-blue-300">{isError ? "Ditemukan." : "Suksesmu."}</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed mb-12 opacity-90">
              {isError
                ? "Maaf, form pengisian testimoni saat ini sedang ditutup atau tautan yang Anda gunakan tidak valid."
                : "Terima kasih telah menjadi bagian dari keluarga COBA PNS. Testimonimu akan menginspirasi ribuan pejuang lainnya."}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-300 flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Inspirasi Pejuang</h3>
                  <p className="text-sm text-blue-200 opacity-80">
                    Bantu rekan lain dengan pengalaman belajarmu.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-300 flex-shrink-0">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Komunitas Solid</h3>
                  <p className="text-sm text-blue-200 opacity-80">
                    Bersama-sama membangun ekosistem kelulusan ASN.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Content Area */}
        <div className="w-full lg:w-7/12 flex flex-col h-full overflow-y-auto bg-white">
          {/* Mobile-only Local Header */}
          <div className="lg:hidden w-full px-6 py-6 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
            <Link href="/">
              <img src="/logo-dashboard.png" alt="COBA PNS" className="h-8 w-auto" />
            </Link>
            <span className="text-gray-900 font-bold text-sm tracking-tight">{isError ? "Error 404" : "Kirim Testimoni"}</span>
          </div>

          <div className="w-full max-w-xl mx-auto px-6 py-8 lg:py-16">
            {children}
          </div>
        </div>
      </div>
    </main>
  );

  // 1. Error Page Case
  if (!config?.publicBackdoorEnabled) {
    return (
      <PageWrapper isError={true}>
        <div className="flex flex-col justify-center h-full w-full max-w-[420px] mx-auto text-center lg:text-left">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-4">
            Formulir Ditutup
          </h2>

          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Mohon maaf, saat ini kami tidak menerima pengiriman testimoni melalui jalur publik. Silakan hubungi admin jika ini adalah kesalahan.
          </p>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-[#1E73BE] hover:bg-[#1a65a7] text-white py-4 rounded-xl font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </PageWrapper>
    )
  }

  // 2. Success Case (Injected Form)
  return (
    <PageWrapper>
      <TestimonialSubmitForm />
      <p className="mt-8 text-center text-xs text-gray-400 font-medium">
        © {new Date().getFullYear()} COBA PNS. Semua data yang Anda kirimkan akan ditinjau oleh tim kami.
      </p>
    </PageWrapper>
  )
}
