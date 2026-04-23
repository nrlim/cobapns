"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "success" | "warning";
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  variant = "warning"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const isSuccess = variant === "success";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner",
            isDanger ? "bg-rose-100 text-rose-600" : isSuccess ? "bg-blue-100 text-brand-blue" : "bg-amber-100 text-amber-600"
          )}>
            {isSuccess ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-slate-500 mt-2 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={cn(
                "flex-1 py-3 px-4 text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all text-center",
                isDanger ? "bg-gradient-to-tr from-rose-600 to-rose-500 hover:shadow-rose-500/25" 
                : isSuccess ? "bg-gradient-to-tr from-brand-blue to-blue-500 hover:shadow-blue-500/25" 
                : "bg-gradient-to-tr from-amber-500 to-amber-400 hover:shadow-amber-500/25"
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
