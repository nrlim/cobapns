"use client"

import { useState, useTransition } from "react"
import { submitPublicTestimonial } from "./actions"
import { CheckCircle2, Loader2, Star, Camera, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

const AVAILABLE_TAGS = [
  "Materi Akurat",
  "UI Bersih",
  "Soal Update",
  "Mudah Dipahami",
  "Sangat Membantu",
  "Penjelasan Lengkap",
  "Sistem CAT Realistis",
  "Harga Terjangkau"
]

export function TestimonialSubmitForm() {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [guestName, setGuestName] = useState("")
  const [guestRole, setGuestRole] = useState("")
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagsInput, setTagsInput] = useState("") // Allow custom tags
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran foto maksimal 2MB.")
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    
    let finalTags = [...tags]
    if (tagsInput.trim()) {
      const customTags = tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      finalTags = [...finalTags, ...customTags]
    }

    if (!guestName || !guestRole || !content || finalTags.length === 0) {
      setErrorMsg("Harap lengkapi semua field dan pilih minimal 1 tag.")
      return
    }

    const formData = new FormData()
    formData.append("guestName", guestName)
    formData.append("guestRole", guestRole)
    formData.append("rating", rating.toString())
    formData.append("content", content)
    formData.append("tags", JSON.stringify(finalTags))
    if (avatarFile) {
      formData.append("guestAvatar", avatarFile)
    }

    startTransition(async () => {
      try {
        await submitPublicTestimonial(formData)
        setIsSuccess(true)
      } catch (err: any) {
        setErrorMsg(err.message || "Something went wrong.")
      }
    })
  }

  if (isSuccess) {
    return (
      <div className="text-center py-10">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-[#2DBE60]" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Terima Kasih!</h2>
        <p className="text-slate-500 font-medium text-lg">
          Testimoni Anda berhasil dikirimkan. Sukses selalu untuk karier Anda!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="flex flex-col items-center justify-center mb-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block text-center">Foto Profil (Opsional)</label>
        <label className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden transition-colors group-hover:border-[#1E73BE] group-hover:bg-blue-50">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-slate-400 group-hover:text-[#1E73BE] transition-colors" />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Upload</span>
            </div>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isPending} />
        </label>
        <p className="text-[11px] text-slate-400 mt-2">Maksimal 2MB</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nama Lengkap</label>
          <input 
            type="text" 
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E73BE]/20 focus:border-[#1E73BE]"
            placeholder="Contoh: Budi Santoso"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Profesi / Instansi Kelulusan</label>
          <input 
            type="text" 
            value={guestRole}
            onChange={(e) => setGuestRole(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E73BE]/20 focus:border-[#1E73BE]"
            placeholder="Contoh: Lulus PNS Kemenkeu"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block text-center">Beri Penilaian</label>
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
                  "w-12 h-12 transition-colors",
                  (hoveredRating || rating) >= star 
                    ? "fill-[#2DBE60] text-[#2DBE60]" 
                    : "text-slate-200"
                )} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Pilih Fitur Favorit Anda</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {AVAILABLE_TAGS.map(tag => {
            const isSelected = tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-full border transition-all",
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
        <input 
          type="text" 
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E73BE]/20 focus:border-[#1E73BE] text-sm"
          placeholder="Atau ketik tag custom (pisahkan dengan koma)..."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Ceritakan Pengalaman Anda</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E73BE]/20 focus:border-[#1E73BE] h-32 resize-none"
          placeholder="Sumpah tryoutnya mirip banget sama CAT asli..."
          required
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending || !guestName || !guestRole || !content}
        className="w-full py-4 bg-[#1E73BE] hover:bg-[#1a65a7] text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1E73BE]/20 flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
        Kirim Testimoni
      </button>
    </form>
  )
}
