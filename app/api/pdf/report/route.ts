/**
 * PDF Generation API Route
 * GET /api/pdf/report?type=TRYOUT|IQ|PSYCHOLOGY&id=<examResultId>
 *
 * Uses PDFKit (pure Node.js) — no React 19 reconciler conflicts.
 * Security: JWT session verified + live DB tier check.
 * Performance: Streams PDF on-the-fly without cloud storage.
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { hasAccess, type UserTier } from "@/constants/permissions"

import {
  generateTryoutPDF,
  generateIQPDF,
  generatePsychometricPDF,
  type TryoutReportData,
} from "@/lib/pdf/pdfkit-generator"

import {
  getIQBand,
  getTryoutNarrative,
  PERSONALITY_NARRATIVES,
  generateCareerSuggestions,
} from "@/lib/pdf/narrative"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Strip non-ASCII characters so the filename is safe for HTTP Content-Disposition headers.
 * HTTP/1.1 header values must be Latin-1 (ISO-8859-1). Characters like em-dash (U+2014)
 * cause a "ByteString" TypeError in Node.js fetch/NextResponse.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\x00-\x7F]/g, "")   // strip any char > 127
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/[^a-zA-Z0-9\-_.]/g, "") // keep only safe chars
    .replace(/-{2,}/g, "-")           // collapse double hyphens
    .toLowerCase()
    .slice(0, 60)                     // reasonable max length
    || "laporan-cobapns"              // fallback if title becomes empty
}

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const type = (searchParams.get("type") ?? "TRYOUT").toUpperCase() as "TRYOUT" | "IQ" | "PSYCHOLOGY"
  const id = searchParams.get("id")

  // ── Live tier check ────────────────────────────────────────────────────────
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true, name: true },
  })

  const rawTier = dbUser?.subscriptionTier ?? "FREE"
  const effectiveTier: UserTier =
    rawTier !== "FREE" && dbUser?.subscriptionEnds && new Date(dbUser.subscriptionEnds) < new Date()
      ? "FREE"
      : (rawTier as UserTier)

  const requiredTier = type === "TRYOUT" ? "ELITE" : "MASTER"
  if (!hasAccess(effectiveTier, requiredTier)) {
    return NextResponse.json(
      { error: `Fitur ini membutuhkan paket ${requiredTier}.` },
      { status: 403 }
    )
  }

  try {
    let pdfBuffer: Buffer
    let filename = "laporan-cobapns.pdf"

    // ── TRYOUT ────────────────────────────────────────────────────────────────
    if (type === "TRYOUT") {
      if (!id) {
        return NextResponse.json({ error: "Parameter 'id' dibutuhkan." }, { status: 400 })
      }

      const result = await prisma.examResult.findUnique({
        where: { id },
        include: {
          exam: { select: { title: true, passingGradeTWK: true, passingGradeTIU: true, passingGradeTKP: true } },
          user: { select: { id: true, name: true } },
        },
      })

      if (!result || result.userId !== session.userId) {
        return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 })
      }

      // History for Master tier
      let examHistory: TryoutReportData["examHistory"] = []
      if (effectiveTier === "MASTER") {
        const history = await prisma.examResult.findMany({
          where: { userId: session.userId },
          orderBy: { submittedAt: "desc" },
          take: 10,
          include: { exam: { select: { title: true } } },
        })
        examHistory = history.map(h => ({
          examTitle: h.exam.title,
          submittedAt: h.submittedAt.toISOString(),
          totalScore: h.totalScore,
          overallPass: h.overallPass,
        }))
      }

      const narrative = getTryoutNarrative(
        result.scoreTWK, result.exam.passingGradeTWK,
        result.scoreTIU, result.exam.passingGradeTIU,
        result.scoreTKP, result.exam.passingGradeTKP,
        result.overallPass
      )

      pdfBuffer = await generateTryoutPDF({
        userName: result.user.name,
        tier: effectiveTier as "ELITE" | "MASTER",
        examTitle: result.exam.title,
        submittedAt: result.submittedAt.toISOString(),
        scoreTWK: result.scoreTWK,
        scoreTIU: result.scoreTIU,
        scoreTKP: result.scoreTKP,
        totalScore: result.totalScore,
        passTWK: result.passTWK,
        passTIU: result.passTIU,
        passTKP: result.passTKP,
        overallPass: result.overallPass,
        passingTWK: result.exam.passingGradeTWK,
        passingTIU: result.exam.passingGradeTIU,
        passingTKP: result.exam.passingGradeTKP,
        narrative,
        examHistory,
      })
      filename = `laporan-tryout-${sanitizeFilename(result.exam.title)}.pdf`
    }

    // ── IQ ────────────────────────────────────────────────────────────────────
    else if (type === "IQ") {
      const iqResult = await prisma.iQResult.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { name: true } } },
      })
      if (!iqResult) {
        return NextResponse.json({ error: "Tes IQ belum dikerjakan." }, { status: 404 })
      }

      const band = getIQBand(iqResult.totalIQ)
      pdfBuffer = await generateIQPDF({
        userName: iqResult.user.name,
        totalIQ: iqResult.totalIQ,
        interpretation: iqResult.interpretation ?? band.label,
        iqBandAdvice: band.advice,
        verbalRaw: iqResult.verbalRaw,
        numericRaw: iqResult.numericRaw,
        logicRaw: iqResult.logicRaw,
        spatialRaw: iqResult.spatialRaw,
        verbalTime: iqResult.verbalTime,
        numericTime: iqResult.numericTime,
        logicTime: iqResult.logicTime,
        spatialTime: iqResult.spatialTime,
        completedAt: iqResult.completedAt.toISOString(),
      })
      filename = `laporan-iq-${sanitizeFilename(session.name)}.pdf`
    }

    // ── PSYCHOLOGY ────────────────────────────────────────────────────────────
    else if (type === "PSYCHOLOGY") {
      const [psychResult, iqResult] = await Promise.all([
        prisma.psychometricResult.findUnique({
          where: { userId: session.userId },
          include: { user: { select: { name: true } } },
        }),
        prisma.iQResult.findUnique({ where: { userId: session.userId } }),
      ])

      if (!psychResult) {
        return NextResponse.json({ error: "Psikotes belum dikerjakan." }, { status: 404 })
      }

      const pType = psychResult.personalityType ?? "Generalist"
      const pInfo = PERSONALITY_NARRATIVES[pType] ?? PERSONALITY_NARRATIVES.Generalist
      const savedRecs = psychResult.careerRecs as { positions?: string[]; instansi?: string[] } | null

      let positions = savedRecs?.positions ?? []
      let instansi = savedRecs?.instansi ?? []

      const generated = generateCareerSuggestions(
        pType,
        iqResult?.totalIQ ?? 100,
        psychResult.integrity,
        psychResult.teamwork
      )
      if (positions.length === 0) {
        positions = generated.positions
        instansi = generated.instansi
      }

      const iqBand = iqResult ? getIQBand(iqResult.totalIQ) : null

      pdfBuffer = await generatePsychometricPDF({
        userName: psychResult.user.name,
        personalityType: pType,
        personalityTagline: pInfo.tagline,
        personalityDescription: pInfo.description,
        strengths: pInfo.strengths,
        growthAreas: pInfo.growthAreas,
        openness: psychResult.openness,
        conscientiousness: psychResult.conscientiousness,
        extraversion: psychResult.extraversion,
        agreeableness: psychResult.agreeableness,
        neuroticism: psychResult.neuroticism,
        integrity: psychResult.integrity,
        stressResilience: psychResult.stressResilience,
        teamwork: psychResult.teamwork,
        careerPositions: positions,
        careerInstansi: instansi,
        careerRationale: generated.rationale,
        iqScore: iqResult?.totalIQ,
        iqInterpretation: iqResult?.interpretation ?? iqBand?.label,
        completedAt: psychResult.completedAt.toISOString(),
      })
      filename = `laporan-psikometri-${sanitizeFilename(session.name)}.pdf`
    }

    else {
      return NextResponse.json({ error: "Tipe laporan tidak dikenal." }, { status: 400 })
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Report-Generated-By": "COBA PNS Platform",
      },
    })
  } catch (err) {
    console.error("[PDF Generation Error]", err)
    return NextResponse.json(
      { error: "Gagal membuat laporan PDF. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
