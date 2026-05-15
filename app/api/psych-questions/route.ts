// app/api/psych-questions/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
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
