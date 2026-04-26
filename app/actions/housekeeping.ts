"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"

/**
 * Deletes payment logs older than the specified number of days
 * and backups the deleted records to a text file.
 */
export async function cleanupPaymentLogs(daysOld = 30) {
  await requireAdmin()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  try {
    // 1. Fetch the logs that are about to be deleted
    const logsToDelete = await prisma.paymentLog.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      orderBy: { createdAt: "asc" }
    })

    if (logsToDelete.length === 0) {
      return { success: true, count: 0, message: "Tidak ada log yang perlu dibersihkan." }
    }

    // 2. Format the logs into a readable text format
    const lines = logsToDelete.map(log => {
      return `[${log.createdAt.toISOString()}] EVENT: ${log.event} | STATUS: ${log.status} | ORDER_ID: ${log.orderId || "N/A"} | PAYLOAD: ${log.payload ? JSON.stringify(log.payload) : "N/A"}`
    })
    const backupContent = lines.join("\n")

    // 3. Ensure the public/logs directory exists
    const logsDir = path.join(process.cwd(), "public", "logs")
    await fs.mkdir(logsDir, { recursive: true })

    // 4. Write the backup to a text file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileName = `payment_logs_backup_${timestamp}.txt`
    const filePath = path.join(logsDir, fileName)
    await fs.writeFile(filePath, backupContent, "utf8")

    // 5. Delete the logs from the database
    const result = await prisma.paymentLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    
    revalidatePath("/admin/payment-logs")
    return { success: true, count: result.count, backupFile: fileName }
  } catch (err: any) {
    console.error("[Housekeeping] error:", err)
    return { success: false, error: err.message || "Gagal membersihkan log." }
  }
}
