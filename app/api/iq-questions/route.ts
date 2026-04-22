// app/api/iq-questions/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [verbal, numeric, logic, spatial, configs] = await Promise.all([
    prisma.iQQuestion.findMany({
      where: { subTest: "VERBAL", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQQuestion.findMany({
      where: { subTest: "NUMERIC", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQQuestion.findMany({
      where: { subTest: "LOGIC", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQQuestion.findMany({
      where: { subTest: "SPATIAL", isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.iQSubTestConfig.findMany(),
  ])

  // Build config map
  const cfgMap: Record<string, number> = {
    VERBAL: 300, NUMERIC: 300, LOGIC: 360, SPATIAL: 300,
  }
  for (const c of configs) {
    cfgMap[c.subTest] = c.timeSeconds
  }

  return NextResponse.json({
    verbal:  { questions: verbal,  timeSeconds: cfgMap.VERBAL },
    numeric: { questions: numeric, timeSeconds: cfgMap.NUMERIC },
    logic:   { questions: logic,   timeSeconds: cfgMap.LOGIC },
    spatial: { questions: spatial, timeSeconds: cfgMap.SPATIAL },
  })
}
