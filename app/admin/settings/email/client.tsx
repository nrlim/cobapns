"use client"

import React, { useState } from "react"
import { Plus, Save, Trash2, Code2, Edit2, X, Check, Search, Eye, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertEmailTemplate, deleteEmailTemplate } from "./actions"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NotificationToast } from "@/components/ui/notification-toast"

const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama template minimal 3 karakter"),
  subject: z.string().min(3, "Subjek email minimal 3 karakter"),
  htmlBody: z.string().min(5, "Konten HTML minimal 5 karakter"),
  description: z.string().optional(),
})

type FormData = z.infer<typeof templateSchema>

export function EmailTemplatesClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"code" | "preview">("code")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", subject: "", htmlBody: "<div>\n  <h1>Hello {{name}}</h1>\n</div>", description: "" }
  })

  const htmlBody = watch("htmlBody")

  // Simple interpolation for preview — matches {key} single-curly
  const getPreviewHtml = () => {
    let html = htmlBody
    const testVars: Record<string, string> = { name: "User Test", app_name: "COBA PNS Platform", reset_link: "https://cobapns.com/reset-password?token=xxx" }
    for (const [key, value] of Object.entries(testVars)) {
      const regex = new RegExp(`\\{\\s*${key}\\s*\\}`, 'g');
      html = html.replace(regex, value);
    }
    return html
  }

  // Basic search filter
  const filteredTemplates = initialData.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openNew = () => {
    reset({ name: "", subject: "", htmlBody: "<div>\n  <h1 style=\"color: #0F4FA8;\">Halo {{name}}</h1>\n  <p>Pesan Anda di sini...</p>\n</div>", description: "" })
    setViewMode("code")
    setIsEditorOpen(true)
  }

  const openEdit = (template: any) => {
    reset({
      id: template.id,
      name: template.name,
      subject: template.subject,
      htmlBody: template.htmlBody,
      description: template.description || "",
    })
    setViewMode("code")
    setIsEditorOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus template ini? Proses tidak dapat dibatalkan.")) {
      setDeletingId(id)
      await deleteEmailTemplate(id)
      setDeletingId(null)
      router.refresh()
    }
  }

  const onSubmit = async (data: FormData) => {
    const res = await upsertEmailTemplate(data)
    if (res.success) {
      setIsEditorOpen(false)
      reset()
      router.refresh()
      setNotification({ type: "success", title: "Template Tersimpan", message: "Template email berhasil disimpan." })
    } else {
      setNotification({ type: "error", title: "Gagal Menyimpan", message: res.error })
    }
  }

  if (isEditorOpen) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {notification && (
          <NotificationToast
            type={notification.type}
            title={notification.title}
            message={notification.message}
            isOpen={!!notification}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand-blue" />
            {watch("id") ? "Edit Template HTML" : "Buat Template Baru"}
          </h4>
          <Button variant="ghost" size="sm" onClick={() => setIsEditorOpen(false)} className="text-slate-500 hover:bg-slate-100 rounded-full h-8 px-3">
            <X className="w-4 h-4 mr-1" /> Batal
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500">Nama Template (Unik)</label>
              <Input {...register("name")} placeholder="Cth: WELCOME_EMAIL" className="font-mono bg-slate-50 focus:bg-white transition-colors border-slate-200" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500">Subjek Email</label>
              <Input {...register("subject")} placeholder="Cth: Selamat Datang di COBA PNS!" className="bg-slate-50 focus:bg-white transition-colors border-slate-200" />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-slate-500">Deskripsi Kegunaan</label>
            <Input {...register("description")} placeholder="Cth: Digunakan saat user baru pertama kali mendaftar akun." className="bg-slate-50 focus:bg-white transition-colors border-slate-200" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-widest uppercase text-brand-blue border-l-2 border-blue-500 pl-2">Editor Template</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  type="button"
                  onClick={() => setViewMode("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${viewMode === 'code' ? 'bg-white text-brand-blue-deep shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Code className="w-3.5 h-3.5" /> Code
                </button>
                <button 
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${viewMode === 'preview' ? 'bg-white text-brand-blue-deep shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>

            {viewMode === "code" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                   <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
                    Variabel: {"` {nama_variabel} `"} 
                  </span>
                </div>
                <textarea 
                  {...register("htmlBody")} 
                  rows={15}
                  className="w-full font-mono text-sm p-4 bg-slate-900 text-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 resize-y shadow-inner leading-relaxed" 
                  placeholder="<html><body><h1>Hello World</h1></body></html>"
                  spellCheck={false}
                />
                {errors.htmlBody && <p className="text-red-500 text-xs mt-1">{errors.htmlBody.message}</p>}
              </div>
            ) : (
              <div className="w-full h-[400px] bg-slate-100 rounded-xl p-4 md:p-8 flex items-center justify-center border border-slate-200 overflow-hidden relative group">
                 <div className="w-full max-w-[600px] h-full bg-white rounded-lg shadow-lg border border-slate-200 overflow-y-auto">
                    <iframe 
                      title="Email Preview"
                      srcDoc={getPreviewHtml()}
                      className="w-full h-full border-none"
                    />
                 </div>
                 <div className="absolute bottom-4 right-4 bg-brand-blue-deep text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    Simulated Email Layout
                 </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold px-8 shadow-md">
              {isSubmitting ? "Menyimpan..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Template
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-300">
      {notification && (
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isOpen={!!notification}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama template..." 
            className="pl-9 bg-slate-50 border-none focus-visible:ring-blue-500/30"
          />
        </div>
        <Button onClick={openNew} className="w-full sm:w-auto bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold rounded-xl shadow-md transition-all whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Template Baru
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px] font-bold text-slate-500 uppercase text-[10px] tracking-wider">Nama Template</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Subjek</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider hidden md:table-cell">Deskripsi</TableHead>
              <TableHead className="w-[150px] font-bold text-slate-500 uppercase text-[10px] tracking-wider hidden lg:table-cell">Modifikasi</TableHead>
              <TableHead className="text-right w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 bg-slate-50/50">
                  <Code2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold mb-1">Belum ada template email</p>
                  <p className="text-slate-400 text-sm">Buat template pertama Anda untuk mulai mengirim email dinamis.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((t) => (
                <TableRow key={t.id} className="group hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-medium">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-blue-50 text-brand-blue-deep rounded-md border border-blue-100">
                      {t.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-800 text-sm max-w-[200px] truncate">{t.subject}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm text-slate-500 truncate max-w-[250px]">
                      {t.description || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-slate-500 font-medium">
                    {new Date(t.updatedAt).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)} className="h-8 text-brand-blue bg-blue-50 hover:bg-blue-100 text-xs font-bold">
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(t.id)} 
                        disabled={deletingId === t.id}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
