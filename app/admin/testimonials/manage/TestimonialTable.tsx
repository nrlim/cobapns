"use client"

import { useState, useTransition, useMemo } from "react"
import { updateTestimonialStatus, deleteTestimonial, togglePublicBackdoor } from "./actions"
import { Check, X, Trash2, ShieldAlert, ShieldCheck, Copy, CheckCircle2, Globe, ChevronLeft, ChevronRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"

type User = { name: string; email: string; avatarUrl: string | null }
type Testimonial = {
  id: string
  userId: string | null
  guestName: string | null
  guestRole: string | null
  guestAvatar: string | null
  rating: number
  content: string
  tags: string[]
  isVerified: boolean
  isBackdoor: boolean
  status: string
  createdAt: Date
  user: User | null
}

export function TestimonialTable({ 
  initialTestimonials, 
  initialBackdoorStatus
}: { 
  initialTestimonials: Testimonial[]
  initialBackdoorStatus: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [backdoorEnabled, setBackdoorEnabled] = useState(initialBackdoorStatus)
  const [copied, setCopied] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState("ALL")
  
  const itemsPerPage = 10

  const handleToggleBackdoor = () => {
    const newState = !backdoorEnabled
    setBackdoorEnabled(newState)
    startTransition(() => {
      togglePublicBackdoor(newState)
    })
  }

  const handleStatusChange = (id: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    startTransition(() => {
      updateTestimonialStatus(id, status)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return
    startTransition(() => {
      deleteTestimonial(id)
    })
  }

  const copyBackdoorLink = () => {
    const url = `${window.location.origin}/testimonials/submit`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredTestimonials = useMemo(() => {
    if (filter === "ALL") return initialTestimonials
    if (filter === "PENDING") return initialTestimonials.filter(t => t.status === "PENDING")
    if (filter === "APPROVED") return initialTestimonials.filter(t => t.status === "APPROVED")
    if (filter === "REJECTED") return initialTestimonials.filter(t => t.status === "REJECTED")
    return initialTestimonials
  }, [initialTestimonials, filter])

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTestimonials.slice(start, start + itemsPerPage)
  }, [filteredTestimonials, currentPage])

  return (
    <div className="space-y-6">
      {/* Public Backdoor Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#2DBE60]" />
            Public Backdoor Form
          </h3>
          <p className="text-sm text-slate-500 max-w-lg">
            Allow partners (rekanan) to submit directly via a hidden public link without needing to log in. Their submissions will automatically be approved and marked as backdoor.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3 min-w-[280px]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700">{backdoorEnabled ? 'Active' : 'Disabled'}</span>
            <Switch 
              checked={backdoorEnabled}
              onCheckedChange={handleToggleBackdoor}
              disabled={isPending}
            />
          </div>
          
          {backdoorEnabled && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-full">
              <code className="text-xs text-slate-600 flex-1 truncate px-2">/testimonials/submit</code>
              <button 
                onClick={copyBackdoorLink}
                className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex space-x-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === f 
                    ? "bg-[#1E73BE] text-white shadow-sm" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="text-xs font-medium text-slate-500">
            Total {filteredTestimonials.length} records
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Author</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-24">Rating</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[300px]">Feedback</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map(t => {
                const name = t.user?.name || t.guestName || "Unknown"
                const avatar = t.user?.avatarUrl || t.guestAvatar
                const role = t.guestRole || (t.user ? "Student" : "Guest")

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                          {avatar ? (
                            <img src={avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-slate-500 text-sm">{name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 line-clamp-1">{name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-[150px]">{t.user?.email || role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm font-bold text-slate-700">
                        {t.rating} <span className="text-[#2DBE60] ml-1">★</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600 line-clamp-2" title={t.content}>
                        "{t.content}"
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {t.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                        {t.tags.length > 3 && (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            +{t.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        {t.isBackdoor ? (
                          <><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Backdoor</>
                        ) : (
                          <><ShieldCheck className="w-3.5 h-3.5 text-[#2DBE60]" /> Organic</>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                        t.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        t.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.status !== "APPROVED" && (
                          <button onClick={() => handleStatusChange(t.id, "APPROVED")} disabled={isPending} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {t.status !== "REJECTED" && (
                          <button onClick={() => handleStatusChange(t.id, "REJECTED")} disabled={isPending} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(t.id)} disabled={isPending} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ml-1" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 text-sm">
                    {initialTestimonials.length === 0 ? "No testimonials found." : "No testimonials match the selected filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredTestimonials.length)}</span> of <span className="font-bold text-slate-700">{filteredTestimonials.length}</span>
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2 text-xs font-bold text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
