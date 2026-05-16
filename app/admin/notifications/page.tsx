import { prisma } from "@/lib/prisma"
import { NotificationsAdminClient } from "@/components/admin/notifications-admin-client"

export const metadata = {
  title: "Manage Notifications | Admin COBA PNS",
}

export const dynamic = "force-dynamic"

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      message: true,
      ctaLabel: true,
      ctaUrl: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { reads: true } },
    },
  })

  return <NotificationsAdminClient initialNotifications={notifications} />
}
