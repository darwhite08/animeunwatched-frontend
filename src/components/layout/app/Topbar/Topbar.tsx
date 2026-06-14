"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu } from "lucide-react"
import dynamic from "next/dynamic"
import { CreateButton } from "./CreateButton"
import { NotificationsButton } from "./NotificationsButton"
import { AvatarMenu } from "./AvatarMenu"
import { useSidebarStore } from "../useSidebarStore"
import KaiveronLogo from "@/components/ui/KaiveronLogo"

const SearchModal = dynamic(() => import("@/components/layout/SearchModal"), { ssr: false })

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const setMobileDrawer = useSidebarStore((s) => s.setMobileDrawer)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen((o) => !o) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[calc(4rem+env(safe-area-inset-top))] items-center gap-2 border-b border-white/[0.06] bg-gradient-to-b from-background/95 to-background/75 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:gap-3 sm:px-4">
        {/* Mobile: hamburger + logo (sidebar is hidden <md) */}
        <button onClick={() => setMobileDrawer(true)} aria-label="Open menu" className="-ml-1 flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:text-foreground active:bg-white/5 md:hidden">
          <Menu size={22} />
        </button>
        <Link href="/" aria-label="Kaiveron home" className="md:hidden">
          <KaiveronLogo size={26} showWordmark={false} />
        </Link>

        {/* Search — icon-only on phones (the full pill eats the topbar width),
            expands to a labelled bar from sm up. */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="group flex h-11 w-11 shrink-0 items-center justify-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-0 text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all hover:border-white/15 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:ml-1 sm:w-auto sm:max-w-md sm:flex-1 sm:justify-start sm:px-4"
        >
          <Search size={16} className="text-subtle transition-colors group-hover:text-white" />
          <span className="hidden truncate text-sm sm:inline">Search anime, users, clubs…</span>
          <kbd className="ml-auto hidden items-center rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-subtle sm:inline-flex">⌘K</kbd>
        </button>

        {/* Right utility cluster */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <CreateButton />
          <NotificationsButton />
          <AvatarMenu />
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
