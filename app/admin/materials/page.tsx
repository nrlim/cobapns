import { getAllMaterialsAdmin } from "@/app/actions/materials"
import { MaterialsClient } from "@/components/admin/materials-client"

export const metadata = {
  title: "Material CMS – COBA PNS Admin",
}

export default async function AdminMaterialsPage() {
  const materials = await getAllMaterialsAdmin()

  return <MaterialsClient initialMaterials={materials} />
}
