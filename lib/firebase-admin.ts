import { readFileSync } from "node:fs"
import { join } from "node:path"

import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"

type FirebaseServiceAccountJson = {
  project_id?: string
  client_email?: string
  private_key?: string
}

const DEFAULT_SERVICE_ACCOUNT_PATH = "cobapns-firebase-adminsdk-fbsvc-3e1750d16d.json"

function normalizeServiceAccount(account: FirebaseServiceAccountJson): ServiceAccount & { projectId?: string } {
  return {
    projectId: account.project_id,
    clientEmail: account.client_email,
    privateKey: account.private_key?.replace(/\\n/g, "\n"),
  }
}

function readServiceAccount(): (ServiceAccount & { projectId?: string }) | null {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (inlineJson) return normalizeServiceAccount(JSON.parse(inlineJson) as FirebaseServiceAccountJson)

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? join(process.cwd(), DEFAULT_SERVICE_ACCOUNT_PATH)
  return normalizeServiceAccount(JSON.parse(readFileSync(filePath, "utf8")) as FirebaseServiceAccountJson)
}

function getDatabaseUrl(serviceAccount: ServiceAccount & { projectId?: string }) {
  return (
    process.env.FIREBASE_DATABASE_URL ??
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
    (serviceAccount.projectId ? `https://${serviceAccount.projectId}-default-rtdb.firebaseio.com` : undefined)
  )
}

export function getFirebaseAdminApp(): App | null {
  try {
    const existing = getApps()[0]
    if (existing) return existing

    const serviceAccount = readServiceAccount()
    if (!serviceAccount?.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) return null

    const databaseURL = getDatabaseUrl(serviceAccount)
    if (!databaseURL) return null

    return initializeApp({
      credential: cert(serviceAccount),
      databaseURL,
    })
  } catch {
    return null
  }
}

export async function upsertRealtimeNotification(input: {
  id: string
  title: string
  message: string
  ctaLabel: string | null
  ctaUrl: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}) {
  const app = getFirebaseAdminApp()
  if (!app) return { success: false as const, error: "Firebase admin is not configured." }

  const db = getDatabase(app)
  const ref = db.ref(`notifications/${input.id}`)

  if (!input.isPublished) {
    await ref.remove()
  } else {
    await ref.set({
      id: input.id,
      title: input.title,
      message: input.message,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      createdAt: input.createdAt.toISOString(),
      updatedAt: input.updatedAt.toISOString(),
    })
  }

  await db.ref("notificationMeta/updatedAt").set(new Date().toISOString())
  return { success: true as const }
}

export async function deleteRealtimeNotification(id: string) {
  const app = getFirebaseAdminApp()
  if (!app) return { success: false as const, error: "Firebase admin is not configured." }

  const db = getDatabase(app)
  await db.ref(`notifications/${id}`).remove()
  await db.ref("notificationMeta/updatedAt").set(new Date().toISOString())
  return { success: true as const }
}
