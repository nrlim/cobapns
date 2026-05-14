import type { UserTier } from "@/constants/permissions"

// ─── AI Feedback Quota Config ──────────────────────────────────────────────
// Defines monthly generation limits per tier

export const AI_FEEDBACK_QUOTA: Record<UserTier, number> = {
  FREE:   0,   // Not available
  ELITE:  3,   // 3x per month
  MASTER: 10,  // 10x per month
}

export const AI_FEEDBACK_QUOTA_LABEL: Record<UserTier, string> = {
  FREE:   "Tidak tersedia",
  ELITE:  "3x per bulan",
  MASTER: "10x per bulan",
}

// Minimum exams required before AI can generate meaningful feedback
export const AI_MIN_EXAMS_REQUIRED = 2

export function getQuotaForTier(tier: UserTier): number {
  return AI_FEEDBACK_QUOTA[tier]
}

export function isNewMonth(lastResetAt: Date | null): boolean {
  if (!lastResetAt) return true
  const now = new Date()
  return (
    now.getFullYear() !== lastResetAt.getFullYear() ||
    now.getMonth() !== lastResetAt.getMonth()
  )
}

export function getRemainingQuota(
  tier: UserTier,
  usedCount: number,
  lastResetAt: Date | null
): number {
  // If a new month has started, quota resets to full
  if (isNewMonth(lastResetAt)) return getQuotaForTier(tier)
  const limit = getQuotaForTier(tier)
  return Math.max(0, limit - usedCount)
}
