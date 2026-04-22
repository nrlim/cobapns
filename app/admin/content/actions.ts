"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { QuestionCategory, QuestionDifficulty } from "@prisma/client"
import { requireAdmin, handleAuthError } from "@/lib/auth-guard"

const QuestionSchema = z.object({
  id: z.string().cuid().optional(),
  category: z.nativeEnum(QuestionCategory),
  subCategory: z.string().min(1).max(100),
  difficulty: z.nativeEnum(QuestionDifficulty),
  content: z.string().min(1).max(10_000),
  explanation: z.string().max(5_000),
  options: z.array(z.object({
    id: z.string().cuid().optional(),
    text: z.string().min(1).max(2_000),
    score: z.number().int().min(0).max(5),
  })).min(2, "Minimal 2 pilihan jawaban").max(10),
})

export async function upsertQuestion(payload: z.infer<typeof QuestionSchema>) {
  try {
    await requireAdmin()
    const data = QuestionSchema.parse(payload)

    if (data.id) {
      await prisma.question.update({
        where: { id: data.id },
        data: {
          category: data.category,
          subCategory: data.subCategory,
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
      await prisma.question.create({
        data: {
          category: data.category,
          subCategory: data.subCategory,
          difficulty: data.difficulty,
          content: data.content,
          explanation: data.explanation,
          options: {
            create: data.options.map((opt) => ({ text: opt.text, score: opt.score })),
          },
        },
      })
    }

    revalidatePath("/admin/content/questions")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menyimpan soal" }
  }
}

export async function deleteQuestion(id: string) {
  try {
    await requireAdmin()
    if (!id) return { success: false, error: "ID tidak valid" }
    await prisma.question.delete({ where: { id } })
    revalidatePath("/admin/content/questions")
    return { success: true }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Gagal menghapus soal" }
  }
}

export async function bulkUploadQuestions(payload: z.infer<typeof QuestionSchema>[]) {
  try {
    await requireAdmin()
    const data = z.array(QuestionSchema).max(500, "Maksimal 500 soal per upload").parse(payload)

    // Use a transaction so partial failures roll back cleanly
    await prisma.$transaction(
      data.map((q) =>
        prisma.question.create({
          data: {
            category: q.category,
            subCategory: q.subCategory,
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

    revalidatePath("/admin/content/questions")
    return { success: true, count: data.length }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN")) {
      return handleAuthError(err)
    }
    return { success: false, error: "Format data atau proses upload gagal" }
  }
}
