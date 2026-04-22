// Shared constants for Material enums — safe to import in both server and client code.
// We can't export these from a "use server" file (only async functions allowed there).

export const MATERIAL_TYPES = ["TEXT", "VIDEO", "PDF"] as const
export const MATERIAL_TIERS = ["FREE", "ELITE", "MASTER"] as const

export type MaterialTypeValue = (typeof MATERIAL_TYPES)[number]
export type MaterialTierValue = (typeof MATERIAL_TIERS)[number]
