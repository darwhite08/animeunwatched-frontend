"use client"

import CreatorSidebar from "@/components/creator/creator/CreatorSidebar"
import Link from "next/link"
import { LayoutGrid } from "lucide-react"

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex w-full">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 border-r border-border">
          <CreatorSidebar />
        </aside>

        {/* Content area */}
        <section className="flex-1 min-h-screen flex flex-col">
          {/* Top bar with back link */}
          <div className="flex items-center gap-3 px-10 py-4 border-b border-border bg-black/40 backdrop-blur-md">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground transition-colors"
            >
              <LayoutGrid size={13} />
              Dashboard
            </Link>
            <span className="text-subtle">/</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Creator Studio
            </span>
          </div>

          {/* Page content */}
          <div className="flex-1 px-10 py-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
