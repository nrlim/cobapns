// app/dashboard/psychology/test/page.tsx
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PsychTestClient from "@/components/dashboard/psych-test-client"

export const metadata = {
  title: "Psikotes Kepribadian – COBA PNS",
}

export default async function PsychTestPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // Ambil soal dari database (dynamic)
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

  return <PsychTestClient questions={questions} />
}
