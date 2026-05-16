"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getLiveProfileDataAction } from "@/app/actions/profile";

interface ProfileDropdownProps {
  name: string;
  initial: string;
  role: string;
  tier?: string;
}

export function ProfileDropdown({ name, initial, role, tier: initialTier }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [liveTier, setLiveTier] = useState(initialTier);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role !== "ADMIN") {
      getLiveProfileDataAction()
        .then((res) => {
          if (res) {
            if (res.tier) setLiveTier(res.tier);
            if (res.avatarUrl) setAvatarUrl(res.avatarUrl);
          }
        })
        .catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTierLabel = () => {
    if (role === "ADMIN") return "Super Admin";
    if (liveTier === "MASTER") return "Master Scholar";
    if (liveTier === "ELITE") return "Elite Scholar";
    return "Free Scholar";
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 focus:outline-none hover:bg-slate-50 p-1 md:pr-3 rounded-full transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue-light to-emerald-500 text-white font-black flex items-center justify-center text-xs shadow-inner overflow-hidden border border-slate-200/50">
           {avatarUrl ? (
             <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
           ) : (
             initial
           )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-slate-900">{name}</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
            {getTierLabel()}
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-50 mb-1">
             <p className="text-sm font-bold text-slate-900 text-left">{name}</p>
             <p className="text-xs text-slate-500 mt-0.5 text-left">
               {role === "ADMIN" ? "Admin Console Access" : "Student Portal Access"}
             </p>
          </div>
          
          <div className="py-1 border-b border-slate-50 mb-1">
            <a 
              href="/dashboard/settings"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-brand-blue-deep hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Pengaturan Akun</span>
            </a>
            <a 
              href="/dashboard/help"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-brand-blue-deep hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Pusat Bantuan</span>
            </a>
          </div>

          <form action={logoutAction}>
            <button 
              type="submit" 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
