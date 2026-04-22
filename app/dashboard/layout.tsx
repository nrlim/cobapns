import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | COBA PNS",
  description: "Dashboard belajar COBA PNS — pantau progres belajarmu untuk CPNS.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
