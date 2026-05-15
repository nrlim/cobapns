"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { unstable_cache } from "next/cache"
import { LookupType } from "@prisma/client"
import { z } from "zod"

const LookupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama tidak boleh kosong"),
  type: z.enum(["INSTANCE", "POSITION", "EDUCATION", "MAJOR"]),
  isActive: z.boolean().default(true),
})

export const getLookupsByType = unstable_cache(
  async (type: LookupType) => {
    return await prisma.lookup.findMany({
      where: { type, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      }
    })
  },
  ["lookups-by-type"],
  {
    tags: ["lookups"],
    revalidate: 3600 // Cache for 1 hour, or revalidated via tag
  }
)

export async function getLookupsAdmin() {
  return await prisma.lookup.findMany({
    orderBy: [
      { type: "asc" },
      { name: "asc" }
    ]
  })
}

interface GetLookupsParams {
  type: LookupType;
  page: number;
  limit: number;
  search?: string;
}

export async function getLookupsPaginated({ type, page, limit, search }: GetLookupsParams) {
  const where: any = { type };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  
  const [data, total] = await Promise.all([
    prisma.lookup.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lookup.count({ where })
  ]);
  
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLookupStats() {
  const stats = await prisma.lookup.groupBy({
    by: ["type"],
    _count: { id: true },
  });
  
  const totalInstance = stats.find(s => s.type === "INSTANCE")?._count.id || 0;
  const totalPosition = stats.find(s => s.type === "POSITION")?._count.id || 0;
  const totalEducation = stats.find(s => s.type === "EDUCATION")?._count.id || 0;
  const totalMajor = stats.find(s => s.type === "MAJOR")?._count.id || 0;
  
  return {
    totalInstance,
    totalPosition,
    totalOthers: totalEducation + totalMajor
  };
}

export async function createLookup(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as LookupType,
    }
    
    const validated = LookupSchema.parse(data)
    
    await prisma.lookup.create({
      data: {
        name: validated.name,
        type: validated.type,
      }
    })
    
    revalidatePath("/admin/settings/lookups")
    revalidatePath("/dashboard/settings") // or wherever student settings is
    
    return { success: true, message: "Lookup berhasil ditambahkan" }
  } catch (error: any) {
    return { error: error.message || "Gagal menambahkan lookup" }
  }
}

export async function importBulkLookups(type: LookupType, names: string[]) {
  try {
    if (!names.length) return { error: "Tidak ada data untuk diimport" }
    
    // Filter out empties
    const validNames = names.map(n => n.trim()).filter(n => n.length > 0)
    
    if (!validNames.length) return { error: "File CSV kosong atau format tidak valid" }
    
    // Get existing to avoid duplicates conditionally, or just use createMany with skipDuplicates.
    // skipDuplicates works if there's a unique constraint, but we don't have a unique constraint on (name, type).
    // So we'll fetch existing names for the type:
    const existing = await prisma.lookup.findMany({ where: { type }, select: { name: true } })
    const existingSet = new Set(existing.map(e => e.name.toLowerCase()))
    
    const newRecords = validNames
      .filter(name => !existingSet.has(name.toLowerCase()))
      .map(name => ({ name, type }))
      
    if (!newRecords.length) {
      return { error: "Semua data dari CSV sudah ada di database" }
    }
    
    await prisma.lookup.createMany({
      data: newRecords
    })
    
    revalidatePath("/admin/settings/lookups")
    revalidatePath("/dashboard/settings")
    
    return { success: true, message: `Berhasil import ${newRecords.length} data baru` }
  } catch (error: any) {
    return { error: error.message || "Gagal mengimport data" }
  }
}

export async function updateLookup(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    
    if (!name) throw new Error("Nama tidak boleh kosong")
    
    await prisma.lookup.update({
      where: { id },
      data: { name }
    })
    
    revalidatePath("/admin/settings/lookups")
    revalidatePath("/dashboard/settings")
    
    return { success: true, message: "Lookup berhasil diperbarui" }
  } catch (error: any) {
    return { error: error.message || "Gagal memperbarui lookup" }
  }
}

export async function deleteLookup(id: string) {
  try {
    // In a real app, you'd check foreign keys before deleting.
    // For now, depending on your Prisma setup, this might throw if constrained.
    await prisma.lookup.delete({
      where: { id }
    })
    
    revalidatePath("/admin/settings/lookups")
    revalidatePath("/dashboard/settings")
    
    return { success: true, message: "Lookup berhasil dihapus" }
  } catch (error: any) {
    // Basic catch if there is a constraint violation
    if (error.code === 'P2003') {
      return { error: "Gagal menghapus: Data ini sedang digunakan oleh pengguna" }
    }
    return { error: error.message || "Gagal menghapus lookup" }
  }
}

export async function exportLookupsByType(type: LookupType) {
  try {
    const data = await prisma.lookup.findMany({
      where: { type },
      orderBy: { name: "asc" },
      select: { name: true }
    });
    return { success: true, data: data.map(d => d.name) };
  } catch (error: any) {
    return { error: "Gagal mengekspor data" };
  }
}
