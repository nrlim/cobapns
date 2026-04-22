import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-guard"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsClient } from "./settings-client"
import { getLookupsByType } from "@/app/actions/lookup"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pengaturan Akun | COBA PNS",
  description: "Atur profil dan preferensi keamanan akun COBA PNS kamu.",
}

export default async function SettingsPage() {
  let session: Awaited<ReturnType<typeof requireAuth>>
  try {
    session = await requireAuth()
  } catch {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    select: {
      name: true,
      email: true,
      phoneNumber: true,
      targetInstansi: true,
      jabatan: true,
      jenjang: true,
      prodi: true,
      gender: true,
      profession: true,
      learningWay: true,
      learningPref: true,
      source: true,
      learningGoal: true,
      notifEmail: true,
      avatarUrl: true,
      subscriptionTier: true,
      createdAt: true,
    },
  })

  if (!user) redirect("/login")

  const instances = await getLookupsByType("INSTANCE")
  const positions = await getLookupsByType("POSITION")
  const educations = await getLookupsByType("EDUCATION")
  const majors = await getLookupsByType("MAJOR")
  
  const lookups = {
    instances: instances.map(i => i.name),
    positions: positions.map(p => p.name),
    educations: educations.map(e => e.name),
    majors: majors.map(m => m.name),
  }

  return (
    <DashboardShell activeHref="/dashboard/settings" user={{ name: session!.name, role: session!.role }}>
      <SettingsClient user={user} lookups={lookups} />
    </DashboardShell>
  )
}
