import { getLookupsPaginated, getLookupStats } from "@/app/actions/lookup"
import { LookupClient } from "./page-client"
import { Database, Building2, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LookupType } from "@prisma/client"

export const metadata = {
  title: "Lookup Management - Admin",
}

export default async function LookupPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const type = (typeof params.type === 'string' ? params.type : "INSTANCE") as LookupType;

  const stats = await getLookupStats()
  
  const paginatedResult = await getLookupsPaginated({
    type,
    page,
    limit,
    search
  });

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      {/* Page Hero / Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1 lg:mb-2 text-opacity-80">Settings Base</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Lookup Data Management</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Kelola data master instansi, jabatan, jenjang pendidikan, dan program studi.</p>
        </div>
      </div>

      {/* Stats Bento Grid Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-slate-200 shadow-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Instansi</CardTitle>
            <div className="p-2 bg-slate-100 rounded-full">
              <Building2 className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalInstance}</div>
            <p className="text-xs text-slate-500 mt-1">Institusi terdaftar aktif</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Jabatan</CardTitle>
            <div className="p-2 bg-teal-50 rounded-full">
              <Briefcase className="h-4 w-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalPosition}</div>
            <p className="text-xs text-teal-600 font-medium mt-1">Formasi pekerjaan tersedia</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Jenjang & Prodi</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-full">
              <Database className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalOthers}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Konfigurasi pendidikan aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable Section */}
      <div className="mt-8">
        <LookupClient 
          initialData={paginatedResult.data}
          total={paginatedResult.total}
          currentPage={paginatedResult.page}
          totalPages={paginatedResult.totalPages}
          activeType={type}
          initialSearch={search || ""}
        />
      </div>
    </div>
  )
}
