/**
 * Centralized Permission Constants
 * Maps feature keys to the minimum tier required to access them.
 * Source of truth for all tier-based access control across the app.
 */

export type UserTier = "FREE" | "ELITE" | "MASTER";

export type FeatureKey =
  | "view_basic_materials"
  | "take_mini_tryout"
  | "view_all_text_materials"
  | "take_full_tryout"
  | "view_diagnostics"
  | "view_leaderboard"
  | "take_iq_test"
  | "view_all_materials"
  | "view_video_lessons"
  | "take_psychology_test"
  | "view_career_mapping"
  | "view_ai_roadmap"
  | "priority_support";

// ─── Tier Permission Map ───────────────────────────────────────────────────────
// Each entry defines the minimum tier required to use that feature.
export const FEATURE_TIER_MAP: Record<FeatureKey, UserTier> = {
  // FREE tier features
  view_basic_materials:     "FREE",
  take_mini_tryout:         "FREE",

  // ELITE tier features
  view_all_text_materials:  "ELITE",
  take_full_tryout:         "ELITE",
  view_diagnostics:         "ELITE",
  view_leaderboard:         "ELITE",
  take_iq_test:             "MASTER",

  // MASTER tier features
  view_all_materials:       "MASTER",
  view_video_lessons:       "MASTER",
  take_psychology_test:     "MASTER",
  view_career_mapping:      "MASTER",
  view_ai_roadmap:          "MASTER",
  priority_support:         "MASTER",
} as const;

// ─── Tier Hierarchy ────────────────────────────────────────────────────────────
// Numeric weight for comparison. Higher = more access.
export const TIER_WEIGHT: Record<UserTier, number> = {
  FREE:   0,
  ELITE:  1,
  MASTER: 2,
};

/**
 * Returns true if `userTier` satisfies the `requiredTier`.
 * e.g. hasAccess("MASTER", "ELITE") → true
 *      hasAccess("FREE", "ELITE")   → false
 */
export function hasAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  return TIER_WEIGHT[userTier] >= TIER_WEIGHT[requiredTier];
}

/**
 * Returns true if the user can use a specific feature.
 */
export function canUseFeature(userTier: UserTier, feature: FeatureKey): boolean {
  return hasAccess(userTier, FEATURE_TIER_MAP[feature]);
}

// ─── Tier Metadata (for UI display) ───────────────────────────────────────────
export const TIER_METADATA: Record<
  UserTier,
  { label: string; color: string; bgColor: string; price: string; benefits: string[] }
> = {
  FREE: {
    label:   "Free Access",
    color:   "text-slate-400",
    bgColor: "bg-slate-800",
    price:   "Gratis",
    benefits: [
      "1x Mini Try Out CAT",
      "Akses materi dasar",
      "Laporan skor singkat",
    ],
  },
  ELITE: {
    label:   "Elite Prep",
    color:   "text-teal-400",
    bgColor: "bg-teal-900/30",
    price:   "Rp 129.000/bln",
    benefits: [
      "Unlimited Try Out CAT penuh",
      "Akses semua materi teks",
      "Ranking Nasional Real-time",
      "Analitik & Diagnostik mendalam",
      "Tes IQ lengkap",
    ],
  },
  MASTER: {
    label:   "Master Strategy",
    color:   "text-amber-400",
    bgColor: "bg-amber-900/20",
    price:   "Rp 249.000/bln",
    benefits: [
      "Semua fitur Elite Prep",
      "Video Lesson Eksklusif",
      "Tes Psikologi & Career Mapping",
      "AI Roadmap & Diagnostik Lanjutan",
      "Priority Support 24/7",
    ],
  },
};
