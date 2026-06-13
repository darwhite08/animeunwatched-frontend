"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Sticky bottom sign-up bar for logged-out readers — the research-backed primary
 * conversion placement (sticky CTAs ≈ +31% vs sidebar's ~0.5–1.5%). Appears
 * after the reader scrolls into the article; dismissible.
 */
export function StickyJoinBar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (isAuthenticated || dismissed || !show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:py-3">
        <p className="hidden text-sm font-bold text-foreground sm:block">
          Track every episode, rate, and discuss anime with <span className="text-accent-bright">12,000+ fans</span>.
        </p>
        <p className="text-sm font-bold text-foreground sm:hidden">Join Kaiveron — free</p>
        <Link
          href="/register"
          className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-[11px] font-black uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
        >
          Sign up free <ArrowRight size={13} />
        </Link>
        <Link href="/login" className="hidden min-h-11 shrink-0 items-center rounded-full border border-border px-5 text-[11px] font-black uppercase tracking-widest text-muted hover:text-foreground sm:inline-flex">
          Log in
        </Link>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-subtle hover:text-foreground active:scale-95">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
