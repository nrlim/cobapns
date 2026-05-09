import { getAllArticlesAdmin } from "@/app/actions/articles"
import { ArticlesAdminClient } from "@/components/admin/ArticlesAdminClient"

export const metadata = {
  title: "Artikel / Blog – COBA PNS Admin",
}

export default async function AdminArticlesPage() {
  const articles = await getAllArticlesAdmin()
  return <ArticlesAdminClient initialArticles={articles} />
}
