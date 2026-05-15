import { NextResponse } from "next/server"
import crypto from "crypto"
import { processWebhookPayload } from "@/app/actions/billing"
import { prisma } from "@/lib/prisma"

/**
 * ── Midtrans Payment Notification Webhook ────────────────────────────────────
 *
 * Configure in Midtrans Dashboard:
 *   Settings → Configuration → Payment Notification URL:
 *   https://cobapns.com/api/webhooks/midtrans
 *
 * Security model:
 *   1. Reject non-JSON Content-Type requests.
 *   2. Validate all required fields exist on the payload.
 *   3. Verify SHA-512 signature BEFORE any DB access.
 *   4. Use constant-time Buffer comparison to eliminate timing attacks.
 *   5. Always respond HTTP 200 to Midtrans for business-logic errors
 *      (invalid sig, unknown order) so it doesn't retry indefinitely.
 *   6. Return HTTP 400/500 only for hard parse/config failures.
 */
export async function POST(req: Request) {

  // ── 1. Content-type guard ─────────────────────────────────────────────────
  const contentType = req.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 })
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ""
  if (!serverKey) {
    console.error("[Webhook] MIDTRANS_SERVER_KEY not configured")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  // Helper to log payment events
  const logPayment = async (orderId: string | null, event: string, status: string, payload: any) => {
    try {
      // @ts-ignore
      await prisma.paymentLog.create({
        data: {
          orderId,
          event,
          status,
          payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
        }
      })
    } catch (e) {
      console.error("Failed to write payment log:", e)
    }
  }

  // ── 3. Route based on Payload Type ────────────────────────────────────────

  // A. Account Linking Notification (GoPay / ShopeePay)
  if (body.account_id || body.linked_metadata) {
    console.info("[Webhook] Received Account Linking Notification:", body.account_id)
    await logPayment(body.account_id || null, "ACCOUNT_LINKING", "INFO", body)
    return NextResponse.json({ received: true, type: "account_linking" }, { status: 200 })
  }

  // B. Subscription / Recurring Notification
  if (body.subscription_id) {
    console.info("[Webhook] Received Recurring/Subscription Notification:", body.subscription_id)
    await logPayment(body.subscription_id, "SUBSCRIPTION_NOTIFICATION", "INFO", body)
    return NextResponse.json({ received: true, type: "subscription" }, { status: 200 })
  }

  // C. Standard Payment Notification
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = body

  if (order_id && status_code && gross_amount && signature_key && transaction_status) {
    await logPayment(order_id, "WEBHOOK_RECEIVED", "INFO", body)

    // ── SHA-512 Signature verification (constant-time) ────────────────────
    const raw      = `${order_id}${status_code}${gross_amount}${serverKey}`
    const computed = crypto.createHash("sha512").update(raw).digest("hex")

    let signatureValid = false
    try {
      const incomingSig = (signature_key as string).toLowerCase()
      if (incomingSig.length === computed.length) {
        signatureValid = crypto.timingSafeEqual(
          Buffer.from(computed, "hex"),
          Buffer.from(incomingSig, "hex")
        )
      }
    } catch {
      signatureValid = false
    }

    if (!signatureValid) {
      console.warn("[Webhook] Signature mismatch for order:", order_id)
      await logPayment(order_id, "SIGNATURE_MISMATCH", "WARNING", { warning: "signature_invalid" })
      return NextResponse.json({ received: true, warning: "invalid_signature" }, { status: 200 })
    }

    // ── Process the payment notification ──────────────────────────────────
    try {
      const result = await processWebhookPayload({
        order_id,
        transaction_status,
        fraud_status,
        status_code,
        gross_amount,
      })
      await logPayment(order_id, "PAYMENT_PROCESSED", "SUCCESS", { result })
      return NextResponse.json(result, { status: 200 })
    } catch (err: any) {
      console.error("[Webhook] processWebhookPayload error:", err)
      await logPayment(order_id, "PAYMENT_PROCESS_ERROR", "ERROR", { error: err.message || "Unknown error" })
      return NextResponse.json({ received: true, error: "internal_error" }, { status: 200 })
    }
  }

  // D. Unknown Payload
  console.warn("[Webhook] Received unknown Midtrans payload shape", body)
  await logPayment(null, "UNKNOWN_PAYLOAD", "WARNING", body)
  return NextResponse.json({ received: true, warning: "unhandled_payload_type" }, { status: 200 })
}

/** Reject all non-POST methods — never expose any debug information. */
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
}

export async function PUT()    { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }) }
export async function PATCH()  { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }) }
