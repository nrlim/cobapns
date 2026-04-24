"use server"

import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function submitPublicTestimonial(formData: FormData) {
  // Verify backdoor is still enabled to prevent abuse
  const config = await prisma.systemConfig.findUnique({
    where: { id: "global_config" }
  })

  if (!config?.publicBackdoorEnabled) {
    throw new Error("Form is closed.")
  }

  const guestName = formData.get("guestName") as string
  const guestRole = formData.get("guestRole") as string
  const rating = parseInt(formData.get("rating") as string) || 5
  const content = formData.get("content") as string
  const tagsStr = formData.get("tags") as string
  const tags = JSON.parse(tagsStr || "[]")

  let guestAvatar = null

  const file = formData.get("guestAvatar") as File | null
  if (file && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 2MB.")
    if (!file.type.startsWith("image/")) throw new Error("Hanya format gambar yang diperbolehkan.")

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const ext = file.name.split(".").pop() || "png"
    const fileName = `avatar.${ext}`
    
    // Group base on folder masing masing usernya (untuk guest, generate random ID)
    const guestId = `guest-${Date.now()}`
    
    const baseDir = process.env.NODE_ENV === "production" 
      ? "/var/www/cobapns-com/public/uploads"
      : path.join(process.cwd(), "public", "uploads")
      
    const guestDir = path.join(baseDir, guestId)
    
    await fs.mkdir(guestDir, { recursive: true })
    const filePath = path.join(guestDir, fileName)
    await fs.writeFile(filePath, buffer)
    
    guestAvatar = `/uploads/${guestId}/${fileName}`
  }

  await prisma.testimonial.create({
    data: {
      guestName,
      guestRole,
      guestAvatar,
      rating,
      content,
      tags,
      isBackdoor: true,
      status: "APPROVED" // Because they are invited partners
    }
  })

  return { success: true }
}
