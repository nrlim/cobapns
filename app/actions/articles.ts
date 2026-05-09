"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth-guard"

// ─── Validation Schema ─────────────────────────────────────────────────────────

const ArticleSchema = z.object({
  id:              z.string().cuid().optional(),
  title:           z.string().min(3, "Judul minimal 3 karakter").max(200),
  slug:            z.string().min(2, "Slug wajib diisi").max(200)
                    .regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan tanda -"),
  excerpt:         z.string().max(500).optional().or(z.literal("")),
  content:         z.string().min(1, "Konten tidak boleh kosong"),
  coverImage:      z.string().url("URL cover tidak valid").optional().or(z.literal("")),
  category:        z.string().max(100).optional().or(z.literal("")),
  tags:            z.array(z.string()).default([]),
  status:          z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  // SEO fields
  metaTitle:       z.string().max(60).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  metaKeywords:    z.string().max(300).optional().or(z.literal("")),
  ogImage:         z.string().url("URL OG image tidak valid").optional().or(z.literal("")),
  canonicalUrl:    z.string().url("Canonical URL tidak valid").optional().or(z.literal("")),
})

export type ArticleFormValues = z.infer<typeof ArticleSchema>

// ─── Upsert Article (Admin) ────────────────────────────────────────────────────

export async function upsertArticle(payload: ArticleFormValues) {
  try {
    await requireAdmin()
    const data = ArticleSchema.parse(payload)

    const saveData = {
      title:           data.title,
      slug:            data.slug,
      excerpt:         data.excerpt || null,
      content:         data.content,
      coverImage:      data.coverImage || null,
      category:        data.category || null,
      tags:            data.tags,
      status:          data.status,
      metaTitle:       data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      metaKeywords:    data.metaKeywords || null,
      ogImage:         data.ogImage || null,
      canonicalUrl:    data.canonicalUrl || null,
      publishedAt:     data.status === "PUBLISHED" ? new Date() : null,
    }

    if (data.id) {
      await prisma.article.update({ where: { id: data.id }, data: saveData })
    } else {
      await prisma.article.create({ data: saveData })
    }

    revalidatePath("/admin/articles")
    revalidatePath("/artikel")
    revalidatePath("/sitemap.xml")
    return { success: true }
  } catch (err) {
    console.error("[upsertArticle] error:", err)
    return { success: false, error: "Gagal menyimpan artikel" }
  }
}

// ─── Delete Article (Admin) ────────────────────────────────────────────────────

export async function deleteArticle(id: string) {
  try {
    await requireAdmin()
    await prisma.article.delete({ where: { id } })
    revalidatePath("/admin/articles")
    revalidatePath("/artikel")
    revalidatePath("/sitemap.xml")
    return { success: true }
  } catch (err) {
    console.error("[deleteArticle] error:", err)
    return { success: false, error: "Gagal menghapus artikel" }
  }
}

// ─── Get All Articles (Admin) ─────────────────────────────────────────────────

export async function getAllArticlesAdmin() {
  await requireAdmin()
  return prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:          true,
      title:       true,
      slug:        true,
      category:    true,
      status:      true,
      publishedAt: true,
      createdAt:   true,
      tags:        true,
    },
  })
}

// ─── Get Published Articles (Public) ─────────────────────────────────────────

export async function getPublishedArticles(params?: {
  category?: string
  tag?: string
  search?: string
  take?: number
  skip?: number
}) {
  const { category, tag, search, take = 12, skip = 0 } = params ?? {}

  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ]
      } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: {
      id:          true,
      title:       true,
      slug:        true,
      excerpt:     true,
      coverImage:  true,
      category:    true,
      tags:        true,
      publishedAt: true,
    },
  })
}

// ─── Get Article by Slug (Public) ────────────────────────────────────────────

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
  })
}

// ─── Get Article by ID (Admin) ───────────────────────────────────────────────

export async function getArticleById(id: string) {
  await requireAdmin()
  return prisma.article.findUnique({ where: { id } })
}

// ─── Get All Published Articles for Sitemap ──────────────────────────────────

export async function getAllPublishedArticlesForSitemap() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })
}
