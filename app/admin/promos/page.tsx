import { PromosClient } from "@/components/admin/promos-client"
import { getPromosAction } from "@/app/actions/promos"

export const metadata = {
  title: "Manage Promo Codes | Admin COBA PNS",
}

export default async function AdminPromosPage() {
  const promos = await getPromosAction()
  return <PromosClient initialPromos={promos} />
}
