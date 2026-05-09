import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Tag, ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react"
import { getArticleBySlug, getPublishedArticles } from "@/app/actions/articles"
import { ShareButtons } from "@/components/shared/ShareButtons"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return { title: "Artikel Tidak Ditemukan | COBAPNS" }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cobapns.com"
  const ogImage = article.ogImage ?? article.coverImage ?? `${baseUrl}/og-default.png`

  return {
    title:       article.metaTitle ?? `${article.title} | COBAPNS`,
    description: article.metaDescription ?? article.excerpt ?? undefined,
    keywords:    article.metaKeywords ?? undefined,
    alternates: {
      canonical: article.canonicalUrl ?? `${baseUrl}/artikel/${slug}`,
    },
    openGraph: {
      title:       article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt ?? undefined,
      type:        "article",
      url:         `${baseUrl}/artikel/${slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime:  article.updatedAt?.toISOString(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt ?? undefined,
      images:      [ogImage],
    },
  }
}

// Estimate reading time
function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

// Very basic Markdown → HTML renderer (handles headings, bold, italic, links, lists)
function simpleMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hHuUlLoO])(.*)/gm, (m) => (m.trim() ? `<p>${m}</p>` : ""))
}

export default async function ArtikelDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) notFound()

  // Related articles (same category, exclude current)
  const related = await getPublishedArticles({ category: article.category ?? undefined, take: 3 })
  const relatedFiltered = related.filter((a) => a.slug !== slug).slice(0, 2)

  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""

  const minutes = readingTime(article.content)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cobapns.com"
  const articleUrl = `${baseUrl}/artikel/${slug}`

  // Structured data (Article schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt,
    image: article.ogImage ?? article.coverImage,
    url: article.canonicalUrl ?? articleUrl,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "COBAPNS",
      logo: { "@type": "ImageObject", url: `${baseUrl}/icon-cpns.png` },
    },
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,#1E73BE,transparent_60%)]" />
          {article.coverImage && (
            <div className="absolute inset-0">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
            </div>
          )}
          <div className="relative max-w-4xl mx-auto px-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
              <Link href="/" className="hover:text-white/80 transition-colors">Beranda</Link>
              <span>/</span>
              <Link href="/artikel" className="hover:text-white/80 transition-colors">Artikel</Link>
              {article.category && (
                <>
                  <span>/</span>
                  <Link
                    href={`/artikel?kategori=${encodeURIComponent(article.category)}`}
                    className="hover:text-white/80 transition-colors"
                  >
                    {article.category}
                  </Link>
                </>
              )}
            </nav>

            {article.category && (
              <span className="inline-block px-3 py-1 bg-blue-600/80 text-white text-xs font-bold rounded-full mb-5">
                {article.category}
              </span>
            )}

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-6">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-3xl">{article.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(article.publishedAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {minutes} menit baca
              </div>
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.slice(0, 4).map((tag) => (
                    <Link
                      key={tag}
                      href={`/artikel?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 hover:bg-white/20 text-white/70 text-xs rounded-full transition-colors"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            <div className="flex gap-12">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(article.content) }}
                />

                {/* Share */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-2">Bagikan Artikel Ini:</p>
                      <ShareButtons title={article.title} url={articleUrl} />
                    </div>

                    <Link
                      href="/artikel"
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Semua Artikel
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedFiltered.length > 0 && (
          <section className="py-14 bg-slate-50 border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-2xl font-black text-slate-900 mb-8">Artikel Terkait</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedFiltered.map((a) => (
                  <Link
                    key={a.id}
                    href={`/artikel/${a.slug}`}
                    className="group flex gap-4 bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    {a.coverImage && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={a.coverImage} alt={a.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {a.category && (
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{a.category}</span>
                      )}
                      <h3 className="font-bold text-slate-800 text-sm leading-snug mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-1 text-blue-600 text-xs font-bold mt-2 group-hover:gap-2 transition-all">
                        Baca <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
          <div className="max-w-2xl mx-auto px-6">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-black mb-3">Siap Berlatih Sekarang?</h2>
            <p className="text-blue-100 mb-8">
              Jadikan pengetahuan dari artikel ini sebagai bekal latihan tryout di COBAPNS.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-7 py-3.5 rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Daftar Gratis
              </Link>
              <Link
                href="/artikel"
                className="bg-blue-500/50 border border-blue-400/50 text-white px-7 py-3.5 rounded-2xl font-bold hover:bg-blue-500/70 transition-colors"
              >
                Artikel Lainnya
              </Link>
            </div>
          </div>
        </section>
      </article>
    </>
  )
}
