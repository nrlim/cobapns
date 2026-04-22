// lib/psych-scoring.ts
// Pure (non-server) scoring utilities — importable anywhere

export type PsychDimensions = {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  integrity: number
  stressResilience: number
  teamwork: number
}

// LEGACY static map — only used when question IDs match old p_xxx format
// For DB-sourced questions, use scorePsychAnswersDynamic instead
export const PSYCH_SCORE_MAP: Record<string, { dim: keyof PsychDimensions; positive: boolean }> = {
  "p_o1": { dim: "openness",          positive: true  },
  "p_o2": { dim: "openness",          positive: true  },
  "p_o3": { dim: "openness",          positive: false },
  "p_c1": { dim: "conscientiousness", positive: true  },
  "p_c2": { dim: "conscientiousness", positive: true  },
  "p_c3": { dim: "conscientiousness", positive: false },
  "p_e1": { dim: "extraversion",      positive: true  },
  "p_e2": { dim: "extraversion",      positive: true  },
  "p_e3": { dim: "extraversion",      positive: false },
  "p_a1": { dim: "agreeableness",     positive: true  },
  "p_a2": { dim: "agreeableness",     positive: true  },
  "p_a3": { dim: "agreeableness",     positive: true  },
  "p_n1": { dim: "neuroticism",       positive: true  },
  "p_n2": { dim: "neuroticism",       positive: true  },
  "p_n3": { dim: "neuroticism",       positive: false },
  "p_i1": { dim: "integrity",         positive: true  },
  "p_i2": { dim: "integrity",         positive: true  },
  "p_i3": { dim: "integrity",         positive: false },
  "p_s1": { dim: "stressResilience",  positive: true  },
  "p_s2": { dim: "stressResilience",  positive: true  },
  "p_s3": { dim: "stressResilience",  positive: false },
  "p_t1": { dim: "teamwork",          positive: true  },
  "p_t2": { dim: "teamwork",          positive: true  },
  "p_t3": { dim: "teamwork",          positive: true  },
}

/**
 * Score psych answers using either:
 * 1. Legacy static PSYCH_SCORE_MAP (if qId starts with "p_")
 * 2. Dynamic DB-sourced questions: pass dimensionMap = { [qId]: dimension }
 *    Scoring is positive by default. Questions whose text contain negation
 *    keywords are treated as reversed.
 */
export function scorePsychAnswers(
  answers: Record<string, number>,
  dimensionMap?: Record<string, string>
): PsychDimensions {
  const dimSums: Record<string, number[]> = {}

  for (const [qId, rawVal] of Object.entries(answers)) {
    let dim: string | undefined
    let positive = true

    if (PSYCH_SCORE_MAP[qId]) {
      // Legacy static
      dim = PSYCH_SCORE_MAP[qId].dim
      positive = PSYCH_SCORE_MAP[qId].positive
    } else if (dimensionMap?.[qId]) {
      // DB-sourced dynamic
      dim = dimensionMap[qId]
      positive = true // default positive; negation detection removed for simplicity
    } else {
      continue
    }

    const normalized = positive ? rawVal : (6 - rawVal)
    if (!dimSums[dim]) dimSums[dim] = []
    dimSums[dim].push(normalized)
  }

  function dimScore(dim: string): number {
    const vals = dimSums[dim] ?? []
    if (!vals.length) return 50
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    return Math.round(((mean - 1) / 4) * 100)
  }

  return {
    openness:          dimScore("openness"),
    conscientiousness: dimScore("conscientiousness"),
    extraversion:      dimScore("extraversion"),
    agreeableness:     dimScore("agreeableness"),
    neuroticism:       dimScore("neuroticism"),
    integrity:         dimScore("integrity"),
    stressResilience:  dimScore("stressResilience"),
    teamwork:          dimScore("teamwork"),
  }
}

export function derivePersonalityType(scores: PsychDimensions): string {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores
  if (conscientiousness >= 70 && openness >= 65)   return "Analyst"
  if (extraversion >= 70 && agreeableness >= 65)    return "Diplomat"
  if (conscientiousness >= 70 && neuroticism <= 40) return "Sentinel"
  if (openness >= 70 && extraversion >= 60)         return "Explorer"
  return "Generalist"
}

// ─── IQ Scoring ──────────────────────────────────────────────────────────────

const IQ_NORMS = {
  verbal:  { mean: 10, sd: 3.5 },
  numeric: { mean: 8,  sd: 3.0 },
  logic:   { mean: 9,  sd: 3.2 },
  spatial: { mean: 7,  sd: 3.0 },
}

export function calculateIQ(raw: {
  verbal: number; numeric: number; logic: number; spatial: number
}): { totalIQ: number; interpretation: string } {
  const zVerbal  = (raw.verbal  - IQ_NORMS.verbal.mean)  / IQ_NORMS.verbal.sd
  const zNumeric = (raw.numeric - IQ_NORMS.numeric.mean) / IQ_NORMS.numeric.sd
  const zLogic   = (raw.logic   - IQ_NORMS.logic.mean)   / IQ_NORMS.logic.sd
  const zSpatial = (raw.spatial - IQ_NORMS.spatial.mean) / IQ_NORMS.spatial.sd
  const zComposite = (zVerbal + zNumeric + zLogic + zSpatial) / 4
  const raw_iq  = Math.round(100 + 15 * zComposite)
  const totalIQ = Math.max(55, Math.min(160, raw_iq))

  const interpretation =
    totalIQ >= 130 ? "Sangat Superior" :
    totalIQ >= 120 ? "Superior" :
    totalIQ >= 110 ? "Di Atas Rata-rata" :
    totalIQ >= 90  ? "Rata-rata" :
    totalIQ >= 80  ? "Di Bawah Rata-rata" :
    totalIQ >= 70  ? "Batas Bawah" :
                     "Extremely Low"

  return { totalIQ, interpretation }
}
