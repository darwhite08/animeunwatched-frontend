"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { useAuthPrompt } from "@/stores/authPrompt.store"

/**
 * The sign-in wall shown when a guest attempts a gated action. Mounted once at
 * the app root; opened via the authPrompt store (see useRequireAuth).
 */
export function AuthPromptModal() {
  const { open, title, subtitle, hide } = useAuthPrompt()
  const pathname = usePathname()
  const next = pathname && pathname !== "/login" && pathname !== "/register" ? `?returnTo=${encodeURIComponent(pathname)}` : ""

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={hide}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-background p-8 text-center shadow-2xl"
          >
            <button onClick={hide} aria-label="Close"
              className="absolute right-4 top-4 text-subtle hover:text-foreground transition-colors"><X size={18} /></button>

            {/* Kaiveron mark */}
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl"
              style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 0 30px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}>
              <svg width={30} height={30} viewBox="0 0 100 100">
                <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z" fill="#1a1405" />
              </svg>
            </div>

            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>

            <div className="mt-7 flex flex-col gap-3">
              <Link href={`/register${next}`} onClick={hide}
                className="h-12 rounded-2xl font-black text-[12px] uppercase tracking-widest text-black flex items-center justify-center transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}>
                Create free account
              </Link>
              <Link href={`/login${next}`} onClick={hide}
                className="h-12 rounded-2xl border border-border bg-surface font-bold text-[12px] uppercase tracking-widest text-foreground flex items-center justify-center hover:bg-surface/70 transition-colors">
                Sign in
              </Link>
            </div>

            <p className="mt-5 text-[11px] text-subtle">You can keep browsing — sign in only to join in.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
