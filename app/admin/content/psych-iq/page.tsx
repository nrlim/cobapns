// app/admin/content/psych-iq/page.tsx
import { prisma } from "@/lib/prisma"
import { PsychIQCMSClient } from "./client"

export const metadata = {
  title: "Psikotes & IQ CMS – COBA PNS Admin",
  description: "Kelola bank soal Psikotes dan Tes IQ.",
}

export default async function PsychIQCMSPage(props: {
  searchParams?: Promise<{ tab?: string; subtest?: string; search?: string; page?: string }>
}) {
  const sp      = await props.searchParams ?? {}
  const tab     = sp.tab === "iq" ? "iq" : "psych"
  const subtest = (sp.subtest ?? "VERBAL").toUpperCase() as "VERBAL" | "NUMERIC" | "LOGIC" | "SPATIAL"
  const search  = sp.search ?? ""
  const page    = Math.max(1, Number(sp.page) || 1)
  const limit   = 20

  if (tab === "psych") {
    const where: any = {}
    if (search) where.text = { contains: search, mode: "insensitive" }

    const [questions, total] = await Promise.all([
      prisma.psychQuestion.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.psychQuestion.count({ where }),
    ])

    return (
      <PsychIQCMSClient
        tab="psych"
        psychData={{ questions, total, page, totalPages: Math.ceil(total / limit) }}
        iqData={null}
        configs={[]}
      />
    )
  } else {
    const validSubtest: ("VERBAL" | "NUMERIC" | "LOGIC" | "SPATIAL")[] = ["VERBAL", "NUMERIC", "LOGIC", "SPATIAL"]
    const safeSub = validSubtest.includes(subtest) ? subtest : "VERBAL"
    const where: any = { subTest: safeSub }
    if (search) where.text = { contains: search, mode: "insensitive" }

    const [questions, total, configs] = await Promise.all([
      prisma.iQQuestion.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.iQQuestion.count({ where }),
      prisma.iQSubTestConfig.findMany(),
    ])

    // Count per subtest
    const counts = await prisma.iQQuestion.groupBy({
      by: ["subTest"],
      _count: { _all: true },
    })

    return (
      <PsychIQCMSClient
        tab="iq"
        psychData={null}
        iqData={{ questions: questions as any, total, page, totalPages: Math.ceil(total / limit), subtest: safeSub, counts }}
        configs={configs}
      />
    )
  }
}
