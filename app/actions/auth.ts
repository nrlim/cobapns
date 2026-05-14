"use server";

import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email";

// ─────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().min(9, "Nomor telepon tidak valid").optional().or(z.literal("")),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"]
});

const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// ─────────────────────────────────────────────────────────────
// Helper: Set auth cookie
// ─────────────────────────────────────────────────────────────
async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("sipns-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour — matches JWT expiry
    path: "/",
  });
}

// ─────────────────────────────────────────────────────────────
// REGISTER ACTION
// ─────────────────────────────────────────────────────────────
export async function registerAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Optional plan intent carried from landing page
  const planIntent = (formData.get("plan") as string | null)?.toUpperCase() ?? null;
  const durIntent  = (formData.get("dur") as string | null) ?? "1";
  const validPlans = ["ELITE", "MASTER"];
  const safePlan = planIntent && validPlans.includes(planIntent) ? planIntent : null;
  const safeDur  = durIntent === "12" ? "12" : "1";

  // Validate
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal. Periksa kembali inputanmu.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phoneNumber, password } = parsed.data;

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        success: false,
        message: "Email sudah terdaftar. Silakan login.",
        errors: { email: ["Email ini sudah digunakan."] },
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: "STUDENT",
        subscriptionTier: "FREE",
      },
    });

    // Create verification token
    const tokenStr = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token: tokenStr,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, tokenStr, user.name);

    return {
      success: true,
      message: "Pendaftaran berhasil! Kami telah mengirimkan email verifikasi. Silakan periksa inbox atau folder spam Anda untuk mengaktifkan akun.",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Terjadi kesalahan server. Coba lagi nanti.",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// LOGIN ACTION
// ─────────────────────────────────────────────────────────────
export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Optional plan intent carried from landing page
  const planIntent = (formData.get("plan") as string | null)?.toUpperCase() ?? null;
  const durIntent  = (formData.get("dur") as string | null) ?? "1";
  const validPlans = ["ELITE", "MASTER"];
  const safePlan = planIntent && validPlans.includes(planIntent) ? planIntent : null;
  const safeDur  = durIntent === "12" ? "12" : "1";

  // Validate
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;
  let role: "ADMIN" | "STUDENT" = "STUDENT";

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success: false,
        message: "Email atau password salah.",
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return {
        success: false,
        message: "Email atau password salah.",
      };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        success: false,
        message: "Akun Anda belum diverifikasi. Silakan periksa email Anda untuk memverifikasi akun.",
      };
    }

    // Check if account is banned/inactive
    if (user.isActive === false) {
      return {
        success: false,
        message: "Akun Anda telah dinonaktifkan oleh Admin. Silakan hubungi dukungan.",
      };
    }

    role = user.role;

    // Create JWT session
    const token = await signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tier: user.subscriptionTier as "FREE" | "ELITE" | "MASTER",
    });

    await setAuthCookie(token);
  } catch {
    return {
      success: false,
      message: "Terjadi kesalahan server. Coba lagi nanti.",
    };
  }

  // ✅ Role-based redirect (outside try/catch)
  if (role === "ADMIN") {
    redirect("/admin");
  } else if (safePlan) {
    redirect(`/dashboard/pembelian?plan=${safePlan.toLowerCase()}&dur=${safeDur}`);
  } else {
    redirect("/dashboard");
  }
}

// ─────────────────────────────────────────────────────────────
// LOGOUT ACTION
// ─────────────────────────────────────────────────────────────
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("sipns-session");
  redirect("/login");
}
