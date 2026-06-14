"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Monitor } from "lucide-react"

/**
 * Renders `children` on ≥768px; on phones it shows a clean "best on desktop"
 * screen instead. Use for operator / long-form / payment tools that are
 * intentionally desktop-only (creator studio + blog editor, admin/moderation,
 * bulk import, billing) so they don't render a cramped, broken UI on mobile.
 *
 * The tool only mounts when NOT mobile, so its hooks/fetches don't run on a
 * phone. A reserved-height placeholder on first paint avoids a layout flash and
 * keeps SSR/CSR in sync.
 */
export function DesktopOnly({
  children,
  title = "Best on desktop",
  note,
}: {
  children: React.ReactNode
  title?: string
  note?: string
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  if (isMobile === null) return <div className="min-h-[60vh]" />
  if (!isMobile) return <>{children}</>

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent-bright">
        <Monitor size={28} />
      </div>
      <h1 className="mt-5 text-2xl font-black uppercase italic tracking-tighter text-foreground">{title}</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        {note ?? "This works best on a larger screen. Open kaiveron.com on a computer to use it."}
      </p>
      <Link
        href="/community"
        className="mt-7 flex h-12 items-center justify-center rounded-2xl bg-accent px-6 text-[12px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-bright active:scale-95"
      >
        Back to Kaiveron
      </Link>
    </div>
  )
}
