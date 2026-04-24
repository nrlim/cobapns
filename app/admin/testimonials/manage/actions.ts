"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/session"
import { cookies } from "next/headers"

async function checkAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  if (!token) throw new Error("Unauthorized")
  const session = await verifySession(token)
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function togglePublicBackdoor(enabled: boolean) {
  await checkAdmin()
  await prisma.systemConfig.upsert({
    where: { id: "global_config" },
    update: { publicBackdoorEnabled: enabled },
    create: { id: "global_config", publicBackdoorEnabled: enabled }
  })
  revalidatePath("/admin/testimonials/manage")
  revalidatePath("/testimonials/submit")
}

export async function updateTestimonialStatus(id: string, status: "APPROVED" | "REJECTED" | "PENDING") {
  await checkAdmin()
  await prisma.testimonial.update({
    where: { id },
    data: { status }
  })
  revalidatePath("/")
  revalidatePath("/admin/testimonials/manage")
}

export async function searchUsers(query: string) {
  await checkAdmin()
  if (!query || query.length < 3) return []
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } }
      ]
    },
    select: { id: true, name: true, email: true, avatarUrl: true },
    take: 5
  })
}

export async function createBackdoorTestimonial(userId: string, rating: number, content: string, tags: string[]) {
  await checkAdmin()
  await prisma.testimonial.create({
    data: {
      userId,
      rating,
      content,
      tags,
      isBackdoor: true,
      status: "APPROVED"
    }
  })
  revalidatePath("/")
  revalidatePath("/admin/testimonials/manage")
}

export async function deleteTestimonial(id: string) {
  await checkAdmin()
  await prisma.testimonial.delete({
    where: { id }
  })
  revalidatePath("/")
  revalidatePath("/admin/testimonials/manage")
}
