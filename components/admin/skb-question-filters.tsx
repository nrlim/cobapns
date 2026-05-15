"use client"

import React, { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
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
}

export function SKBQuestionFilters({ bidangList }: SKBQuestionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || "All"
  const currentBidang = searchParams.get("bidang") || "All"
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Cari konten soal SKB..."
          className="pl-9 w-[200px] md:w-[260px] bg-slate-50/50 border-transparent focus:bg-white focus:border-orange-300/40 rounded-xl transition-all"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <div className="h-4 w-px bg-slate-200 mx-1 hidden md:block" />

      {/* Category filter */}
      <div className="flex items-center bg-slate-50/80 border border-slate-100 rounded-lg p-1">
        {SKB_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant="ghost"
            size="sm"
            onClick={() =>
              updateFilters({ category: cat.value === "All" ? null : cat.value, page: "1" })
            }
            className={`h-8 text-xs font-bold px-3 rounded-md transition-all ${
              currentCategory === cat.value
                ? "bg-white shadow-sm text-slate-800 hover:bg-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            }`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Bidang filter */}
      {bidangList.length > 0 && (
        <select
          value={currentBidang}
          onChange={(e) =>
            updateFilters({ bidang: e.target.value === "All" ? null : e.target.value, page: "1" })
          }
          className="h-9 px-3 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 outline-none focus:border-orange-300 cursor-pointer"
        >
          <option value="All">Semua Bidang</option>
          {bidangList.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      )}

      <Button
        variant="outline"
        size="icon"
        className="border-slate-100 text-slate-500 hover:text-orange-500 hover:bg-orange-50/50 rounded-xl"
      >
        <Filter className="w-4 h-4" />
      </Button>
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
