import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { HelpCenterClient } from "./help-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pusat Bantuan | COBA PNS",
  description: "Cari jawaban atas pertanyaan kamu atau hubungi tim support COBA PNS.",
}

export default async function HelpCenterPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  return (
    <DashboardShell activeHref="/dashboard/help" user={{ name: session.name, role: session.role }}>
      <HelpCenterClient />
    </DashboardShell>
  )
}
