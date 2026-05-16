"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { SKBCategory, QuestionDifficulty, Prisma } from "@prisma/client"
import { requireAdmin, handleAuthError } from "@/lib/auth-guard"

const SKBOptionSchema = z.object({
  id: z.string().cuid().optional(),
  text: z.string().min(1).max(2_000),
  score: z.number().int().min(0).max(5),
})

const SKBQuestionSchema = z.object({
  id: z.string().cuid().optional(),
  category: z.nativeEnum(SKBCategory),
  subCategory: z.string().min(1).max(200),
  bidang: z.string().min(1).max(200),
  difficulty: z.nativeEnum(QuestionDifficulty),
  content: z.string().min(1).max(10_000),
  explanation: z.string().max(5_000),
  options: z
    .array(SKBOptionSchema)
    .min(2, "Minimal 2 pilihan jawaban")
    .max(10),
})

export type SKBQuestionPayload = z.infer<typeof SKBQuestionSchema>

export async function upsertSKBQuestion(payload: SKBQuestionPayload) {
  try {
    await requireAdmin()
    const data = SKBQuestionSchema.parse(payload)

    if (data.id) {
      await prisma.sKBQuestion.update({
        where: { id: data.id },
        data: {
          category: data.category,
          subCategory: data.subCategory,
          bidang: data.bidang,
          difficulty: data.difficulty,
          content: data.content,
          explanation: data.explanation,
          options: {
            deleteMany: {},
            create: data.options.map((opt) => ({ text: opt.text, score: opt.score })),
          },
        },
      })
    } else {
      await prisma.sKBQuestion.create({
        data: {
          category: data.category,
          subCategory: data.subCategory,
          bidang: data.bidang,
          difficulty: data.difficulty,
          content: data.content,
          explanation: data.explanation,
          options: {
            create: data.options.map((opt) => ({ text: opt.text, score: opt.score })),
          },
        },
      })
    }

    revalidatePath("/admin/content/skb-questions")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    console.error("[upsertSKBQuestion]", err)
    return { success: false, error: "Gagal menyimpan soal SKB" }
  }
}

export async function deleteSKBQuestion(id: string) {
  try {
    await requireAdmin()
    if (!id) return { success: false, error: "ID tidak valid" }
    await prisma.sKBQuestion.delete({ where: { id } })
    revalidatePath("/admin/content/skb-questions")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menghapus soal SKB" }
  }
}

const DeleteAllSKBQuestionsSchema = z.object({
  confirmText: z.literal("HAPUS"),
  category: z.nativeEnum(SKBCategory).optional(),
  bidang: z.string().min(1).max(200).optional(),
  difficulty: z.nativeEnum(QuestionDifficulty).optional(),
  search: z.string().max(200).optional(),
})

export async function deleteAllSKBQuestions(payload: z.infer<typeof DeleteAllSKBQuestionsSchema>) {
  try {
    await requireAdmin()
    const data = DeleteAllSKBQuestionsSchema.parse(payload)

    const where: Prisma.SKBQuestionWhereInput = {}
    if (data.category) where.category = data.category
    if (data.bidang) where.bidang = data.bidang
    if (data.difficulty) where.difficulty = data.difficulty
    if (data.search?.trim()) {
      const query = data.search.trim()
      where.OR = [
        { content: { contains: query, mode: "insensitive" } },
        { explanation: { contains: query, mode: "insensitive" } },
        { subCategory: { contains: query, mode: "insensitive" } },
        { bidang: { contains: query, mode: "insensitive" } },
      ]
    }

    const deleted = await prisma.sKBQuestion.deleteMany({ where })
    revalidatePath("/admin/content/skb-questions")
    revalidatePath("/admin/content/skb-exams")
    return { success: true, count: deleted.count }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    console.error("[deleteAllSKBQuestions]", err)
    return { success: false, error: "Gagal menghapus daftar soal SKB" }
  }
}

export async function bulkUploadSKBQuestions(payload: SKBQuestionPayload[]) {
  try {
    await requireAdmin()
    const data = z.array(SKBQuestionSchema).max(500, "Maksimal 500 soal per upload").parse(payload)

    await prisma.$transaction(
      data.map((q) =>
        prisma.sKBQuestion.create({
          data: {
            category: q.category,
            subCategory: q.subCategory,
            bidang: q.bidang,
            difficulty: q.difficulty,
            content: q.content,
            explanation: q.explanation,
            options: {
              create: q.options.map((opt) => ({ text: opt.text, score: opt.score })),
            },
          },
        })
      )
    )

    revalidatePath("/admin/content/skb-questions")
    return { success: true, count: data.length }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    console.error("[bulkUploadSKBQuestions]", err)
    return { success: false, error: "Format data atau proses upload gagal" }
  }
}
