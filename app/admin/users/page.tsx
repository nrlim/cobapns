import React from "react"
import { Users, Crown, UserPlus } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { UsersTable } from "@/components/admin/users-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Manajemen Pengguna - COBA PNS Admin",
  description: "Kelola akses, langganan, dan status akun peserta COBA PNS.",
}

export default async function UsersManagementPage() {
  // Fetch users data
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  // Calculate metrics
  const totalUsers = users.length
  
  // Count paid-tier subscribers (ELITE or MASTER)
  const activeSubscribers = users.filter(
    (u) => u.subscriptionTier === "ELITE" || u.subscriptionTier === "MASTER"
  ).length

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const newSignups = users.filter((u) => u.createdAt > oneDayAgo).length

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      {/* Page Hero / Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1 lg:mb-2 text-opacity-80">Institutional Base</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Manajemen Pengguna</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Kelola akses, langganan, dan status akun peserta COBA PNS.</p>
        </div>
      </div>

      {/* Stats Bento Grid Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-slate-200 shadow-sm ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 ">
              Total Pengguna
            </CardTitle>
            <div className="p-2 bg-slate-100  rounded-full">
              <Users className="h-4 w-4 text-slate-600 " />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 ">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh akun terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm  relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Crown className="w-24 h-24 text-teal-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 ">
              Active Subscribers
            </CardTitle>
            <div className="p-2 bg-teal-50  rounded-full">
              <Crown className="h-4 w-4 text-teal-600 " />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 ">{activeSubscribers}</div>
            <p className="text-xs text-slate-500 mt-1">
              Pengguna <span className="font-medium text-teal-600 ">Elite</span> & <span className="font-medium text-indigo-600 ">Master</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 ">
              Pengguna Baru
            </CardTitle>
            <div className="p-2 bg-emerald-50  rounded-full">
              <UserPlus className="h-4 w-4 text-emerald-600 " />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 ">+{newSignups}</div>
            <p className="text-xs text-slate-500 mt-1">
              Dalam 24 jam terakhir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable Section */}
      <div className="mt-8">
        <UsersTable data={users} />
      </div>
    </div>
  )
}
