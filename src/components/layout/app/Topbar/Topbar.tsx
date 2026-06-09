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
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
        {/* Mobile: hamburger + logo (sidebar is hidden <md) */}
        <button onClick={() => setMobileDrawer(true)} aria-label="Open menu" className="rounded-lg p-1.5 text-muted hover:text-foreground md:hidden">
          <Menu size={20} />
        </button>
        <Link href="/" aria-label="Kaiveron home" className="md:hidden">
          <KaiveronLogo size={26} showWordmark={false} />
        </Link>

        {/* Search (left-grow) */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="flex h-9 max-w-xs flex-1 items-center gap-2 rounded-xl border border-border px-3 text-muted hover:border-border-hover hover:text-foreground md:max-w-sm"
        >
          <Search size={16} />
          <span className="truncate text-sm">Search anime, users, clubs…</span>
          <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[10px] text-muted sm:inline">⌘K</kbd>
        </button>

        {/* Right utility cluster */}
        <div className="ml-auto flex items-center gap-2">
          <CreateButton />
          <NotificationsButton />
          <AvatarMenu />
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
