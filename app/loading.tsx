import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8f9fa] backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulse */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse w-32 h-32 m-auto"></div>

        {/* Core Logo Wrapper */}
        <div className="relative z-10 w-20 h-20 bg-brand-blue-deep rounded-3xl flex items-center justify-center shadow-xl shadow-blue-900/20 border-2 border-brand-blue-deep/50 animate-bounce">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-black text-brand-blue-deep tracking-tighter">COBA PNS</h2>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
