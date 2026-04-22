"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { QuestionCategory, QuestionDifficulty } from "@prisma/client"
import { MATERIAL_TYPES, MATERIAL_TIERS } from "@/lib/material-constants"
import { requireAdmin, handleAuthError, requireAuth } from "@/lib/auth-guard"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const MaterialSchema = z.object({
  id:          z.string().cuid().optional(),
  title:       z.string().min(2, "Judul minimal 2 karakter").max(200),
  slug:        z.string().min(2, "Slug wajib diisi").max(200).regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan tanda -"),
  category:    z.nativeEnum(QuestionCategory),
  subCategory: z.string().min(1, "Sub kategori wajib diisi").max(100),
  type:        z.enum(MATERIAL_TYPES),
  accessTier:  z.enum(MATERIAL_TIERS),
  difficulty:  z.nativeEnum(QuestionDifficulty),
  content:     z.string().min(1, "Konten tidak boleh kosong").max(100_000),
  videoUrl:    z.string().url("URL video tidak valid").optional().or(z.literal("")),
  pdfUrl:      z.string().url("URL PDF tidak valid").optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
  order:       z.number().int().min(0).max(9999).default(0),
})

export type MaterialFormValues = z.infer<typeof MaterialSchema>

// ─── Admin: Upsert Material ───────────────────────────────────────────────────

export async function upsertMaterial(payload: MaterialFormValues) {
  try {
    await requireAdmin()
    const data = MaterialSchema.parse(payload)

    const saveData = {
      title:       data.title,
      slug:        data.slug,
      category:    data.category,
      subCategory: data.subCategory,
      type:        data.type,
      accessTier:  data.accessTier,
      difficulty:  data.difficulty,
      content:     data.content,
      videoUrl:    data.videoUrl || null,
      pdfUrl:      data.pdfUrl || null,
      isPublished: data.isPublished,
      order:       data.order,
    }

    if (data.id) {
      await prisma.material.update({ where: { id: data.id }, data: saveData })
    } else {
      await prisma.material.create({ data: saveData })
    }

    revalidatePath("/admin/materials")
    revalidatePath("/dashboard/learning")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    // Log non-sensitive operational error for server monitoring
    console.error("[upsertMaterial] DB error")
    return { success: false, error: "Gagal menyimpan materi" }
  }
}

// ─── Admin: Delete Material ───────────────────────────────────────────────────

export async function deleteMaterial(id: string) {
  try {
    await requireAdmin()
    if (!id || typeof id !== "string") return { success: false, error: "ID tidak valid" }
    await prisma.material.delete({ where: { id } })
    revalidatePath("/admin/materials")
    revalidatePath("/dashboard/learning")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menghapus materi" }
  }
}

// ─── Admin: List All Materials ────────────────────────────────────────────────

export async function getAllMaterialsAdmin() {
  await requireAdmin()
  return prisma.material.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      subCategory: true,
      type: true,
      accessTier: true,
      difficulty: true,
      isPublished: true,
      order: true,
      createdAt: true,
      _count: { select: { progress: true } },
    },
  })
}

// ─── Student: Get Materials Grouped by Category ───────────────────────────────

export async function getMaterialsByCategory(userId: string) {
  // Validate userId matches the current session (prevent IDOR)
  const session = await requireAuth()
  if (session.userId !== userId) {
    throw new Error("FORBIDDEN")
  }

  const [materials, progress] = await Promise.all([
    prisma.material.findMany({
      where: { isPublished: true },
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        subCategory: true,
        type: true,
        accessTier: true,
        difficulty: true,
        videoUrl: true,
        pdfUrl: true,
      },
    }),
    prisma.userMaterialProgress.findMany({
      where: { userId },
      select: { materialId: true, completed: true },
    }),
  ])

  const completedSet = new Set(
    progress.filter((p) => p.completed).map((p) => p.materialId)
  )

  const withCompletion = materials.map((m) => ({
    ...m,
    completed: completedSet.has(m.id),
  }))

  const grouped = {
    TWK: withCompletion.filter((m) => m.category === "TWK"),
    TIU: withCompletion.filter((m) => m.category === "TIU"),
    TKP: withCompletion.filter((m) => m.category === "TKP"),
  }

  const masteryPct = (arr: typeof withCompletion) =>
    arr.length > 0 ? Math.round((arr.filter((m) => m.completed).length / arr.length) * 100) : 0

  return {
    grouped,
    masteryTWK: masteryPct(grouped.TWK),
    masteryTIU: masteryPct(grouped.TIU),
    masteryTKP: masteryPct(grouped.TKP),
    totalCompleted: withCompletion.filter((m) => m.completed).length,
    total: withCompletion.length,
  }
}

// ─── Student: Toggle Completion ───────────────────────────────────────────────
// userId is derived from the server-side session — not from client input — to prevent IDOR

export async function toggleMaterialCompletion(materialId: string) {
  try {
    const session = await requireAuth()
    const userId = session.userId

    // Verify the material exists and is published
    const material = await prisma.material.findUnique({
      where: { id: materialId, isPublished: true },
      select: { id: true },
    })
    if (!material) return { success: false, error: "Materi tidak ditemukan" }

    const existing = await prisma.userMaterialProgress.findUnique({
      where: { userId_materialId: { userId, materialId } },
    })

    const completed = !existing?.completed

    await prisma.userMaterialProgress.upsert({
      where: { userId_materialId: { userId, materialId } },
      create: { userId, materialId, completed, completedAt: completed ? new Date() : null },
      update: { completed, completedAt: completed ? new Date() : null },
    })

    revalidatePath("/dashboard/learning")
    return { success: true, completed }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    console.error("[toggleMaterialCompletion] DB error")
    return { success: false, error: "Gagal update progress" }
  }
}
