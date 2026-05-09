"use client"

import { Share2, Facebook, Instagram, Link as LinkIcon } from "lucide-react"

interface Props {
  title: string
  url: string
}

export function ShareButtons({ title, url }: Props) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    alert("Tautan artikel berhasil disalin!")
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + " - " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white text-xs font-bold rounded-xl hover:bg-[#1DA851] transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        WhatsApp
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-xl hover:bg-[#145CB3] transition-colors"
      >
        <Facebook className="w-3.5 h-3.5" />
        Facebook
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors"
      >
        <span className="font-serif font-black text-[14px] leading-none mb-0.5">X</span>
        Twitter
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors"
      >
        <LinkIcon className="w-3.5 h-3.5" />
        Salin Tautan
      </button>
    </div>
  )
}
