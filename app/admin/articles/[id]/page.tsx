import { getArticleById } from "@/app/actions/articles"
import { ArticleFormClient } from "@/components/admin/ArticleFormClient"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: "Edit Artikel – COBA PNS Admin",
}

export default async function AdminArticleEditPage({ params }: Props) {
  const { id } = await params
  const article = await getArticleById(id)
  if (!article) notFound()

  return <ArticleFormClient article={article} />
}
