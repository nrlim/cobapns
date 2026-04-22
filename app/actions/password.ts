"use server";

import { prisma } from "@/lib/prisma";
import { sendTemplatedEmail } from "@/lib/email";
import { z } from "zod";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const ForgotSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type ForgotResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// ─── STEP 1: Request reset link ────────────────────────────────
export async function forgotPasswordAction(
  _prev: ForgotResult | null,
  formData: FormData
): Promise<ForgotResult> {
  const raw = { email: formData.get("email") as string };
  const parsed = ForgotSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Format email tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // ── Return a neutral message to prevent user enumeration ──────────────────
    // Always return the same success message whether the email exists or not.
    // This prevents attackers from probing which emails are registered.
    if (!user || !user.isActive) {
      return {
        success: true,
        message: "Jika email terdaftar, link reset akan dikirimkan dalam beberapa menit.",
      };
    }

    // ── Delete old tokens for this email ──────────────────────────────────────
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // ── Generate new token (valid for 1 hour) ─────────────────────────────────
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const emailResult = await sendTemplatedEmail({
      templateName: "LUPA_PASSWORD",
      to: email,
      variables: {
        name: user.name,
        reset_link: resetLink,
        expires_in: "1 jam",
        app_name: "COBA PNS",
      },
    });

    if (!emailResult.success) {
      // Rollback token if email failed to send
      await prisma.passwordResetToken.deleteMany({ where: { email } });
      return {
        success: false,
        message: "Gagal mengirim email. Pastikan template 'LUPA_PASSWORD' sudah dikonfigurasi di Settings.",
      };
    }

    // Return neutral message (same as not-found case) to prevent enumeration
    return {
      success: true,
      message: "Jika email terdaftar, link reset akan dikirimkan dalam beberapa menit.",
    };
  } catch {
    return { success: false, message: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

// ─── STEP 2: Reset password using the token ───────────────────
export async function resetPasswordAction(
  _prev: ForgotResult | null,
  formData: FormData
): Promise<ForgotResult> {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = ResetSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Validasi gagal.", errors: parsed.error.flatten().fieldErrors };
  }

  const { token, password } = parsed.data;

  try {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.expiresAt < new Date()) {
      return { success: false, message: "Link reset tidak valid atau sudah kedaluwarsa." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: record.email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return { success: true, message: "Password berhasil diperbarui! Silakan login." };
  } catch {
    return { success: false, message: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
