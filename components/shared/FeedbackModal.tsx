"use client"

import { useState, useEffect } from "react"
import { Star, Quote, X, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const AVAILABLE_TAGS = [
  "Materi Akurat",
  "UI Bersih",
  "Soal Update",
  "Mudah Dipahami",
  "Sangat Membantu",
  "Penjelasan Lengkap"
]

export function FeedbackModal({ hasGivenFeedback }: { hasGivenFeedback: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (hasGivenFeedback) return

    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [hasGivenFeedback])

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || tags.length === 0) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content, tags })
      })

      if (res.ok) {
        setIsSuccess(true)
        setTimeout(() => setIsOpen(false), 3000)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#1E73BE]/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#2DBE60]/10 rounded-full blur-2xl" />

        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 relative z-10">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-[#2DBE60]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#2DBE60]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Terima Kasih!</h3>
              <p className="text-slate-500 font-medium">Feedback kamu sangat berarti untuk perkembangan COBA PNS.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1E73BE]/10 text-[#1E73BE] mb-4">
                  <Quote className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Bagaimana Pengalamanmu?</h3>
                <p className="text-sm font-medium text-slate-500">Bantu kami menjadi lebih baik dengan ulasanmu.</p>
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star 
                      className={cn(
                        "w-10 h-10 transition-colors",
                        (hoveredRating || rating) >= star 
                          ? "fill-[#2DBE60] text-[#2DBE60]" 
                          : "text-slate-200"
                      )} 
                    />
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Apa yang paling kamu suka?</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => {
                    const isSelected = tags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold rounded-full border transition-all",
                          isSelected 
                            ? "bg-[#1E73BE] border-[#1E73BE] text-white" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-[#1E73BE]/50"
                        )}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Ulasan Tambahan</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ceritakan pengalamanmu menggunakan COBA PNS..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E73BE]/20 focus:border-[#1E73BE] resize-none h-28 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim() || tags.length === 0}
                className="w-full py-4 bg-[#1E73BE] hover:bg-[#1a65a7] text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#1E73BE]/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Kirim Ulasan
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
