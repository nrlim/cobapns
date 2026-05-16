"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { handleAuthError, requireAdmin } from "@/lib/auth-guard"
import { deleteRealtimeNotification, upsertRealtimeNotification } from "@/lib/firebase-admin"

const NotificationInputSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter.").max(100, "Judul maksimal 100 karakter."),
  message: z.string().trim().min(5, "Pesan minimal 5 karakter.").max(1000, "Pesan maksimal 1000 karakter."),
  ctaLabel: z.string().trim().max(40, "Label CTA maksimal 40 karakter.").optional().nullable(),
  ctaUrl: z.string().trim().max(255, "URL maksimal 255 karakter.").optional().nullable(),
  isPublished: z.boolean(),
})

const IdSchema = z.string().min(1)

export type NotificationActionResult =
  | { success: true; id?: string }
  | { success: false; error: string }

function normalizeOptional(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function validateCta(ctaLabel: string | null, ctaUrl: string | null): string | null {
  if ((ctaLabel && !ctaUrl) || (!ctaLabel && ctaUrl)) {
    return "Label dan URL tombol harus diisi bersamaan."
  }

  if (ctaUrl && !ctaUrl.startsWith("/dashboard") && !ctaUrl.startsWith("/")) {
    return "URL tombol harus berupa path internal, contoh: /dashboard/learning."
  }

  return null
}

export async function createNotificationAction(input: unknown): Promise<NotificationActionResult> {
  try {
    const session = await requireAdmin()
    const parsed = NotificationInputSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid." }

    const ctaLabel = normalizeOptional(parsed.data.ctaLabel)
    const ctaUrl = normalizeOptional(parsed.data.ctaUrl)
    const ctaError = validateCta(ctaLabel, ctaUrl)
    if (ctaError) return { success: false, error: ctaError }

    const notification = await prisma.notification.create({
      data: {
        title: parsed.data.title,
        message: parsed.data.message,
        ctaLabel,
        ctaUrl,
        isPublished: parsed.data.isPublished,
        createdById: session.userId,
      },
      select: {
        id: true,
        title: true,
        message: true,
        ctaLabel: true,
        ctaUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await upsertRealtimeNotification(notification)

    revalidatePath("/admin/notifications")
    revalidatePath("/dashboard")
    return { success: true, id: notification.id }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) return handleAuthError(err)
    return { success: false, error: "Gagal membuat notifikasi." }
  }
}

export async function updateNotificationAction(id: string, input: unknown): Promise<NotificationActionResult> {
  try {
    await requireAdmin()
    const notificationId = IdSchema.parse(id)
    const parsed = NotificationInputSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid." }

    const ctaLabel = normalizeOptional(parsed.data.ctaLabel)
    const ctaUrl = normalizeOptional(parsed.data.ctaUrl)
    const ctaError = validateCta(ctaLabel, ctaUrl)
    if (ctaError) return { success: false, error: ctaError }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        title: parsed.data.title,
        message: parsed.data.message,
        ctaLabel,
        ctaUrl,
        isPublished: parsed.data.isPublished,
      },
      select: {
        id: true,
        title: true,
        message: true,
        ctaLabel: true,
        ctaUrl: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await upsertRealtimeNotification(notification)

    revalidatePath("/admin/notifications")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) return handleAuthError(err)
    return { success: false, error: "Gagal memperbarui notifikasi." }
  }
}

export async function deleteNotificationAction(id: string): Promise<NotificationActionResult> {
  try {
    await requireAdmin()
    const notificationId = IdSchema.parse(id)

    await prisma.notification.delete({
      where: { id: notificationId },
      select: { id: true },
    })

    await deleteRealtimeNotification(notificationId)

    revalidatePath("/admin/notifications")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) return handleAuthError(err)
    return { success: false, error: "Gagal menghapus notifikasi." }
  }
}
