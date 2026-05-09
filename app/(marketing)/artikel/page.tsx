import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Tag, ArrowRight, BookOpen, Search } from "lucide-react"
import { getPublishedArticles } from "@/app/actions/articles"
import { CURRENT_YEAR } from "@/lib/utils"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Artikel & Tips CPNS | COBAPNS",
  description: "Baca artikel terbaru seputar persiapan CPNS, tips SKD, materi TWK TIU TKP, dan panduan pendaftaran PNS terlengkap dari COBAPNS.",
  openGraph: {
    title: "Artikel & Tips CPNS | COBAPNS",
    description: "Tips, panduan, dan artikel terlengkap untuk persiapan CPNS. Temukan strategi lulus SKD dan wawasan terbaru seputar rekrutmen PNS.",
    type: "website",
  },
}

interface Props {
  searchParams: Promise<{ kategori?: string; tag?: string; q?: string }>
}

export default async function ArtikelPage({ searchParams }: Props) {
  const { kategori, tag, q } = await searchParams

  const articles = await getPublishedArticles({
    category: kategori,
    tag,
    search: q,
  })

  const formatDate = (d: Date | null) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : ""

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,#1E73BE,transparent_60%)]" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,#2DBE60,transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold tracking-widest uppercase mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Blog COBAPNS {CURRENT_YEAR}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-6">
            Artikel & Tips{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              Persiapan CPNS
            </span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Temukan strategi lulus, tips belajar, dan panduan terlengkap untuk menghadapi Seleksi Kompetensi Dasar (SKD) CPNS.
          </p>

          {/* Search */}
          <div className="mt-10 max-w-xl mx-auto">
            <form method="GET" action="/artikel" className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari artikel, tips, panduan..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/15 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Active filters */}
          {(kategori || tag || q) && (
            <div className="mb-8 flex items-center gap-3 flex-wrap">
              <span className="text-sm text-slate-500">Filter aktif:</span>
              {q && (
                <Link href="/artikel" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full hover:bg-blue-200 transition-colors">
                  Pencarian: &quot;{q}&quot; ×
                </Link>
              )}
              {kategori && (
                <Link href="/artikel" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full hover:bg-purple-200 transition-colors">
                  Kategori: {kategori} ×
                </Link>
              )}
              {tag && (
                <Link href="/artikel" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full hover:bg-green-200 transition-colors">
                  Tag: #{tag} ×
                </Link>
              )}
              <Link href="/artikel" className="text-xs text-slate-400 hover:text-slate-600 underline">
                Hapus semua filter
              </Link>
            </div>
          )}

          {articles.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-600 mb-3">
                {q || kategori || tag ? "Artikel tidak ditemukan" : "Belum Ada Artikel"}
              </h2>
              <p className="text-slate-400 max-w-md mx-auto">
                {q || kategori || tag
                  ? "Coba ubah kata kunci atau hapus filter yang aktif."
                  : "Tim konten kami sedang menyiapkan artikel terbaik. Pantau terus!"}
              </p>
              {(q || kategori || tag) && (
                <Link href="/artikel" className="mt-6 inline-block text-blue-600 font-bold text-sm hover:underline">
                  ← Lihat semua artikel
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Menampilkan <strong className="text-slate-800">{articles.length}</strong> artikel
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, idx) => (
                  <Link
                    key={article.id}
                    href={`/artikel/${article.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Cover */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={idx < 3}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <BookOpen className="w-20 h-20 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {article.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                            {article.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <h2 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(article.publishedAt)}
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-bold group-hover:gap-2 transition-all">
                          Baca <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Tags */}
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4">
            Siap berlatih langsung?
          </h2>
          <p className="text-slate-500 mb-8">
            Tingkatkan persiapan CPNS kamu dengan tryout, materi, dan analitik cerdas dari COBAPNS.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Coba Gratis Sekarang
            </Link>
            <Link
              href="/#harga"
              className="bg-slate-100 text-slate-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Lihat Paket Belajar
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
