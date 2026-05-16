"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { handleAuthError, requireAuth } from "@/lib/auth-guard"

const IdSchema = z.string().min(1)

export async function getStudentNotificationsAction() {
  try {
    const session = await requireAuth()

    const notifications = await prisma.notification.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        ctaLabel: true,
        ctaUrl: true,
        createdAt: true,
        reads: {
          where: { userId: session.userId },
          select: { readAt: true },
          take: 1,
        },
      },
    })

    return {
      success: true as const,
      notifications: notifications.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        ctaLabel: item.ctaLabel,
        ctaUrl: item.ctaUrl,
        createdAt: item.createdAt,
        read: item.reads.length > 0,
      })),
    }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) return handleAuthError(err)
    return { success: false as const, error: "Gagal memuat notifikasi." }
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const session = await requireAuth()
    const id = IdSchema.parse(notificationId)

    await prisma.userNotificationRead.upsert({
      where: { userId_notificationId: { userId: session.userId, notificationId: id } },
      update: { readAt: new Date() },
      create: { userId: session.userId, notificationId: id },
      select: { id: true },
    })

    revalidatePath("/dashboard")
    return { success: true as const }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) return handleAuthError(err)
    return { success: false as const, error: "Gagal menandai notifikasi." }
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const session = await requireAuth()

    const notifications = await prisma.notification.findMany({
      where: { isPublished: true },
      select: { id: true },
      take: 50,
    })

    if (notifications.length > 0) {
      await prisma.userNotificationRead.createMany({
        data: notifications.map((notification) => ({ userId: session.userId, notificationId: notification.id })),
        skipDuplicates: true,
      })
    }

    revalidatePath("/dashboard")
    return { success: true as const }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) return handleAuthError(err)
    return { success: false as const, error: "Gagal menandai semua notifikasi." }
  }
}
