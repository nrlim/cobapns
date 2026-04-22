"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-guard"

export async function getMyTransactions() {
  const session = await requireAuth()

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      externalId: true,
      planType: true,
      amount: true,
      status: true,
      promoCode: true,
      discountAmount: true,
      paidAt: true,
      createdAt: true,
      expiredAt: true,
    },
  })

  return transactions.map(tx => ({
    ...tx,
    paidAt: tx.paidAt?.toISOString() ?? null,
    createdAt: tx.createdAt.toISOString(),
    expiredAt: tx.expiredAt?.toISOString() ?? null,
  }))
}
