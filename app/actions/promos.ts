"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PromoSchema = z.object({
  code: z.string().min(3).max(32).transform((v) => v.toUpperCase().trim()),
  discountPct: z.number().int().min(1).max(100),
  isActive: z.boolean().default(true),
  maxUses: z.number().int().min(0).optional().nullable(),
  validUntil: z.string().optional().nullable(),
})

export async function getPromosAction() {
  await requireAdmin()
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  })
  return promos
}

export async function createPromoAction(data: z.infer<typeof PromoSchema>) {
  await requireAdmin()
  const parsed = PromoSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("Invalid promo code data")
  }

  const { code, discountPct, isActive, maxUses, validUntil } = parsed.data

  const existing = await prisma.promoCode.findUnique({ where: { code } })
  if (existing) {
    throw new Error("Promo code already exists")
  }

  await prisma.promoCode.create({
    data: {
      code,
      discountPct,
      isActive,
      maxUses: maxUses || null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  })

  revalidatePath("/admin/settings/promos")
  return { success: true }
}

export async function updatePromoAction(id: string, data: z.infer<typeof PromoSchema>) {
  await requireAdmin()
  const parsed = PromoSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("Invalid promo code data")
  }

  const { code, discountPct, isActive, maxUses, validUntil } = parsed.data

  const existing = await prisma.promoCode.findUnique({ where: { code } })
  if (existing && existing.id !== id) {
    throw new Error("Promo code already exists")
  }

  await prisma.promoCode.update({
    where: { id },
    data: {
      code,
      discountPct,
      isActive,
      maxUses: maxUses || null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  })

  revalidatePath("/admin/settings/promos")
  return { success: true }
}

export async function deletePromoAction(id: string) {
  await requireAdmin()
  await prisma.promoCode.delete({ where: { id } })
  revalidatePath("/admin/settings/promos")
  return { success: true }
}
