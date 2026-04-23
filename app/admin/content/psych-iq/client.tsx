"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Brain, Zap, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Search, ChevronLeft, ChevronRight, Save, X, Clock, AlertTriangle,
} from "lucide-react"
import {
  createPsychQuestion, updatePsychQuestion, deletePsychQuestion, togglePsychQuestion,
  createIQQuestion, updateIQQuestion, deleteIQQuestion, toggleIQQuestion,
  updateIQSubTestConfig,
} from "./actions"

// ─── Types ────────────────────────────────────────────────────────────────────

type PsychQ = {
  id: string; text: string; dimension: string; dimensionLabel: string
  order: number; isActive: boolean; createdAt: Date
}

type IQQ = {
  id: string; text: string; subTest: string
  options: { key: string; label: string }[]
  answerKey: string; order: number; isActive: boolean; createdAt: Date
}

type Config = {
  subTest: string; timeSeconds: number
}

type SubCount = { subTest: string; _count: { _all: number } }

const PSYCH_DIMENSIONS = [
  { value: "openness", label: "Keterbukaan" },
  { value: "conscientiousness", label: "Kedisiplinan" },
  { value: "extraversion", label: "Ekstraversi" },
  { value: "agreeableness", label: "Keramahan" },
  { value: "neuroticism", label: "Stabilitas Emosi" },
  { value: "integrity", label: "Integritas" },
  { value: "stressResilience", label: "Ketahanan Stres" },
  { value: "teamwork", label: "Kerja Sama Tim" },
]

const IQ_SUBTESTS = ["VERBAL", "NUMERIC", "LOGIC", "SPATIAL"] as const
const IQ_LABELS: Record<string, string> = {
  VERBAL: "Verbal", NUMERIC: "Numerik", LOGIC: "Logika", SPATIAL: "Spasial",
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  tab: "psych" | "iq"
  psychData: { questions: PsychQ[]; total: number; page: number; totalPages: number } | null
  iqData: {
    questions: IQQ[]; total: number; page: number; totalPages: number
    subtest: string; counts: SubCount[]
  } | null
  configs: Config[]
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-black text-slate-900">Konfirmasi Hapus</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm transition-all"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Psych Question Form ──────────────────────────────────────────────────────

function PsychForm({
  initial, onDone,
}: {
  initial?: PsychQ | null
  onDone: () => void
}) {
  const [text, setText] = useState(initial?.text ?? "")
  const [dimension, setDimension] = useState(initial?.dimension ?? "openness")
  const [order, setOrder] = useState(initial?.order ?? 0)
  const [pending, startTransition] = useTransition()

  const dimLabel = PSYCH_DIMENSIONS.find(d => d.value === dimension)?.label ?? ""

  function handleSubmit() {
    startTransition(async () => {
      if (initial) {
        await updatePsychQuestion(initial.id, { text, dimension, dimensionLabel: dimLabel, order })
      } else {
        await createPsychQuestion({ text, dimension, dimensionLabel: dimLabel, order })
      }
      onDone()
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">
          Teks Pernyataan *
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
          placeholder="Masukkan teks pernyataan psikotes..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">
            Dimensi *
          </label>
          <select
            value={dimension}
            onChange={e => setDimension(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {PSYCH_DIMENSIONS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">
            Urutan
          </label>
          <input
            type="number"
            value={order}
            onChange={e => setOrder(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onDone}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-all"
        >
          <X className="w-4 h-4" /> Batal
        </button>
        <button
          disabled={!text.trim() || pending}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white bg-brand-blue-deep hover:bg-brand-blue-deep disabled:opacity-50 text-sm transition-all"
        >
          <Save className="w-4 h-4" />
          {pending ? "Menyimpan..." : (initial ? "Simpan Perubahan" : "Tambah Soal")}
        </button>
      </div>
    </div>
  )
}

// ─── IQ Question Form ─────────────────────────────────────────────────────────

function IQForm({
  initial, defaultSubTest, onDone,
}: {
  initial?: IQQ | null
  defaultSubTest: string
  onDone: () => void
}) {
  const defaultOptions = initial?.options ?? [
    { key: "A", label: "" },
    { key: "B", label: "" },
    { key: "C", label: "" },
    { key: "D", label: "" },
    { key: "E", label: "" },
  ]
  const [subTest, setSubTest] = useState(initial?.subTest ?? defaultSubTest)
  const [text, setText] = useState(initial?.text ?? "")
  const [options, setOptions] = useState<{ key: string; label: string }[]>(defaultOptions)
  const [answerKey, setAnswerKey] = useState(initial?.answerKey ?? "A")
  const [order, setOrder] = useState(initial?.order ?? 0)
  const [pending, startTransition] = useTransition()

  function updateOption(idx: number, label: string) {
    setOptions(prev => prev.map((o, i) => i === idx ? { ...o, label } : o))
  }

  function handleSubmit() {
    startTransition(async () => {
      const payload = {
        subTest: subTest as any,
        text,
        options,
        answerKey,
        order,
      }
      if (initial) {
        await updateIQQuestion(initial.id, payload)
      } else {
        await createIQQuestion(payload)
      }
      onDone()
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">Sub-Tes *</label>
          <select
            value={subTest}
            onChange={e => setSubTest(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {IQ_SUBTESTS.map(s => <option key={s} value={s}>{IQ_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">Urutan</label>
          <input
            type="number"
            value={order}
            onChange={e => setOrder(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">Teks Pertanyaan *</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          placeholder="Masukkan teks pertanyaan IQ..."
        />
      </div>

      <div>
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-2">
          Opsi Jawaban
          <span className="ml-2 text-brand-blue font-medium normal-case">
            (Kunci: {answerKey})
          </span>
        </label>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={opt.key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAnswerKey(opt.key)}
                className={`w-8 h-8 rounded-lg flex-shrink-0 text-xs font-black border-2 transition-all ${answerKey === opt.key
                    ? "bg-brand-blue text-white border-brand-blue"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                  }`}
              >
                {opt.key}
              </button>
              <input
                value={opt.label}
                onChange={e => updateOption(idx, e.target.value)}
                placeholder={`Opsi ${opt.key}...`}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Klik huruf di kiri untuk tandai sebagai kunci jawaban</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onDone}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-all"
        >
          <X className="w-4 h-4" /> Batal
        </button>
        <button
          disabled={!text.trim() || pending}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white bg-brand-blue-deep hover:bg-brand-blue-deep disabled:opacity-50 text-sm transition-all"
        >
          <Save className="w-4 h-4" />
          {pending ? "Menyimpan..." : (initial ? "Simpan Perubahan" : "Tambah Soal")}
        </button>
      </div>
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function PsychIQCMSClient({ tab, psychData, iqData, configs }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<PsychQ | IQQ | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function nav(params: Record<string, string>) {
    const p = new URLSearchParams(sp.toString())
    Object.entries(params).forEach(([k, v]) => p.set(k, v))
    router.push(`${pathname}?${p.toString()}`)
  }

  function resetForm() {
    setShowForm(false)
    setEditTarget(null)
  }

  // Config edit state
  const cfgMap = Object.fromEntries(configs.map(c => [c.subTest, c.timeSeconds]))
  const [cfgEdits, setCfgEdits] = useState<Record<string, number>>(cfgMap)

  function saveConfig(subTest: string) {
    startTransition(async () => {
      await updateIQSubTestConfig(subTest as any, cfgEdits[subTest] ?? 300)
    })
  }

  // ── Layout ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-8 lg:p-10 w-full flex-1">

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Hapus soal ini secara permanen? Tindakan ini tidak dapat dibatalkan.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            startTransition(async () => {
              if (tab === "psych") {
                await deletePsychQuestion(deleteTarget.id)
              } else {
                await deleteIQQuestion(deleteTarget.id)
              }
              setDeleteTarget(null)
            })
          }}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">Content Engine</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Psikotes & IQ CMS</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Kelola bank soal psikotes kepribadian dan tes IQ multi-dimensi.</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue-deep text-white rounded-xl font-bold text-sm hover:bg-brand-blue-deep shadow-sm transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Soal
        </button>
      </div>

      {/* ── Add/Edit Drawer ───────────────────────── */}
      {/* Backdrop */}
      {showForm && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={resetForm}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[650px] bg-white shadow-2xl transition-transform duration-300 transform flex flex-col ${
          showForm ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
              {tab === "psych" ? <Brain className="w-5 h-5 text-brand-blue" /> : <Zap className="w-5 h-5 text-brand-blue" />}
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">
                {editTarget ? "Edit Soal" : "Tambah Soal Baru"}
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                {tab === "psych" ? "Bank Soal Psikotes" : "Bank Soal IQ"}
              </p>
            </div>
          </div>
          <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {tab === "psych" ? (
            <PsychForm
              initial={editTarget as PsychQ | null}
              onDone={resetForm}
            />
          ) : (
            <IQForm
              initial={editTarget as IQQ | null}
              defaultSubTest={iqData?.subtest ?? "VERBAL"}
              onDone={resetForm}
            />
          )}
        </div>
      </div>

      {/* ── IQ Sub-test Tabs + Config ─────────────────────────────────────────── */}
      {tab === "iq" && iqData && (
        <>
          <div className="flex flex-wrap gap-2">
            {IQ_SUBTESTS.map(s => {
              const cnt = iqData.counts.find(c => c.subTest === s)?._count._all ?? 0
              return (
                <button
                  key={s}
                  onClick={() => nav({ tab: "iq", subtest: s, page: "1" })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${iqData.subtest === s
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {IQ_LABELS[s]}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${iqData.subtest === s ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                    {cnt}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Timer Config */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-500" />
              <h4 className="font-black text-slate-900 text-sm">Konfigurasi Timer Sub-Tes</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {IQ_SUBTESTS.map(s => (
                <div key={s} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide mb-2">{IQ_LABELS[s]}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={cfgEdits[s] ?? cfgMap[s] ?? 300}
                      onChange={e => setCfgEdits(prev => ({ ...prev, [s]: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">dtk</span>
                  </div>
                  <button
                    onClick={() => saveConfig(s)}
                    disabled={pending}
                    className="mt-2 w-full text-[10px] font-black px-2 py-1 rounded-lg bg-blue-50 text-brand-blue-deep border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-50"
                  >
                    {pending ? "..." : "Simpan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Search Bar ───────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          defaultValue={sp.get("search") ?? ""}
          placeholder="Cari teks soal..."
          onKeyDown={e => {
            if (e.key === "Enter") nav({ search: (e.target as HTMLInputElement).value, page: "1" })
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
        />
      </div>

      {/* ── Psych Table ──────────────────────────────────────────────────────── */}
      {tab === "psych" && psychData && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Teks Pernyataan</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Dimensi</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Urutan</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {psychData.questions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-slate-400 font-medium">
                      Belum ada soal psikotes.
                    </td>
                  </tr>
                ) : (
                  psychData.questions.map((q, idx) => (
                    <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-400">
                        {(psychData.page - 1) * 20 + idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 max-w-xl">
                          {q.text}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-brand-blue-deep border border-blue-200">
                          {q.dimensionLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm font-bold text-slate-600">{q.order}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => startTransition(() => togglePsychQuestion(q.id, !q.isActive))}
                          className={`transition-colors ${q.isActive ? "text-brand-blue hover:text-brand-blue-deep" : "text-slate-300 hover:text-slate-500"}`}
                          title={q.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {q.isActive
                            ? <ToggleRight className="w-6 h-6" />
                            : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditTarget(q); setShowForm(true) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: q.id, label: q.text })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {psychData.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {psychData.total} soal · Hal {psychData.page} dari {psychData.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={psychData.page <= 1}
                  onClick={() => nav({ page: String(psychData.page - 1) })}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={psychData.page >= psychData.totalPages}
                  onClick={() => nav({ page: String(psychData.page + 1) })}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IQ Table ─────────────────────────────────────────────────────────── */}
      {tab === "iq" && iqData && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Teks Pertanyaan</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Kunci</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Urutan</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {iqData.questions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-slate-400 font-medium">
                      Belum ada soal IQ untuk sub-tes ini.
                    </td>
                  </tr>
                ) : (
                  iqData.questions.map((q, idx) => (
                    <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-400">
                        {(iqData.page - 1) * 20 + idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 max-w-md">
                          {q.text}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(q.options as { key: string; label: string }[]).map(o => (
                            <span
                              key={o.key}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${o.key === q.answerKey
                                  ? "bg-blue-100 text-brand-blue-deep"
                                  : "bg-slate-100 text-slate-500"
                                }`}
                            >
                              {o.key}: {o.label.slice(0, 15)}{o.label.length > 15 ? "…" : ""}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center text-sm font-black mx-auto">
                          {q.answerKey}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm font-bold text-slate-600">{q.order}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => startTransition(() => toggleIQQuestion(q.id, !q.isActive))}
                          className={`transition-colors ${q.isActive ? "text-brand-blue hover:text-brand-blue-deep" : "text-slate-300 hover:text-slate-500"}`}
                        >
                          {q.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditTarget(q); setShowForm(true) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: q.id, label: q.text })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {iqData.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {iqData.total} soal · Hal {iqData.page} dari {iqData.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={iqData.page <= 1}
                  onClick={() => nav({ page: String(iqData.page - 1) })}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={iqData.page >= iqData.totalPages}
                  onClick={() => nav({ page: String(iqData.page + 1) })}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
