import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PublicMobileNav } from "@/components/shared/PublicMobileNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-16 pb-16 md:pb-0">{children}</main>
      <PublicMobileNav />
      <Footer />
    </>
  );
}
