import Link from "next/link";
import { Instagram } from "lucide-react";

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.32 6.32 6.32 0 0 0 6.2-6.36V7.95a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2.65-.38z"/>
    </svg>
  );
}
import { getSettings } from "@/app/actions/settings";

export async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="w-full py-12 border-t border-outline-variant/10 bg-surface">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="text-lg font-bold text-on-surface mb-2">COBA PNS</div>
          <div className="font-sans text-xs uppercase tracking-widest text-on-surface-variant text-center md:text-left">
            © {new Date().getFullYear()} COBA PNS. Menuju Masa Depan Abdi Negara.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-sans text-xs uppercase tracking-widest text-on-surface-variant">
          <Link className="hover:text-teal-700 dark:hover:text-teal-300 underline transition-all opacity-80 hover:opacity-100" href="/#tentang">Tentang Kami</Link>
          <Link className="hover:text-teal-700 dark:hover:text-teal-300 underline transition-all opacity-80 hover:opacity-100" href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link className="hover:text-teal-700 dark:hover:text-teal-300 underline transition-all opacity-80 hover:opacity-100" href="/syarat-dan-ketentuan">Syarat &amp; Ketentuan</Link>
          <Link className="hover:text-teal-700 dark:hover:text-teal-300 underline transition-all opacity-80 hover:opacity-100" href="/#kontak">Kontak</Link>
        </div>
        <div className="flex gap-4">
          <a href={settings.socialInstagram || "https://instagram.com/cobapns"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary-fixed hover:text-primary transition-colors cursor-pointer">
            <Instagram className="w-5 h-5" />
          </a>
          <a href={settings.socialTiktok || "https://tiktok.com/@cobapns"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary-fixed hover:text-primary transition-colors cursor-pointer">
            <TikTokIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
