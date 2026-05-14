import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url;

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=Token verifikasi tidak valid.", baseUrl));
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/login?error=Token verifikasi tidak valid atau sudah digunakan.", baseUrl));
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/login?error=Token verifikasi sudah kedaluwarsa. Silakan daftar ulang.", baseUrl));
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=Pengguna tidak ditemukan.", baseUrl));
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(new URL("/login?verified=1", baseUrl));
  } catch (error) {
    console.error("[verify-email] Error:", error);
    const errBaseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url;
    return NextResponse.redirect(new URL("/login?error=Terjadi kesalahan saat memverifikasi email.", errBaseUrl));
  }
}
