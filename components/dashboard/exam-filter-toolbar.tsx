import Link from "next/link"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FilterOption = { value: string; label: string }

interface ExamFilterToolbarProps {
  basePath: string
  q: string
  tier: string
  state: string
  sort: string
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  bidang?: string
  bidangOptions?: string[]
  accent?: "blue" | "orange"
}

function buildHref(basePath: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === "ALL" || value === 1) continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `${basePath}?${query}` : basePath
}

const tierOptions: FilterOption[] = [
  { value: "ALL", label: "Semua Tier" },
  { value: "FREE", label: "Free" },
  { value: "ELITE", label: "Elite" },
  { value: "MASTER", label: "Master" },
]

const stateOptions: FilterOption[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "AVAILABLE", label: "Bisa Diakses" },
  { value: "LOCKED", label: "Terkunci" },
  { value: "DONE", label: "Sudah Dikerjakan" },
  { value: "NOT_DONE", label: "Belum Dikerjakan" },
]

const sortOptions: FilterOption[] = [
  { value: "newest", label: "Terbaru" },
  { value: "popular", label: "Paling Banyak Peserta" },
  { value: "questions", label: "Soal Terbanyak" },
  { value: "duration", label: "Durasi Terlama" },
  { value: "title", label: "Judul A-Z" },
]

export function ExamFilterToolbar({
  basePath,
  q,
  tier,
  state,
  sort,
  page,
  totalPages,
  totalItems,
  pageSize,
  bidang,
  bidangOptions = [],
  accent = "blue",
}: ExamFilterToolbarProps) {
  const focusClass = accent === "orange" ? "focus:border-orange-500" : "focus:border-brand-blue"
  const currentStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const currentEnd = Math.min(page * pageSize, totalItems)

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
      <form action={basePath} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input name="q" defaultValue={q} placeholder="Cari nama tryout..." className={`pl-9 bg-slate-50 border-slate-200 ${focusClass}`} />
        </div>

        <select name="tier" defaultValue={tier} className={`h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none ${focusClass}`}>
          {tierOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select name="state" defaultValue={state} className={`h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none ${focusClass}`}>
          {stateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        {bidang !== undefined && (
          <select name="bidang" defaultValue={bidang} className={`h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none ${focusClass}`}>
            <option value="ALL">Semua Bidang</option>
            {bidangOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        )}

        <select name="sort" defaultValue={sort} className={`h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none ${focusClass}`}>
          {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <Button type="submit" className={`${accent === "orange" ? "bg-orange-600 hover:bg-orange-700" : "bg-brand-blue-deep hover:bg-brand-blue-deep"} text-white font-bold gap-2`}>
          <SlidersHorizontal className="w-4 h-4" /> Terapkan
        </Button>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs font-bold text-slate-500">
          Menampilkan {currentStart}-{currentEnd} dari {totalItems} tryout
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1} className="gap-1">
            <Link aria-disabled={page <= 1} href={buildHref(basePath, { q, tier, state, sort, bidang, page: Math.max(1, page - 1) })}>
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </Link>
          </Button>
          <span className="px-3 py-2 rounded-lg bg-slate-50 text-xs font-black text-slate-600 border border-slate-200">
            {page} / {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages} className="gap-1">
            <Link aria-disabled={page >= totalPages} href={buildHref(basePath, { q, tier, state, sort, bidang, page: Math.min(totalPages, page + 1) })}>
              Berikutnya <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
