"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { addMonths } from "date-fns"
import crypto from "crypto"
import { z } from "zod"

// ─── Plan Config ──────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, Record<number, number>> = {
  ELITE: {
    1: 49_000,
    12: 99_000,
  },
  MASTER: {
    1: 89_000,
    12: 149_000,
  },
};

const VALID_PAID_PLANS = ["ELITE", "MASTER"] as const
type PaidPlan = typeof VALID_PAID_PLANS[number]

const PLAN_TIER_MAP: Record<PaidPlan, "ELITE" | "MASTER"> = {
  ELITE:  "ELITE",
  MASTER: "MASTER",
}

// ─── Promo Codes (server-side only — never exposed to client) ─────────────────

const PROMO_CODES: Record<string, number> = {
  COBAPNS10: 10,
  CPNS2025:  20,
  WELCOME50: 50,
}

// ─── Input schema for createTransaction ───────────────────────────────────────

const createTransactionSchema = z.object({
  planType:       z.enum(["FREE", "ELITE", "MASTER"]),
  promoCode:      z.string().trim().max(32).optional(),
  durationMonths: z.number().int().min(1).max(12).optional().default(1),
})

// ─── Midtrans helpers ─────────────────────────────────────────────────────────

function midtransAuth() {
  const key = process.env.MIDTRANS_SERVER_KEY ?? ""
  if (!key) throw new Error("MIDTRANS_SERVER_KEY not configured")
  return Buffer.from(`${key}:`).toString("base64")
}

function midtransBaseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1"
}

function midtransCoreUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2"
}

// ─── getActiveSubscription ────────────────────────────────────────────────────

export interface SubscriptionInfo {
  id: string
  planType: string
  status: string
  startDate: string
  endDate: string
}

export async function getActiveSubscription(): Promise<SubscriptionInfo | null> {
  const session = await requireAuth()

  const sub = await prisma.subscription.findFirst({
    where: {
      userId: session.userId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
    },
    orderBy: { endDate: "desc" },
  })

  if (!sub) return null

  return {
    id:        sub.id,
    planType:  sub.planType,
    status:    sub.status,
    startDate: sub.startDate.toISOString(),
    endDate:   sub.endDate.toISOString(),
  }
}

// ─── applyPromoCode ───────────────────────────────────────────────────────────

export async function applyPromoCode(
  code: string,
  planType: string
): Promise<{ valid: boolean; discountPct: number; message: string }> {
  // Authenticate: even this "read" action must verify the user is logged in
  await requireAuth()

  const upper = code.trim().toUpperCase().slice(0, 32) // cap length
  const pct = PROMO_CODES[upper]

  if (!pct) return { valid: false, discountPct: 0, message: "Kode promo tidak valid atau sudah kedaluwarsa." }

  const prices = PLAN_PRICES[planType]
  if (!prices) return { valid: false, discountPct: 0, message: "Kode promo tidak berlaku untuk paket ini." }


  return { valid: true, discountPct: pct, message: `Diskon ${pct}% berhasil diterapkan! 🎉` }
}

// ─── createTransaction ────────────────────────────────────────────────────────
/**
 * 1. Validate typed input with Zod (never trust client-provided types).
 * 2. Idempotency: reuse existing PENDING Midtrans order if still valid.
 * 3. Compute final price server-side — promo discount cannot be tampered.
 * 4. Persist PENDING row AFTER Midtrans responds with a valid snap_token.
 * 5. Return snap_token to client so it can open window.snap.pay().
 */
export async function createTransaction(input: {
  planType: string
  promoCode?: string
  durationMonths?: number
}): Promise<{ success: boolean; snapToken?: string; clientKey?: string; error?: string }> {
  try {
    const session = await requireAuth()

    // Validate + sanitise all inputs server-side regardless of client
    const parsed = createTransactionSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: "Input tidak valid." }
    }

    const { planType, promoCode, durationMonths } = parsed.data

    // ── FREE plan: instant downgrade, no payment needed ──────────────────────
    if (planType === "FREE") {
      await prisma.user.update({
        where: { id: session.userId },
        data: { subscriptionTier: "FREE" },
      })
      revalidatePath("/dashboard/pembelian")
      return { success: true }
    }

    // ── Guard: only allow paid plans from here ────────────────────────────────
    if (!VALID_PAID_PLANS.includes(planType as PaidPlan)) {
      return { success: false, error: "Paket tidak valid." }
    }

    const prices = PLAN_PRICES[planType]!
    const baseAmount = prices[durationMonths] ?? prices[1] // Default to 1 month if duration not found


    // ── Idempotency: reuse existing valid PENDING order ───────────────────────
    // Compute the intended amount first to ensure we don't reuse an order with an old/different price
    let discountAmount = 0
    let appliedPromo: string | null = null
    if (promoCode) {
      const upper = promoCode.trim().toUpperCase().slice(0, 32)
      const pct = PROMO_CODES[upper]
      if (pct) {
        discountAmount = Math.round(baseAmount * (pct / 100))
        appliedPromo = upper
      }
    }

    const finalAmount = Math.max(1_000, baseAmount - discountAmount)

    const existingPending = await prisma.transaction.findFirst({
      where: {
        userId:         session.userId,
        planType:       planType as PaidPlan,
        durationMonths: durationMonths,
        amount:         finalAmount,
        status:         "PENDING",
        snapToken:      { not: null },
        expiredAt:      { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (existingPending?.snapToken) {
      return {
        success:   true,
        snapToken: existingPending.snapToken,
        clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
      }
    }



    // Unique, collision-resistant order ID
    const externalId = `SIPNS-${session.userId.slice(-6)}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`

    // ── Call Midtrans Snap API ─────────────────────────────────────────────────
    const snapPayload = {
      transaction_details: {
        order_id:     externalId,
        gross_amount: finalAmount,
      },
      customer_details: {
        first_name: session.name,
        email:      session.email,
      },
      item_details: [
        {
          id:       planType,
          price:    finalAmount,
          quantity: 1,
          name:     `COBA PNS ${planType === "ELITE" ? "Elite Prep" : "Master Strategy"} (${durationMonths} bln)`,
        },
      ],
      callbacks: {
        finish:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pembelian?status=finish`,
        error:   `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pembelian?status=error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pembelian?status=pending`,
      },
    }

    const snapRes = await fetch(`${midtransBaseUrl()}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Basic ${midtransAuth()}`,
        Accept:         "application/json",
      },
      body: JSON.stringify(snapPayload),
    })

    if (!snapRes.ok) {
      const errBody = await snapRes.text()
      console.error("[Midtrans Snap]", snapRes.status, errBody)
      return { success: false, error: "Gagal membuat sesi pembayaran. Coba lagi sebentar." }
    }

    const snapData = await snapRes.json() as { token: string; redirect_url: string }
    const snapToken = snapData.token

    // Persist transaction AFTER we have a valid snap token (never persist orphans)
    await prisma.transaction.create({
      data: {
        userId:         session.userId,
        planType:       planType as PaidPlan,
        amount:         finalAmount,
        status:         "PENDING",
        snapToken,
        externalId,
        promoCode:      appliedPromo,
        discountAmount,
        durationMonths,
        expiredAt:      new Date(Date.now() + 24 * 60 * 60 * 1_000),
      },
    })

    return {
      success:   true,
      snapToken,
      clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
    }
  } catch (err) {
    console.error("[createTransaction]", err)
    return { success: false, error: "Terjadi kesalahan server. Silakan coba lagi." }
  }
}

// ─── verifyMidtransSignature ──────────────────────────────────────────────────
/**
 * SHA512(order_id + status_code + gross_amount + ServerKey).
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyMidtransSignature(
  orderId:           string,
  statusCode:        string,
  grossAmount:       string,
  incomingSignature: string
): Promise<boolean> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ""
  if (!serverKey) return false

  const raw      = `${orderId}${statusCode}${grossAmount}${serverKey}`
  const computed = crypto.createHash("sha512").update(raw).digest("hex")

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(incomingSignature.toLowerCase().padEnd(computed.length, "x").slice(0, computed.length), "hex")
    )
  } catch {
    return false
  }
}

// ─── processWebhookPayload ────────────────────────────────────────────────────
/**
 * Core business logic for payment webhook — always called AFTER signature verification.
 * Uses a Prisma transaction for the success path to ensure atomicity.
 */
export async function processWebhookPayload(payload: {
  order_id:           string
  transaction_status: string
  fraud_status?:      string
  status_code?:       string
  gross_amount?:      string
}) {
  const { order_id, transaction_status, fraud_status } = payload

  // Guard: order_id must match our format to avoid processing unrelated webhooks
  if (!order_id?.startsWith("SIPNS-")) {
    return { received: true, warning: "unknown_order_format" }
  }

  const tx = await prisma.transaction.findFirst({ where: { externalId: order_id } })
  if (!tx) return { received: true, warning: "unknown_order" }

  // Idempotency — never reprocess an already-settled transaction
  if (tx.status === "SUCCESS") return { received: true }

  const isSuccess =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept")
  const isFailed  = ["deny", "cancel", "failure"].includes(transaction_status)
  const isExpired = transaction_status === "expire"

  const newStatus = isSuccess ? "SUCCESS" : isFailed ? "FAILED" : isExpired ? "EXPIRED" : "PENDING"

  if (!isSuccess) {
    // Non-success: simple status update, no atomicity needed
    await prisma.transaction.update({
      where: { id: tx.id },
      data:  { status: newStatus },
    })
    return { received: true }
  }

  // ── Success path: atomic transaction ─────────────────────────────────────────
  // 1. Update transaction status
  // 2. Create subscription (extending if active)
  // 3. Update user tier and expiration date
  // All or nothing — prevents partial state if one write fails
  await prisma.$transaction(async (trx) => {
    // Determine duration based on stored durationMonths
    const monthsToAdd = tx.durationMonths ?? 1;

    // Check for existing active subscription of the SAME plan to extend it
    const currentSub = await trx.subscription.findFirst({
      where: {
        userId: tx.userId,
        planType: tx.planType,
        status: "ACTIVE",
        endDate: { gt: new Date() },
      },
      orderBy: { endDate: "desc" },
    });

    const baseDate = currentSub ? currentSub.endDate : new Date();
    const endDate = addMonths(baseDate, monthsToAdd);

    // Update transaction status first
    await trx.transaction.update({
      where: { id: tx.id },
      data:  { status: "SUCCESS", paidAt: new Date() },
    });

    // Create subscription
    const sub = await trx.subscription.create({
      data: {
        userId:    tx.userId,
        planType:  tx.planType,
        status:    "ACTIVE",
        startDate: new Date(),
        endDate,
      },
    });

    // Link subscription to transaction
    await trx.transaction.update({
      where: { id: tx.id },
      data:  { subscriptionId: sub.id },
    });

    // Upgrade user tier and set expiration date
    const tier = PLAN_TIER_MAP[tx.planType as PaidPlan];
    if (tier) {
      await trx.user.update({
        where: { id: tx.userId },
        data:  { 
          subscriptionTier: tier,
          subscriptionEnds: endDate,
        },
      });
    }
  });

  revalidatePath("/dashboard/pembelian")
  revalidatePath("/dashboard")

  return { received: true }
}

// ─── syncMidtransTransaction ──────────────────────────────────────────────────
/**
 * Fetches real-time status from Midtrans Core API and processes it like a webhook.
 * Called client-side after Snap's onSuccess to avoid waiting for the webhook.
 *
 * SECURITY: externalId is validated against our DB before calling Midtrans,
 * so a crafted externalId can't trigger processing of an unrelated order.
 */
export async function syncMidtransTransaction(externalId: string) {
  try {
    // Auth check — ensure only logged-in users can trigger a sync
    const session = await requireAuth()

    // Input guard
    if (!externalId || typeof externalId !== "string" || externalId.length > 80) {
      return { success: false }
    }

    // Ownership check: verify the externalId belongs to the calling user
    const tx = await prisma.transaction.findFirst({
      where: { externalId, userId: session.userId },
      select: { id: true, status: true },
    })
    if (!tx) return { success: false } // either not found or belongs to another user

    // Skip Midtrans API call if already settled
    if (tx.status === "SUCCESS") return { success: true }

    const res = await fetch(`${midtransCoreUrl()}/${encodeURIComponent(externalId)}/status`, {
      method:  "GET",
      headers: {
        Accept:        "application/json",
        Authorization: `Basic ${midtransAuth()}`,
      },
    })

    if (!res.ok) {
      if (res.status !== 404) {
        console.error("[SyncMidtrans] API error:", res.status)
      }
      return { success: false }
    }

    const data = await res.json()

    await processWebhookPayload({
      order_id:           data.order_id,
      transaction_status: data.transaction_status,
      fraud_status:       data.fraud_status,
      status_code:        data.status_code,
      gross_amount:       data.gross_amount,
    })

    return { success: true }
  } catch (err) {
    console.error("[SyncMidtrans] error:", err)
    return { success: false }
  }
}
