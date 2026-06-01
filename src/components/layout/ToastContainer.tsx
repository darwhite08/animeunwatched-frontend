"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { CheckCircle, Warning, Info } from "@phosphor-icons/react"
import { useToast } from "@/stores/toast.store"

type ToastType = "success" | "error" | "info"

const CONFIG: Record<ToastType, {
  icon: typeof CheckCircle
  iconClass: string
  containerStyle: React.CSSProperties
}> = {
  success: {
    icon: CheckCircle,
    iconClass: "text-accent-bright",
    containerStyle: {
      background: "linear-gradient(135deg, color-mix(in srgb, var(--app-accent) 13%, transparent), color-mix(in srgb, var(--app-accent-bright) 6%, transparent))",
      border: "1px solid color-mix(in srgb, var(--app-accent) 32%, transparent)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 0.5px color-mix(in srgb, var(--app-accent) 12%, transparent) inset",
    },
  },
  error: {
    icon: Warning,
    iconClass: "text-red-400",
    containerStyle: {
      background: "linear-gradient(135deg, rgba(239,68,68,0.13), rgba(220,38,38,0.06))",
      border: "1px solid rgba(239,68,68,0.32)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(239,68,68,0.12) inset",
    },
  },
  info: {
    icon: Info,
    iconClass: "text-accent-bright",
    containerStyle: {
      background: "linear-gradient(135deg, rgba(99,102,241,0.13), rgba(79,70,229,0.06))",
      border: "1px solid rgba(99,102,241,0.32)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(99,102,241,0.12) inset",
    },
  },
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map(toast => {
          const cfg = CONFIG[toast.type as ToastType] ?? CONFIG.info
          const Icon = cfg.icon
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.82 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.85 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl max-w-[300px]"
              style={cfg.containerStyle}
            >
              <Icon size={16} weight="duotone" className={`shrink-0 ${cfg.iconClass}`} />
              <p className="text-[11px] font-bold flex-1 leading-snug text-white/85">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-subtle hover:text-muted transition-colors ml-1"
              >
                <X size={12} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
