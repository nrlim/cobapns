"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin, handleAuthError } from "@/lib/auth-guard"
import { SubscriptionTier, Role } from "@prisma/client"
import { z } from "zod"
import { sendVerificationEmail } from "@/lib/email"

const TierSchema = z.nativeEnum(SubscriptionTier)
const RoleSchema = z.nativeEnum(Role)

export async function updateUserTier(userId: string, tier: SubscriptionTier) {
  try {
    await requireAdmin()
    TierSchema.parse(tier)
    if (!userId) return { success: false, error: "ID tidak valid" }

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal memperbarui tier langganan" }
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  try {
    await requireAdmin()
    if (!userId) return { success: false, error: "ID tidak valid" }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus },
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal mengubah status pengguna" }
  }
}

export async function updateUserRole(userId: string, role: Role) {
  try {
    await requireAdmin()
    RoleSchema.parse(role)
    if (!userId) return { success: false, error: "ID tidak valid" }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal memperbarui peran pengguna" }
  }
}

export async function resendVerificationEmail(userId: string) {
  try {
    await requireAdmin()
    if (!userId) return { success: false, error: "ID tidak valid" }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: "Pengguna tidak ditemukan" }
    
    if (user.emailVerified) {
      return { success: false, error: "Email pengguna ini sudah terverifikasi." }
    }

    const tokenStr = crypto.randomUUID()
    
    await prisma.verificationToken.deleteMany({
      where: { email: user.email }
    })

    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token: tokenStr,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    })

    const emailResult = await sendVerificationEmail(user.email, tokenStr, user.name)
    
    if (!emailResult.success) {
       return { success: false, error: "Gagal mengirim email. Pastikan konfigurasi SMTP/Resend sudah benar." }
    }

    return { success: true, message: "Email verifikasi berhasil dikirim ulang!" }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Terjadi kesalahan sistem saat mengirim ulang email verifikasi" }
  }
}
