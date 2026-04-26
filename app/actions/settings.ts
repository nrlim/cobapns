"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Whitelist of keys that are allowed to be read/written
const ALLOWED_KEYS = new Set([
  "contactEmail",
  "contactPhone",
  "socialInstagram",
  "socialTiktok",
  "socialFacebook",
  "socialYoutube",
])

const DEFAULT_SETTINGS: Record<string, string> = {
  contactEmail: "support@cobapns.com",
  contactPhone: "6281234567890",
  socialInstagram: "https://instagram.com/cobapns",
  socialTiktok: "https://tiktok.com/@cobapns",
  socialFacebook: "https://www.facebook.com/cobapns",
  socialYoutube: "https://www.youtube.com/cobapns",
}

const settingsValueSchema = z.string().trim().max(500)

/** 
 * Fetches public system settings (contact info, socials).
 * Accessible by everyone as it returns only a whitelisted subset.
 */
export async function getSettings() {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: [...ALLOWED_KEYS] } },
  })

  const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    if (ALLOWED_KEYS.has(row.key)) {
      settingsMap[row.key] = row.value
    }
  }

  return settingsMap
}

export async function updateSettings(data: Record<string, string>) {
  // Admin-only gate
  await requireAdmin()

  // Filter to only allowed keys and validate values
  const safeEntries: [string, string][] = []
  for (const [key, value] of Object.entries(data)) {
    if (!ALLOWED_KEYS.has(key)) continue // silently drop unknown keys
    const parsed = settingsValueSchema.safeParse(value)
    if (!parsed.success) continue        // silently drop invalid values
    safeEntries.push([key, parsed.data])
  }

  if (safeEntries.length === 0) {
    return { success: false, error: "No valid settings to update." }
  }

  const operations = safeEntries.map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  )

  await prisma.$transaction(operations)

  revalidatePath("/", "layout")
  return { success: true }
}
