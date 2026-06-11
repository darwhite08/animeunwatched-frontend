"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Plus, PencilLine, BarChart3, MessageSquare } from "lucide-react"
import { useCreatorAccess } from "@/hooks/useCreator"

// `creatorOnly` items (blogs, polls) are hidden from regular members.
const CREATE_ACTIONS = [
  { label: "New post", href: "/community", icon: MessageSquare, creatorOnly: false },
  { label: "Blog article", href: "/blog/new", icon: PencilLine, creatorOnly: true },
  { label: "Poll", href: "/poll", icon: BarChart3, creatorOnly: true },
]

/** Primary-accent create button with an action menu.
 *  The menu is portalled to <body> so the topbar's backdrop-blur (which creates
 *  a clipping/containing context) can't hide or cut it off. */
export function CreateButton() {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { isCreator } = useCreatorAccess()
  const actions = CREATE_ACTIONS.filter((a) => !a.creatorOnly || isCreator)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey) }
  }, [open])

  const toggle = () => {
    if (!open) {
      const r = btnRef.current?.getBoundingClientRect()
      if (r) setPos({ top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) })
    }
    setOpen((o) => !o)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-bright to-accent px-4 py-2.5 text-xs font-black uppercase tracking-widest text-black shadow-[0_2px_16px_color-mix(in_srgb,var(--app-accent)_45%,transparent)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <Plus size={15} strokeWidth={3} /> <span className="hidden sm:inline">Create</span>
      </button>

      {open && mounted && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-[100] w-48 rounded-2xl border border-border bg-background p-1.5 shadow-2xl"
        >
          {actions.map((a) => (
            <Link key={a.href} href={a.href} onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground">
              <a.icon size={15} /> {a.label}
            </Link>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
