"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const SMTP_KEYS = ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"];

export async function getSmtpSettings() {
  await requireAdmin();
  
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: SMTP_KEYS } },
  });

  const settingsMap: Record<string, string> = {
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
  };

  for (const row of rows) {
    if (SMTP_KEYS.includes(row.key)) {
      settingsMap[row.key] = row.value;
    }
  }

  return settingsMap;
}

export async function updateSmtpSettings(data: Record<string, string>) {
  await requireAdmin();

  const safeEntries: [string, string][] = [];
  for (const [key, value] of Object.entries(data)) {
    if (!SMTP_KEYS.includes(key)) continue;
    safeEntries.push([key, value || ""]);
  }

  const operations = safeEntries.map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );

  await prisma.$transaction(operations);

  revalidatePath("/admin/settings/smtp");
  return { success: true };
}
