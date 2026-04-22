import { NextResponse } from "next/server"
import crypto from "crypto"
import { processWebhookPayload } from "@/app/actions/billing"

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
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = body

  // ── 3. Required field validation ──────────────────────────────────────────
  if (!order_id || !status_code || !gross_amount || !signature_key || !transaction_status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // ── 4. Server key presence check ──────────────────────────────────────────
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ""
  if (!serverKey) {
    console.error("[Webhook] MIDTRANS_SERVER_KEY not configured")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  // ── 5. SHA-512 Signature verification (constant-time) ────────────────────
  //    Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
  const raw      = `${order_id}${status_code}${gross_amount}${serverKey}`
  const computed = crypto.createHash("sha512").update(raw).digest("hex") // 128 hex chars

  let signatureValid = false
  try {
    const incomingSig = (signature_key as string).toLowerCase()

    // Only compare if lengths match exactly — mismatched lengths always fail
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
    // Log the rejection but respond 200 — Midtrans cannot fix a bad sig by retrying
    console.warn("[Webhook] Signature mismatch for order:", order_id)
    return NextResponse.json({ received: true, warning: "invalid_signature" }, { status: 200 })
  }

  // ── 6. Process the payment notification ──────────────────────────────────
  try {
    const result = await processWebhookPayload({
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    // Don't return 5xx — Midtrans retries infinitely on 5xx. Log and respond 200.
    console.error("[Webhook] processWebhookPayload error:", err)
    return NextResponse.json({ received: true, error: "internal_error" }, { status: 200 })
  }
}

/** Reject all non-POST methods — never expose any debug information. */
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
}

export async function PUT()    { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }) }
export async function PATCH()  { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }) }
