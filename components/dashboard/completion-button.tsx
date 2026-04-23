"use client"

import { useState, useTransition, useEffect } from "react"
import { toggleMaterialCompletion } from "@/app/actions/materials"
import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react"

interface Props {
  materialId: string
  initialCompleted: boolean
}

// userId is intentionally NOT passed as a prop — the server action
// derives it from the session cookie to prevent IDOR.
export function CompletionButton({ materialId, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [isPending, startTransition] = useTransition()
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    if (justCompleted) {
      const timer = setTimeout(() => setJustCompleted(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [justCompleted])

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleMaterialCompletion(materialId)
      if (res.success) {
        const willBeComplete = res.completed ?? !completed
        setCompleted(willBeComplete)
        if (willBeComplete) {
          setJustCompleted(true)
        }
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`group relative overflow-hidden flex items-center justify-center gap-2.5 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-black text-[13px] sm:text-sm tracking-wide transition-all duration-300 ease-out transform active:scale-95 shadow-md ${
        completed
          ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 border-0"
          : "bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-brand-blue-deep hover:bg-blue-50 shadow-slate-200/50 hover:shadow-blue-500/20"
      } disabled:opacity-75 disabled:cursor-not-allowed`}
    >
      {/* Background shine effect for pending state */}
      {!completed && !isPending && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50 group-hover:animate-pulse transition-opacity rounded-xl"></span>
      )}

      {/* Ripple/Flash effect when just completed */}
      {justCompleted && (
        <span className="absolute inset-0 bg-white animate-ping opacity-75 rounded-xl"></span>
      )}

      {isPending ? (
        <Loader2 className="w-5 h-5 sm:w-5 sm:h-5 animate-spin relative z-10" />
      ) : completed ? (
        <>
          <CheckCircle2 className="w-5 h-5 sm:w-5 sm:h-5 drop-shadow-sm scale-110 transition-transform duration-300 relative z-10" />
          <Sparkles className="w-3 h-3 absolute top-2 right-4 text-emerald-100 animate-pulse" />
        </>
      ) : (
        <Circle className="w-5 h-5 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-500 relative z-10" />
      )}
      
      <span className="relative z-10">{completed ? "Materi Selesai!" : "Tandai Selesai"}</span>
    </button>
  )
}
