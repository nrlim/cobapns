"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, InfoIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationToastProps {
  type?: "success" | "error" | "info";
  title: string;
  message?: string;
  isOpen: boolean;
  onClose: () => void;
  autoCloseMs?: number;
}

export function NotificationToast({ 
  type = "info", 
  title, 
  message, 
  isOpen, 
  onClose, 
  autoCloseMs = 5000 
}: NotificationToastProps) {
  
  useEffect(() => {
    if (isOpen && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      color: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-200"
    },
    error: {
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200"
    },
    info: {
      icon: InfoIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200"
    }
  };

  const activeConfig = config[type];
  const Icon = activeConfig.icon;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={cn("flex items-start gap-4 p-4 rounded-2xl border shadow-xl shadow-slate-200/50 max-w-sm w-full bg-white", activeConfig.border)}>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", activeConfig.bg, activeConfig.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 pt-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h4>
          {message && <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{message}</p>}
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
