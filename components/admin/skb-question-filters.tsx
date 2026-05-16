"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// ─── Category display config ───────────────────────────────────────────────────
const SKB_CATEGORIES = [
  { value: "All", label: "Semua" },
  { value: "TEKNIS", label: "Teknis" },
  { value: "MANAJERIAL", label: "Manajerial" },
  { value: "SOSIAL_KULTURAL", label: "Sosial Kultural" },
]

interface SKBQuestionFiltersProps {
  bidangList: string[]
  total: number
}

const DIFFICULTIES = [
  { value: "All", label: "Semua Tingkat" },
  { value: "MUDAH", label: "Mudah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "SULIT", label: "Sulit" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "bidang", label: "Bidang A-Z" },
  { value: "category", label: "Kategori" },
  { value: "difficulty", label: "Tingkat" },
]

export function SKBQuestionFilters({ bidangList, total }: SKBQuestionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || "All"
  const currentBidang = searchParams.get("bidang") || "All"
  const currentDifficulty = searchParams.get("difficulty") || "All"
  const currentSort = searchParams.get("sort") || "newest"
  const currentSearch = searchParams.get("search") || ""

  const [searchValue, setSearchValue] = useState(currentSearch)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateFilters({ search: searchValue, page: "1" })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue])

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const resetFilters = () => {
    setSearchValue("")
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Tools & Filter</p>
            <p className="text-xs font-medium text-slate-500">Menampilkan {total} soal sesuai filter aktif.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="h-9 rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,1fr)_auto] gap-3 items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari soal, pembahasan, submateri, bidang..."
              className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-300 rounded-xl transition-all text-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Bidang filter */}
          <select
            value={currentBidang}
            onChange={(e) =>
              updateFilters({ bidang: e.target.value === "All" ? null : e.target.value, page: "1" })
            }
            className="h-11 px-3 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-orange-300 cursor-pointer"
          >
            <option value="All">Semua Bidang</option>
            {bidangList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={currentDifficulty}
            onChange={(e) =>
              updateFilters({ difficulty: e.target.value === "All" ? null : e.target.value, page: "1" })
            }
            className="h-11 px-3 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-orange-300 cursor-pointer"
          >
            {DIFFICULTIES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>

          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value, page: "1" })}
            className="h-11 px-3 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-orange-300 cursor-pointer"
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>Urutkan: {item.label}</option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 overflow-x-auto">
          {SKB_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant="ghost"
              size="sm"
              onClick={() =>
                updateFilters({ category: cat.value === "All" ? null : cat.value, page: "1" })
              }
              className={`h-9 text-xs font-black px-3 rounded-lg transition-all whitespace-nowrap ${
                currentCategory === cat.value
                  ? "bg-white shadow-sm text-orange-700 hover:bg-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/70"
              }`}
            >
              {cat.label}
            </Button>
          ))}
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <Filter className="w-4 h-4 text-slate-400 mx-2 shrink-0" />
        </div>
      </div>
    </div>
  )
}

export function SKBQuestionPagination({
  totalPages,
  currentPage,
}: {
  totalPages: number
  currentPage: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between p-4 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-500">
        Halaman {currentPage} dari {totalPages}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 rounded-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
