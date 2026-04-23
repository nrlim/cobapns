"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { Save, Loader2, Contact, Share2, Mail, Phone, Instagram, Link2 } from "lucide-react";
import { NotificationToast } from "@/components/ui/notification-toast";

interface GeneralSettingsClientProps {
  initialData: Record<string, string>;
}

export function GeneralSettingsClient({ initialData }: GeneralSettingsClientProps) {
  const [formData, setFormData] = useState({
    contactEmail: initialData.contactEmail || "support@cobapns.com",
    contactPhone: initialData.contactPhone || "6281234567890",
    socialInstagram: initialData.socialInstagram || "https://instagram.com/cobapns",
    socialTiktok: initialData.socialTiktok || "https://tiktok.com/@cobapns",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setNotification({ type: "success", title: "Pengaturan Tersimpan", message: "Perubahan pengaturan umum berhasil disimpan." });
    } catch {
      setNotification({ type: "error", title: "Gagal Menyimpan", message: "Terjadi kesalahan saat menyimpan pengaturan. Coba lagi." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const inputBase = "w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white";
  const inputNormal = `${inputBase} border-slate-200 focus:border-blue-500 focus:ring-blue-500/10`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {notification && (
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isOpen={!!notification}
          onClose={() => setNotification(null)}
        />
      )}  
      {/* ── Contact Information Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <Contact className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Contact Information</h3>
            <p className="text-xs text-slate-400 mt-0.5">Informasi ini akan ditampilkan di footer dan bagian hubungi kami.</p>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="contactEmail" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className={inputNormal}
                  placeholder="support@cobapns.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="contactPhone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className={`${inputNormal} font-mono`}
                  placeholder="6281234567890"
                  required
                />
              </div>
              <p className="text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                Awali dengan kode negara tanpa plus (misal: 6281...)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Social Media Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <Share2 className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Social Media Links</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tautan profil media sosial aktif untuk mengarahkan pengguna.</p>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="socialInstagram" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Instagram Link
              </label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  id="socialInstagram"
                  name="socialInstagram"
                  value={formData.socialInstagram}
                  onChange={handleChange}
                  className={inputNormal}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="socialTiktok" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                TikTok Link
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  id="socialTiktok"
                  name="socialTiktok"
                  value={formData.socialTiktok}
                  onChange={handleChange}
                  className={inputNormal}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit Action ── */}
      <div className="flex justify-start pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-brand-blue/15 hover:shadow-xl hover:-translate-y-0.5 disabled:translate-y-0 transition-all active:scale-[0.98]"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Memperbarui...</>
          ) : (
            <><Save className="w-4 h-4" /> Simpan Pengaturan</>
          )}
        </button>
      </div>
    </form>
  );
}
