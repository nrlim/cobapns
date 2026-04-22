import { ExamFormClient } from "@/components/admin/exam-form-client"

export const metadata = {
  title: "Buat Ujian Baru – COBA PNS Admin",
  description: "Konfigurasi dan buat ujian Try Out CAT baru untuk siswa COBA PNS.",
}

export default function NewExamPage() {
  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      {/* Page Header */}
      <div className="px-4 md:px-8 lg:px-10 pt-6 md:pt-8 lg:pt-10 pb-6 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
            <span className="text-teal-700 font-black text-sm">+</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Exam Builder</p>
        </div>
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mt-1">
          Buat Ujian Baru
        </h2>
        <p className="text-slate-500 font-medium text-sm mt-1">
          Konfigurasi judul, durasi, passing grade, status, dan izin akses ujian.
        </p>
      </div>

      {/* Form Area — full width with comfortable padding */}
      <div className="flex-1 p-4 md:p-8 lg:p-10">
        <ExamFormClient />
      </div>
    </div>
  )
}
