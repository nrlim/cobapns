import React from "react"
import { prisma } from "@/lib/prisma"
import { EmailTemplatesClient } from "./client"
import { Mail, Zap, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Email Templates | COBA PNS Admin",
}

export default async function EmailTemplatesPage() {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      {/* Page Hero / Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1 lg:mb-2 text-opacity-80">Settings Base</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Email Templates</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Konfigurasi dinamis template HTML untuk notifikasi email ke pengguna.</p>
        </div>
      </div>

      {/* Stats Bento Grid Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-slate-200 shadow-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Template</CardTitle>
            <div className="p-2 bg-slate-100 rounded-full">
              <Mail className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{templates.length}</div>
            <p className="text-xs text-slate-500 mt-1">Konfigurasi aktif tersimpan</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Integrasi Provider</CardTitle>
            <div className="p-2 bg-teal-50 rounded-full">
              <Zap className="h-4 w-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">Resend API</div>
            <p className="text-xs text-teal-600 font-medium mt-1">Provider aktif terhubung</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Status Gateway</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">Online</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Siap untuk transaksional email</p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[600px]">
        <EmailTemplatesClient initialData={templates} />
      </div>
    </div>
  )
}
