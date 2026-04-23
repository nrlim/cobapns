import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ExamFormClient } from "@/components/admin/exam-form-client"
import { Pencil } from "lucide-react"

export const metadata = {
  title: "Edit Ujian – COBA PNS Admin",
}

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exam = await prisma.exam.findUnique({ where: { id } })
  if (!exam) notFound()

  return (
    <div className="w-full flex flex-col flex-1 min-h-0">
      {/* Page Header */}
      <div className="px-4 md:px-8 lg:px-10 pt-6 md:pt-8 lg:pt-10 pb-6 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
            <Pencil className="w-3.5 h-3.5 text-brand-blue-deep" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep">Exam Builder</p>
        </div>
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 mt-1">
          Edit Konfigurasi Ujian
        </h2>
        <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl truncate">
          {exam.title}
        </p>
      </div>

      {/* Form Area — full width */}
      <div className="flex-1 p-4 md:p-8 lg:p-10">
        <ExamFormClient initialData={exam} />
      </div>
    </div>
  )
}
