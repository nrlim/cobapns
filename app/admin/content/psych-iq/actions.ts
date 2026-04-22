// app/admin/content/psych-iq/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"

// ─── Guard ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session || session.role !== "ADMIN") redirect("/login")
  return session
}

// ─── Psych Question CRUD ──────────────────────────────────────────────────────

export async function createPsychQuestion(data: {
  text: string
  dimension: string
  dimensionLabel: string
  order: number
}) {
  await requireAdmin()
  await prisma.psychQuestion.create({ data: { ...data, isActive: true } })
  revalidatePath("/admin/content/psych-iq")
}

export async function updatePsychQuestion(id: string, data: {
  text?: string
  dimension?: string
  dimensionLabel?: string
  order?: number
  isActive?: boolean
}) {
  await requireAdmin()
  await prisma.psychQuestion.update({ where: { id }, data })
  revalidatePath("/admin/content/psych-iq")
}

export async function deletePsychQuestion(id: string) {
  await requireAdmin()
  await prisma.psychQuestion.delete({ where: { id } })
  revalidatePath("/admin/content/psych-iq")
}

export async function togglePsychQuestion(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.psychQuestion.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/content/psych-iq")
}

// ─── IQ Question CRUD ─────────────────────────────────────────────────────────

export async function createIQQuestion(data: {
  subTest: "VERBAL" | "NUMERIC" | "LOGIC" | "SPATIAL"
  text: string
  options: { key: string; label: string }[]
  answerKey: string
  order: number
}) {
  await requireAdmin()
  await prisma.iQQuestion.create({
    data: { ...data, options: data.options, isActive: true },
  })
  revalidatePath("/admin/content/psych-iq")
}

export async function updateIQQuestion(id: string, data: {
  subTest?: "VERBAL" | "NUMERIC" | "LOGIC" | "SPATIAL"
  text?: string
  options?: { key: string; label: string }[]
  answerKey?: string
  order?: number
  isActive?: boolean
}) {
  await requireAdmin()
  await prisma.iQQuestion.update({ where: { id }, data })
  revalidatePath("/admin/content/psych-iq")
}

export async function deleteIQQuestion(id: string) {
  await requireAdmin()
  await prisma.iQQuestion.delete({ where: { id } })
  revalidatePath("/admin/content/psych-iq")
}

export async function toggleIQQuestion(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.iQQuestion.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/content/psych-iq")
}

// ─── IQ SubTest Config ────────────────────────────────────────────────────────

export async function updateIQSubTestConfig(
  subTest: "VERBAL" | "NUMERIC" | "LOGIC" | "SPATIAL",
  timeSeconds: number
) {
  await requireAdmin()
  await prisma.iQSubTestConfig.upsert({
    where:  { subTest },
    create: { subTest, timeSeconds, updatedAt: new Date() },
    update: { timeSeconds, updatedAt: new Date() },
  })
  revalidatePath("/admin/content/psych-iq")
}
