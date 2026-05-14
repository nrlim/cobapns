import { getAIGatewaySettings } from "@/app/actions/ai-settings"
import { AIGatewayClient } from "./client"
import { Bot } from "lucide-react"

export const metadata = {
  title: "AI Gateway Settings – COBA PNS Admin",
  description: "Konfigurasi API key, model, dan endpoint untuk fitur Rekomendasi Belajar Personal.",
}

export default async function AIGatewaySettingsPage() {
  const settings = await getAIGatewaySettings()

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">

      {/* ── Page Hero ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1 lg:mb-2">
            Admin Settings
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Bot className="w-7 h-7 text-purple-500" />
            AI Gateway
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm max-w-lg">
            Konfigurasi API key, model, dan base URL untuk fitur{" "}
            <strong className="text-slate-700">Rekomendasi Belajar Personal</strong>.
            Perubahan langsung aktif tanpa perlu redeploy.
          </p>
        </div>
      </div>

      <AIGatewayClient initialSettings={settings} />
    </div>
  )
}
