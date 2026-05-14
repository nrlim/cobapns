import OpenAI from "openai"
import { prisma } from "@/lib/prisma"

// ─── SumoPod AI Gateway Client ─────────────────────────────────────────────
// Priority: SystemSetting (DB) → ENV → hardcoded defaults
// This lets admins change API key & model without a redeploy.

let _client: OpenAI | null = null

// Fetch API key from DB, fallback to env
async function resolveApiKey(): Promise<string> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: "ai_api_key" } })
    if (row?.value) return row.value
  } catch { /* DB not ready yet — fall through */ }
  const envKey = process.env.SUMOPOD_API_KEY
  if (!envKey) throw new Error("AI API Key belum dikonfigurasi. Hubungi administrator.")
  return envKey
}

// Fetch base URL from DB, fallback to env/default
async function resolveBaseUrl(): Promise<string> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: "ai_base_url" } })
    if (row?.value) return row.value
  } catch { /* fall through */ }
  return process.env.AI_BASE_URL ?? "https://ai.sumopod.com/v1"
}

// Fetch model from DB, fallback to env/default
export async function getAIModel(): Promise<string> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: "ai_model" } })
    if (row?.value) return row.value
  } catch { /* fall through */ }
  return process.env.AI_MODEL ?? "kimi-k2.6"
}

/** Returns an initialized OpenAI-compatible client pointed at the configured gateway. */
export async function getAIClient(): Promise<OpenAI> {
  if (_client) return _client

  const [apiKey, baseURL] = await Promise.all([resolveApiKey(), resolveBaseUrl()])

  _client = new OpenAI({ apiKey, baseURL })
  return _client
}

/**
 * Call this after updating API key or base URL in the DB to force the next
 * getAIClient() call to re-instantiate the client with the new settings.
 */
export function resetAIClient(): void {
  _client = null
}
