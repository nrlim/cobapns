"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import fs from "fs/promises"
import path from "path"

export type ActionResult = {
  success: boolean
  message?: string
  error?: string
}

// ── Validation Schemas ────────────────────────────────────────────────────────

const profileSchema = z.object({
  // Strip whitespace, enforce max length to prevent DB abuse
  name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(100, "Nama terlalu panjang."),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^62\d{8,13}$/, "Format WhatsApp tidak valid. Gunakan format 628... (tanpa spasi atau tanda +)."),
  notifEmail: z.boolean(),
  gender: z.string().trim().max(50).optional(),
  profession: z.string().trim().max(200).optional(),
  learningWay: z.string().trim().max(100).optional(),
  learningPref: z.string().trim().max(100).optional(),
  source: z.string().trim().max(100).optional(),
  learningGoal: z.string().trim().max(1000).optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi.").max(256),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter.")
    .max(256, "Password terlalu panjang."),
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  { message: "Password baru tidak boleh sama dengan yang lama.", path: ["newPassword"] }
)

// ── Update Profile ────────────────────────────────────────────────────────────

export async function updateProfileSettings(
  _state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireAuth()

    const parsed = profileSchema.safeParse({
      name:           (formData.get("name")           as string | null) ?? "",
      phoneNumber:    (formData.get("phoneNumber")    as string | null) ?? "",
      // Checkbox only sends "on" when checked; convert explicitly
      notifEmail:     formData.get("notifEmail") === "on",
      gender:         (formData.get("gender") as string | null) ?? "",
      profession:     (formData.get("profession") as string | null) ?? "",
      learningWay:    (formData.get("learningWay") as string | null) ?? "",
      learningPref:   (formData.get("learningPref") as string | null) ?? "",
      source:         (formData.get("source") as string | null) ?? "",
      learningGoal:   (formData.get("learningGoal") as string | null) ?? "",
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    // Only update mutable fields — userId is from the verified session, never from the form
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name:           parsed.data.name,
        phoneNumber:    parsed.data.phoneNumber,
        notifEmail:     parsed.data.notifEmail,
        gender:         parsed.data.gender || null,
        profession:     parsed.data.profession || null,
        learningWay:    parsed.data.learningWay || null,
        learningPref:   parsed.data.learningPref || null,
        source:         parsed.data.source || null,
        learningGoal:   parsed.data.learningGoal || null,
      },
    })

    revalidatePath("/dashboard/settings")
    return { success: true, message: "Profil berhasil diperbarui." }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
    console.error("[updateProfile]", err)
    return { success: false, error: "Gagal menyimpan perubahan. Coba lagi." }
  }
}

// ── Update Password ──────────────────────────────────────────────────────────

export async function updatePassword(
  _state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireAuth()

    const parsed = passwordSchema.safeParse({
      currentPassword: (formData.get("currentPassword") as string | null) ?? "",
      newPassword:     (formData.get("newPassword")     as string | null) ?? "",
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    // Fetch password hash from DB — always by session.userId, never from form input
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { password: true },
    })

    // Guard: user must exist (e.g. not deleted between login and this request)
    if (!user) return { success: false, error: "Akun tidak ditemukan." }

    // Constant-time password comparison via bcrypt (internally timing-safe)
    const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.password)
    if (!isMatch) {
      // Generic message — don't reveal whether the account exists
      return { success: false, error: "Password saat ini salah." }
    }

    // Hash with cost factor 12 (good balance of security vs latency on server)
    const hashedNew = await bcrypt.hash(parsed.data.newPassword, 12)

    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedNew },
    })

    revalidatePath("/dashboard/settings")
    return { success: true, message: "Kata sandi berhasil diubah." }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." }
    console.error("[updatePassword]", err)
    return { success: false, error: "Gagal mengganti password. Coba lagi." }
  }
}

// ── Update Formation ──────────────────────────────────────────────────────────

const formationSchema = z.object({
  targetInstansi: z.string().trim().max(200, "Instansi terlalu panjang.").optional(),
  jabatan: z.string().trim().max(200, "Jabatan terlalu panjang.").optional(),
  jenjang: z.string().trim().max(100).optional(),
  prodi: z.string().trim().max(200, "Prodi terlalu panjang.").optional(),
})

export async function updateFormation(
  _state: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireAuth()
    const parsed = formationSchema.safeParse({
      targetInstansi: (formData.get("targetInstansi") as string | null) ?? "",
      jabatan: (formData.get("jabatan") as string | null) ?? "",
      jenjang: (formData.get("jenjang") as string | null) ?? "",
      prodi: (formData.get("prodi") as string | null) ?? "",
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        targetInstansi: parsed.data.targetInstansi || null,
        jabatan: parsed.data.jabatan || null,
        jenjang: parsed.data.jenjang || null,
        prodi: parsed.data.prodi || null,
      },
    })

    revalidatePath("/dashboard/settings")
    return { success: true, message: "Target formasi berhasil diperbarui." }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return { success: false, error: "Sesi tidak valid." }
    console.error("[updateFormation]", err)
    return { success: false, error: "Gagal menyimpan formasi. Coba lagi." }
  }
}

// ── Get Live User Profile Data ────────────────────────────────────────────────────────

export async function getLiveProfileDataAction(): Promise<{ tier: string; avatarUrl: string | null } | null> {
  try {
    const session = await requireAuth()
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true, subscriptionEnds: true, avatarUrl: true }
    })
    
    if (!dbUser) return null
    
    let tier = dbUser.subscriptionTier || "FREE"
    if (dbUser.subscriptionTier !== "FREE" && dbUser.subscriptionEnds && new Date(dbUser.subscriptionEnds) < new Date()) {
      tier = "FREE"
    }
    
    return { tier, avatarUrl: dbUser.avatarUrl }
  } catch {
    return null // Return null silently for client components
  }
}

// ── Upload Avatar ─────────────────────────────────────────────────────────────

export async function uploadAvatar(formData: FormData): Promise<ActionResult & { url?: string }> {
  try {
    const session = await requireAuth()
    const file = formData.get("avatar") as File | null
    if (!file || file.size === 0) return { success: false, error: "Pilih file gambar terlebih dahulu." }
    
    if (file.size > 2 * 1024 * 1024) return { success: false, error: "Ukuran gambar maksimal 2MB." }
    if (!file.type.startsWith("image/")) return { success: false, error: "Hanya format gambar yang diperbolehkan." }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const ext = file.name.split(".").pop() || "png"
    const fileName = `avatar.${ext}`
    
    // Group base on folder masing masing usernya
    // Diarahkan sesuai path spesifik untuk produksi
    const baseDir = process.env.NODE_ENV === "production" 
      ? "/var/www/cobapns-com/public/uploads"
      : path.join(process.cwd(), "public", "uploads")
      
    const userDir = path.join(baseDir, session.userId)
    
    await fs.mkdir(userDir, { recursive: true })
    const filePath = path.join(userDir, fileName)
    await fs.writeFile(filePath, buffer)
    
    const avatarUrl = `/uploads/${session.userId}/${fileName}?v=${Date.now()}`
    
    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl }
    })
    
    revalidatePath("/dashboard/settings")
    return { success: true, message: "Foto profil berhasil diperbarui.", url: avatarUrl }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED")
      return { success: false, error: "Sesi tidak valid." }
    console.error("[uploadAvatar]", err)
    return { success: false, error: "Gagal mengupload foto profil." }
  }
}


