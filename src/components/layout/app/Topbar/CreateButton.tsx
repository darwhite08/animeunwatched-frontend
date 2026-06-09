"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Plus, PencilLine, BarChart3, MessageSquare } from "lucide-react"

const CREATE_ACTIONS = [
  { label: "New post", href: "/community", icon: MessageSquare },
  { label: "Blog article", href: "/blog/new", icon: PencilLine },
  { label: "Poll", href: "/poll", icon: BarChart3 },
]

/** Primary-accent create button with a small action menu. */
export function CreateButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-accent-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <Plus size={15} /> <span className="hidden sm:inline">Create</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-border bg-background p-1.5 shadow-2xl">
          {CREATE_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href} onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground">
              <a.icon size={15} /> {a.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
