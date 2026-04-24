import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifySession } from "@/lib/session"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sipns-session")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await verifySession(token)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { rating, content, tags } = body

    if (!rating || !content || !tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Check if user already gave feedback to prevent duplicate submissions
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { hasGivenFeedback: true }
    })

    if (user?.hasGivenFeedback) {
      return NextResponse.json({ error: "Already gave feedback" }, { status: 400 })
    }

    // Create testimonial and update user in a transaction
    await prisma.$transaction([
      prisma.testimonial.create({
        data: {
          userId: session.userId,
          rating,
          content,
          tags,
          isVerified: true, // Organic submission means real buyer
          status: "PENDING"
        }
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { hasGivenFeedback: true }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Testimonial Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
