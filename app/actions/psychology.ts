"use server"

import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { requireTier, handleAuthError } from "@/lib/auth-guard"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import {
  scorePsychAnswers,
  derivePersonalityType,
  calculateIQ,
} from "@/lib/psych-scoring"

// ─── Types ────────────────────────────────────────────────────────────────────

export type PsychAnswers = Record<string, number> // questionId → likert 1-5

export type IQAnswers = {
  verbal:  Record<string, string>
  numeric: Record<string, string>
  logic:   Record<string, string>
  spatial: Record<string, string>
  timings: {
    verbal: number; numeric: number; logic: number; spatial: number
  }
}

// Use a dedicated short-lived client per action to avoid pool exhaustion.
function makeClient() {
  return new PrismaClient({ log: ["error"] })
}

// ─── Submit Psychometric Test ─────────────────────────────────────────────────

export async function submitPsychometricTest(answers: PsychAnswers): Promise<void> {
  // ── Tier Guard: MASTER only ────────────────────────────────────────────────
  try {
    await requireTier("MASTER")
  } catch (err) {
    const result = handleAuthError(err)
    if (!result.success) {
      if ((err as Error).message === "UNAUTHENTICATED") redirect("/login")
      redirect("/dashboard/pembelian?upgrade=1&from=psychology-test")
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const db = makeClient()
  try {
    // Fetch dimension mapping from DB for dynamic scoring
    const psychQs = await db.psychQuestion.findMany({
      where: { isActive: true },
      select: { id: true, dimension: true },
    })
    const dimensionMap: Record<string, string> = {}
    for (const q of psychQs) dimensionMap[q.id] = q.dimension

    const scores          = scorePsychAnswers(answers, dimensionMap)
    const personalityType = derivePersonalityType(scores)

    const [positions, instansi] = await Promise.all([
      db.lookup.findMany({ where: { type: "POSITION", isActive: true }, select: { name: true }, take: 3 }),
      db.lookup.findMany({ where: { type: "INSTANCE", isActive: true }, select: { name: true }, take: 2 }),
    ])

    const careerRecs = {
      positions: positions.map(p => p.name),
      instansi:  instansi.map(i => i.name),
    }

    await db.psychometricResult.upsert({
      where:  { userId: session.userId },
      create: { userId: session.userId, ...scores, personalityType, careerRecs },
      update: { ...scores, personalityType, careerRecs, updatedAt: new Date() },
    })
  } finally {
    await db.$disconnect()
  }

  redirect("/dashboard/psychology/result")
}

// ─── Submit IQ Test ───────────────────────────────────────────────────────────

export async function submitIQTest(payload: IQAnswers): Promise<void> {
  // ── Tier Guard: MASTER and above ──────────────────────────────────────────
  try {
    await requireTier("MASTER")
  } catch (err) {
    // Re-throw NEXT_REDIRECT so Next.js can navigate correctly
    if ((err as Error & { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw err
    if ((err as Error).message === "UNAUTHENTICATED") redirect("/login")
    redirect("/dashboard/pembelian?upgrade=1&from=iq-test")
  }
  // ─────────────────────────────────────────────────────────────────────────

  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const db = makeClient()
  try {
    // Fetch correct answers from DB (dynamic — no static file dependency)
    const allIQQuestions = await db.iQQuestion.findMany({
      where: { isActive: true },
      select: { id: true, subTest: true, answerKey: true },
    })

    // Build correct answer map per sub-test (keyed by DB row ID)
    const correctMap: Record<string, Record<string, string>> = {
      VERBAL: {}, NUMERIC: {}, LOGIC: {}, SPATIAL: {},
    }
    for (const q of allIQQuestions) {
      correctMap[q.subTest][q.id] = q.answerKey
    }

    function countCorrect(
      answers: Record<string, string>,
      correct: Record<string, string>
    ): number {
      return Object.entries(answers).filter(([id, val]) => correct[id] === val).length
    }

    const verbalRaw  = countCorrect(payload.verbal,  correctMap.VERBAL)
    const numericRaw = countCorrect(payload.numeric, correctMap.NUMERIC)
    const logicRaw   = countCorrect(payload.logic,   correctMap.LOGIC)
    const spatialRaw = countCorrect(payload.spatial,  correctMap.SPATIAL)

    const { totalIQ, interpretation } = calculateIQ({
      verbal: verbalRaw, numeric: numericRaw, logic: logicRaw, spatial: spatialRaw,
    })

    await db.iQResult.upsert({
      where:  { userId: session.userId },
      create: {
        userId: session.userId,
        verbalRaw, numericRaw, logicRaw, spatialRaw,
        verbalTime:  payload.timings.verbal,
        numericTime: payload.timings.numeric,
        logicTime:   payload.timings.logic,
        spatialTime: payload.timings.spatial,
        totalIQ, interpretation,
      },
      update: {
        verbalRaw, numericRaw, logicRaw, spatialRaw,
        verbalTime:  payload.timings.verbal,
        numericTime: payload.timings.numeric,
        logicTime:   payload.timings.logic,
        spatialTime: payload.timings.spatial,
        totalIQ, interpretation,
        updatedAt: new Date(),
      },
    })
  } finally {
    await db.$disconnect()
  }

  redirect("/dashboard/psychology/result")
}
