"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin, handleAuthError } from "@/lib/auth-guard"
import { SubscriptionTier, Role } from "@prisma/client"
import { z } from "zod"

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
