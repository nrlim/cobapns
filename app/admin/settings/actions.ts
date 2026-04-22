"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { z } from "zod";
import bcrypt from "bcryptjs";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
}).refine(d => d.currentPassword !== d.newPassword, {
  message: "Password baru tidak boleh sama dengan password lama",
  path: ["newPassword"],
});

export type ChangePasswordResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function changePasswordAction(
  _prev: ChangePasswordResult | null,
  formData: FormData
): Promise<ChangePasswordResult> {
  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = ChangePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal. Periksa kembali inputan.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    // Get session from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("sipns-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return { success: false, message: "Sesi tidak valid. Silakan login kembali." };
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    if (!user) {
      return { success: false, message: "Pengguna tidak ditemukan." };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        message: "Password saat ini tidak sesuai.",
        errors: { currentPassword: ["Password yang kamu masukkan salah."] },
      };
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password berhasil diperbarui!" };
  } catch {
    return { success: false, message: "Terjadi kesalahan server. Coba lagi nanti." };
  }
}
