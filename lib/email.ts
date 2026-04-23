import { Resend } from "resend";
import { prisma } from "./prisma";

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: RESEND_API_KEY environment variable is not set.")
}

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_dev_placeholder");

// In production, replace with a custom verified domain in Resend
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "COBA PNS Admin <onboarding@resend.dev>";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

import nodemailer from "nodemailer";

/**
 * Send an email using SMTP Relay if configured, fallback to Resend.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  try {
    // Check SMTP config from DB
    const smtpSettings = await prisma.systemSetting.findMany({
      where: { key: { in: ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"] } }
    });

    const smtpConfig: Record<string, string> = {};
    for (const s of smtpSettings) {
      smtpConfig[s.key] = s.value;
    }

    if (smtpConfig.smtpHost && smtpConfig.smtpPort && smtpConfig.smtpUser && smtpConfig.smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.smtpHost,
        port: parseInt(smtpConfig.smtpPort, 10),
        secure: parseInt(smtpConfig.smtpPort, 10) === 465, // true for 465, false for other ports
        auth: {
          user: smtpConfig.smtpUser,
          pass: smtpConfig.smtpPass,
        },
        // Jika koneksi lokal (127.0.0.1), jangan paksa TLS karena jaringan lokal sudah aman 
        // dan localhost tidak bisa memiliki SSL valid. Jika eksternal, tetap verifikasi SSL dengan ketat.
        ignoreTLS: smtpConfig.smtpHost === "127.0.0.1" || smtpConfig.smtpHost === "localhost"
      });

      const info = await transporter.sendMail({
        from: smtpConfig.smtpFrom || "noreply@cobapns.com",
        to,
        subject,
        text: text || "",
        html: html || "",
      });

      return { success: true, data: info };
    }

    // Fallback to Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: html || "",
      text: text || "",
    });

    if (error) {
      // Log only the error name to avoid leaking API response details
      console.error("[email] Resend API error:", error.name);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[email] Failed to send email:", error);
    return { success: false, error: "Failed to send email" };
  }
}



/**
 * Send a dynamic email using a template stored in the EmailTemplate table.
 * Variables in the template use {variable_name} syntax.
 */
export async function sendTemplatedEmail({
  templateName,
  to,
  variables = {}
}: {
  templateName: string;
  to: string | string[];
  variables?: Record<string, string>;
}) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { name: templateName }
    });

    if (!template) {
      // Log only the template name — not user data
      console.error(`[email] Template not found: ${templateName}`);
      return { success: false, error: "Template not found" };
    }

    let html = template.htmlBody;
    let subject = template.subject;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\s*${key}\\s*\\}`, 'g');
      html = html.replace(regex, value);
      subject = subject.replace(regex, value);
    }

    return sendEmail({ to, subject, html });
  } catch {
    return { success: false, error: "Failed to compile or send templated email" };
  }
}
