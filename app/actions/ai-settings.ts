"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"

import { AI_SETTINGS_KEY, type AIGatewaySettings } from "@/constants/ai"


// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAIGatewaySettings(): Promise<AIGatewaySettings> {
  await requireAdmin()

  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: [AI_SETTINGS_KEY.API_KEY, AI_SETTINGS_KEY.MODEL, AI_SETTINGS_KEY.BASE_URL] } },
  })

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  const rawKey = map[AI_SETTINGS_KEY.API_KEY] ?? process.env.SUMOPOD_API_KEY ?? ""
  const model   = map[AI_SETTINGS_KEY.MODEL]   ?? process.env.AI_MODEL ?? "kimi-k2.6"
  const baseUrl = map[AI_SETTINGS_KEY.BASE_URL] ?? "https://ai.sumopod.com/v1"

  return {
    apiKey: rawKey ? maskKey(rawKey) : "",
    apiKeySet: !!rawKey,
    model,
    baseUrl,
  }
}

// ─── Save API Key ─────────────────────────────────────────────────────────────

export async function saveAIApiKey(
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const trimmed = apiKey.trim()
    if (!trimmed) return { success: false, error: "API Key tidak boleh kosong." }
    if (trimmed.length < 20) return { success: false, error: "Format API Key tidak valid." }

    await prisma.systemSetting.upsert({
      where: { key: AI_SETTINGS_KEY.API_KEY },
      update: { value: trimmed },
      create: { key: AI_SETTINGS_KEY.API_KEY, value: trimmed },
    })

    // Reset cached AI client so next call uses the new key
    const { resetAIClient } = await import("@/lib/ai-client")
    resetAIClient()

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (err) {
    console.error("[saveAIApiKey]", err)
    return { success: false, error: "Gagal menyimpan API Key." }
  }
}

// ─── Save Model ───────────────────────────────────────────────────────────────

export async function saveAIModel(
  model: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const trimmed = model.trim()
    if (!trimmed) return { success: false, error: "Model tidak boleh kosong." }

    await prisma.systemSetting.upsert({
      where: { key: AI_SETTINGS_KEY.MODEL },
      update: { value: trimmed },
      create: { key: AI_SETTINGS_KEY.MODEL, value: trimmed },
    })

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (err) {
    console.error("[saveAIModel]", err)
    return { success: false, error: "Gagal menyimpan model." }
  }
}

// ─── Save Base URL ────────────────────────────────────────────────────────────

export async function saveAIBaseUrl(
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const trimmed = baseUrl.trim()
    if (!trimmed) return { success: false, error: "Base URL tidak boleh kosong." }

    try { new URL(trimmed) } catch {
      return { success: false, error: "Format URL tidak valid." }
    }

    await prisma.systemSetting.upsert({
      where: { key: AI_SETTINGS_KEY.BASE_URL },
      update: { value: trimmed },
      create: { key: AI_SETTINGS_KEY.BASE_URL, value: trimmed },
    })

    const { resetAIClient } = await import("@/lib/ai-client")
    resetAIClient()

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (err) {
    console.error("[saveAIBaseUrl]", err)
    return { success: false, error: "Gagal menyimpan Base URL." }
  }
}

// ─── Test Connection ──────────────────────────────────────────────────────────

export async function testAIConnection(): Promise<{
  success: boolean
  model?: string
  latencyMs?: number
  error?: string
}> {
  try {
    await requireAdmin()

    const { getAIClient, getAIModel } = await import("@/lib/ai-client")
    const client = await getAIClient()
    const model  = await getAIModel()

    const t0 = Date.now()
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Reply with exactly: CONNECTED" }],
      max_tokens: 10,
    })
    const latencyMs = Date.now() - t0
    const content = response.choices[0]?.message?.content ?? ""

    return { success: true, model, latencyMs, error: content.includes("CONNECTED") ? undefined : `Unexpected: ${content}` }
  } catch (err) {
    console.error("[testAIConnection]", err)
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••"
  return key.slice(0, 6) + "••••••••••••" + key.slice(-4)
}
