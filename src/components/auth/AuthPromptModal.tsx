"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { useAuthPrompt } from "@/stores/authPrompt.store"
import { Sheet } from "@/components/ui/Sheet"

/**
 * The sign-in wall shown when a guest attempts a gated action. Mounted once at
 * the app root; opened via the authPrompt store (see useRequireAuth). Uses the
 * shared Sheet primitive: a bottom sheet on phones, a centered dialog on ≥sm.
 */
export function AuthPromptModal() {
  const { open, title, subtitle, hide } = useAuthPrompt()
  const pathname = usePathname()
  const next = pathname && pathname !== "/login" && pathname !== "/register" ? `?returnTo=${encodeURIComponent(pathname)}` : ""

  return (
    <Sheet open={open} onClose={hide} ariaLabel={title} className="sm:max-w-sm">
      <div className="relative px-6 pb-6 pt-5 text-center sm:p-8">
        <button onClick={hide} aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-subtle transition-colors hover:bg-white/5 hover:text-foreground">
          <X size={18} />
        </button>

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
            className="flex h-12 items-center justify-center rounded-2xl text-[12px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}>
            Create free account
          </Link>
          <Link href={`/login${next}`} onClick={hide}
            className="flex h-12 items-center justify-center rounded-2xl border border-border bg-surface text-[12px] font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-surface/70 active:scale-[0.98]">
            Sign in
          </Link>
        </div>

        <p className="mt-5 text-[11px] text-subtle">You can keep browsing — sign in only to join in.</p>
      </div>
    </Sheet>
  )
}
