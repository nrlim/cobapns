import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { TestimonialTable } from "./TestimonialTable"
import { MessageSquare, Link as LinkIcon, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Testimonials Management | Admin",
}

export default async function TestimonialManagePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  // We fetch all testimonials because client side will paginate them. 
  // If there are thousands, server-side pagination is better, but this is fine for now.
  const testimonials = await prisma.testimonial.findMany({
    include: {
      user: {
        select: { name: true, email: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const config = await prisma.systemConfig.findUnique({
    where: { id: "global_config" }
  })

  const publicBackdoorEnabled = config?.publicBackdoorEnabled ?? false

  const totalOrganic = testimonials.filter(t => !t.isBackdoor).length
  const totalBackdoor = testimonials.filter(t => t.isBackdoor).length
  const totalPending = testimonials.filter(t => t.status === "PENDING").length

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      {/* Page Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1 lg:mb-2 text-opacity-80">
            Public Relations
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Testimonials
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Review organic student feedback and manage partner testimonials.
          </p>
        </div>
      </div>

      {/* Stats Bento Grid Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total Organic</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalOrganic}</h3>
          </div>
          <div className="p-3 bg-slate-100 rounded-full">
            <MessageSquare className="h-5 w-5 text-slate-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Partner Injected</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalBackdoor}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <LinkIcon className="h-5 w-5 text-brand-blue" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Awaiting Review</p>
            <h3 className="text-2xl font-bold text-amber-600">{totalPending}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-full">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
        </div>
      </div>

      <TestimonialTable 
        initialTestimonials={testimonials} 
        initialBackdoorStatus={publicBackdoorEnabled}
      />
    </div>
  )
}
