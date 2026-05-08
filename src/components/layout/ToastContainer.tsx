"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { useToast } from "@/stores/toast.store"

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const COLORS = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-xs ${COLORS[toast.type]}`}
            >
              <Icon size={15} className="shrink-0" />
              <p className="text-xs font-bold flex-1 leading-snug text-white/90">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-white/30 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
