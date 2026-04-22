"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama template wajib diisi"),
  subject: z.string().min(3, "Subjek email wajib diisi"),
  htmlBody: z.string().min(5, "Konten HTML wajib diisi"),
  description: z.string().optional(),
})

export async function upsertEmailTemplate(data: unknown) {
  try {
    const parsed = templateSchema.parse(data)

    if (parsed.id) {
      await prisma.emailTemplate.update({
        where: { id: parsed.id },
        data: {
          name: parsed.name,
          subject: parsed.subject,
          htmlBody: parsed.htmlBody,
          description: parsed.description,
        }
      })
    } else {
      await prisma.emailTemplate.create({
        data: {
          name: parsed.name,
          subject: parsed.subject,
          htmlBody: parsed.htmlBody,
          description: parsed.description || "",
        }
      })
    }

    revalidatePath("/admin/settings/email")
    return { success: true }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    // Prisma unique constraint catch
    if (error.code === 'P2002') {
      return { success: false, error: "Nama template ini sudah digunakan. Pilih nama lain." }
    }
    return { success: false, error: "Gagal menyimpan template email." }
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    await prisma.emailTemplate.delete({ where: { id } })
    revalidatePath("/admin/settings/email")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Gagal menghapus template." }
  }
}
