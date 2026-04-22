import { Resend } from "resend";

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

/**
 * Send an email using Resend.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  try {
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
  } catch {
    return { success: false, error: "Failed to send email" };
  }
}

import { prisma } from "./prisma";

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
