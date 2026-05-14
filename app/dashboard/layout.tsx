import type { Metadata } from "next";

import { getSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { SessionSync } from "@/components/shared/SessionSync";

export const metadata: Metadata = {
  title: "Dashboard | COBA PNS",
  description: "Dashboard belajar COBA PNS — pantau progres belajarmu untuk PNS.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  let needsSync = false;
  if (session && session.role === "STUDENT") {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true, subscriptionEnds: true }
    });
    
    if (user) {
      let effectiveTier = user.subscriptionTier;
      if (effectiveTier !== "FREE" && user.subscriptionEnds && new Date(user.subscriptionEnds) < new Date()) {
        effectiveTier = "FREE";
      }
      if (effectiveTier !== session.tier) {
        needsSync = true;
      }
    }
  }

  return (
    <>
      {needsSync && <SessionSync />}
      {children}
    </>
  );
}
