"use client"

export function getFirebaseRealtimeDatabaseUrl() {
  return process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.replace(/\/$/, "") ?? null
}
