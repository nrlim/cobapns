"use client"

import { useState, useTransition, useEffect } from "react"
import {
  Key,
  Bot,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Info,
  Loader2,
  Save,
  FlaskConical,
  ChevronDown,
} from "lucide-react"
import {
  saveAIApiKey,
  saveAIModel,
  saveAIBaseUrl,
  testAIConnection,
} from "@/app/actions/ai-settings"
import { SUPPORTED_MODELS, type AIGatewaySettings } from "@/constants/ai"

interface Props {
  initialSettings: AIGatewaySettings
}

type SaveStatus = "idle" | "saving" | "saved" | "error"
type TestStatus = "idle" | "testing" | "ok" | "fail"

interface TestResult {
  model?: string
  latencyMs?: number
  error?: string
}

export function AIGatewayClient({ initialSettings }: Props) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [apiKey,  setApiKey]  = useState("")
  const [model,   setModel]   = useState(initialSettings.model)
  const [baseUrl, setBaseUrl] = useState(initialSettings.baseUrl)
  const [customModel, setCustomModel] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isCustomModel, setIsCustomModel] = useState(
    !SUPPORTED_MODELS.find((m) => m.id === initialSettings.model)
  )

  const [keyStatus,    setKeyStatus]    = useState<SaveStatus>("idle")
  const [modelStatus,  setModelStatus]  = useState<SaveStatus>("idle")
  const [urlStatus,    setUrlStatus]    = useState<SaveStatus>("idle")
  const [testStatus,   setTestStatus]   = useState<TestStatus>("idle")
  const [testResult,   setTestResult]   = useState<TestResult | null>(null)
  const [keyError,     setKeyError]     = useState<string | null>(null)
  const [modelError,   setModelError]   = useState<string | null>(null)
  const [urlError,     setUrlError]     = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveKey = () => {
    if (!apiKey.trim()) return
    setKeyError(null)
    setKeyStatus("saving")
    startTransition(async () => {
      const res = await saveAIApiKey(apiKey)
      if (res.success) {
        setKeyStatus("saved")
        setApiKey("")
        setTimeout(() => setKeyStatus("idle"), 3000)
      } else {
        setKeyStatus("error")
        setKeyError(res.error ?? "Gagal menyimpan.")
      }
    })
  }

  const handleSaveModel = () => {
    const finalModel = isCustomModel ? customModel.trim() : model
    if (!finalModel) return
    setModelError(null)
    setModelStatus("saving")
    startTransition(async () => {
      const res = await saveAIModel(finalModel)
      if (res.success) {
        setModelStatus("saved")
        setTimeout(() => setModelStatus("idle"), 3000)
      } else {
        setModelStatus("error")
        setModelError(res.error ?? "Gagal menyimpan.")
      }
    })
  }

  const handleSaveUrl = () => {
    if (!baseUrl.trim()) return
    setUrlError(null)
    setUrlStatus("saving")
    startTransition(async () => {
      const res = await saveAIBaseUrl(baseUrl)
      if (res.success) {
        setUrlStatus("saved")
        setTimeout(() => setUrlStatus("idle"), 3000)
      } else {
        setUrlStatus("error")
        setUrlError(res.error ?? "Gagal menyimpan.")
      }
    })
  }

  const handleTest = () => {
    setTestStatus("testing")
    setTestResult(null)
    startTransition(async () => {
      const res = await testAIConnection()
      setTestStatus(res.success ? "ok" : "fail")
      setTestResult({ model: res.model, latencyMs: res.latencyMs, error: res.error })
    })
  }

  // ── Helper UI ──────────────────────────────────────────────────────────────

  function SaveBadge({ status }: { status: SaveStatus }) {
    if (status === "saving") return <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
    if (status === "saved")  return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    if (status === "error")  return <XCircle className="w-4 h-4 text-red-500" />
    return null
  }

  return (
    <div className="space-y-6">

      {/* ── Active Config Summary ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "API Key",
            value: initialSettings.apiKeySet ? initialSettings.apiKey : "❌ Belum diset",
            icon: Key,
            ok: initialSettings.apiKeySet,
          },
          {
            label: "Model Aktif",
            value: initialSettings.model,
            icon: Bot,
            ok: true,
          },
          {
            label: "Gateway URL",
            value: initialSettings.baseUrl.replace("https://", ""),
            icon: Globe,
            ok: true,
          },
        ].map(({ label, value, icon: Icon, ok }) => (
          <div
            key={label}
            className={`rounded-2xl border p-5 flex items-center gap-4 ${
              ok ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm shrink-0 ${
              ok ? "text-emerald-600" : "text-red-500"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
              <p className="text-sm font-black text-slate-800 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Test Connection ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-sm mb-0.5 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-brand-blue" />
              Test Koneksi
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Kirim pesan kecil ke AI gateway untuk memverifikasi koneksi dan mengukur latency.
            </p>
          </div>
          <button
            id="btn-test-ai-connection"
            onClick={handleTest}
            disabled={testStatus === "testing" || isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue-deep hover:bg-brand-blue text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
          >
            {testStatus === "testing"
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</>
              : <><Zap className="w-4 h-4" /> Test Sekarang</>
            }
          </button>
        </div>

        {testResult && (
          <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
            testStatus === "ok"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}>
            {testStatus === "ok"
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              {testStatus === "ok" ? (
                <>
                  <p className="text-sm font-black text-emerald-800">Koneksi berhasil!</p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    Model: <strong>{testResult.model}</strong> · Latency: <strong>{testResult.latencyMs}ms</strong>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-red-700">Koneksi gagal</p>
                  <p className="text-xs text-red-600 font-medium mt-0.5">{testResult.error}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── API Key ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-sm mb-0.5 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              API Key SumoPod
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Disimpan terenkripsi di database. Tidak pernah dikirim ke client.
            </p>
          </div>
          <SaveBadge status={keyStatus} />
        </div>

        {initialSettings.apiKeySet && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <Key className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-mono text-slate-600 flex-1">{initialSettings.apiKey}</span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
        )}

        <div className="relative">
          <input
            id="input-ai-api-key"
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={initialSettings.apiKeySet ? "Masukkan key baru untuk mengganti..." : "sk-xxxxxxxxxxxxxxxxxxxxxxxx"}
            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {keyError && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />{keyError}
          </p>
        )}

        <button
          id="btn-save-api-key"
          onClick={handleSaveKey}
          disabled={!apiKey.trim() || keyStatus === "saving"}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" />
          {keyStatus === "saving" ? "Menyimpan..." : "Simpan API Key"}
        </button>
      </div>

      {/* ── Model Selection ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-sm mb-0.5 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-500" />
              Model AI
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Model yang akan digunakan untuk generate rekomendasi belajar.
            </p>
          </div>
          <SaveBadge status={modelStatus} />
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomModel(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              !isCustomModel ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Pilih dari daftar
          </button>
          <button
            onClick={() => setIsCustomModel(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isCustomModel ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Model kustom
          </button>
        </div>

        {!isCustomModel ? (
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all appearance-none cursor-pointer"
            >
              {Array.from(new Set(SUPPORTED_MODELS.map((m) => m.provider))).sort().map((provider) => (
                <optgroup key={provider} label={provider}>
                  {SUPPORTED_MODELS.filter((m) => m.provider === provider).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.tier})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        ) : (
          <input
            id="input-custom-model"
            type="text"
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            placeholder="e.g. gpt-4-turbo, mistral-7b, ..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        )}

        {modelError && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />{modelError}
          </p>
        )}

        <button
          id="btn-save-model"
          onClick={handleSaveModel}
          disabled={modelStatus === "saving" || (isCustomModel && !customModel.trim())}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" />
          {modelStatus === "saving" ? "Menyimpan..." : "Simpan Model"}
        </button>
      </div>

      {/* ── Base URL ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-sm mb-0.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" />
              Gateway Base URL
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Endpoint API yang kompatibel dengan format OpenAI. Default: SumoPod.
            </p>
          </div>
          <SaveBadge status={urlStatus} />
        </div>

        <input
          id="input-ai-base-url"
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
        />

        {urlError && (
          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />{urlError}
          </p>
        )}

        <button
          id="btn-save-base-url"
          onClick={handleSaveUrl}
          disabled={!baseUrl.trim() || urlStatus === "saving"}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" />
          {urlStatus === "saving" ? "Menyimpan..." : "Simpan URL"}
        </button>
      </div>

      {/* ── Info Note ─────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-black text-amber-900 text-sm mb-1">Catatan Teknis</h4>
          <ul className="text-xs text-amber-800 font-medium space-y-0.5">
            <li>• Perubahan API Key & Base URL langsung aktif — client akan di-reset otomatis.</li>
            <li>• Priority: Database &gt; Environment Variable &gt; Default.</li>
            <li>• Jika API Key ada di DB, nilai dari .env diabaikan untuk keamanan.</li>
            <li>• Gunakan tombol &ldquo;Test Sekarang&rdquo; setelah menyimpan untuk memverifikasi.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
