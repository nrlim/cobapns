"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Save, Server, Shield, Mail, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSmtpSettings } from "./actions";
import { NotificationToast } from "@/components/ui/notification-toast";

type FormData = {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
};

export function SmtpSettingsClient({ initialData }: { initialData: Record<string, string> }) {
  const [notification, setNotification] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      smtpHost: initialData.smtpHost || "",
      smtpPort: initialData.smtpPort || "587",
      smtpUser: initialData.smtpUser || "",
      smtpPass: initialData.smtpPass || "",
      smtpFrom: initialData.smtpFrom || "noreply@cobapns.com",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await updateSmtpSettings(data);
      if (res.success) {
        setNotification({ type: "success", title: "Berhasil", message: "Konfigurasi SMTP berhasil disimpan." });
      } else {
        setNotification({ type: "error", title: "Gagal", message: "Gagal menyimpan konfigurasi SMTP." });
      }
    } catch (error) {
      setNotification({ type: "error", title: "Error", message: "Terjadi kesalahan sistem." });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
      {notification && (
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isOpen={!!notification}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2">
                <Server className="w-3.5 h-3.5" />
                SMTP Host
              </label>
              <Input 
                {...register("smtpHost")} 
                placeholder="smtp.gmail.com" 
                className="bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2">
                <Server className="w-3.5 h-3.5" />
                SMTP Port
              </label>
              <Input 
                {...register("smtpPort")} 
                placeholder="587" 
                type="number"
                className="bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                SMTP Username
              </label>
              <Input 
                {...register("smtpUser")} 
                placeholder="email@example.com" 
                className="bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                SMTP Password
              </label>
              <Input 
                {...register("smtpPass")} 
                type="password"
                placeholder="••••••••" 
                className="bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                From Email Address
              </label>
              <Input 
                {...register("smtpFrom")} 
                placeholder="noreply@cobapns.com" 
                className="bg-slate-50 focus:bg-white transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">
                Alamat email pengirim yang akan tampil di email penerima.
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-brand-blue-deep hover:bg-brand-blue-deep/90 text-white font-bold px-8 shadow-md transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Konfigurasi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
