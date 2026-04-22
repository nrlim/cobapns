// app/api/psych-questions/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const questions = await prisma.psychQuestion.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      text: true,
      dimension: true,
      dimensionLabel: true,
    },
  })
  return NextResponse.json(questions)
}
