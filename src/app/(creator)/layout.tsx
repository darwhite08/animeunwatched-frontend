"use client"

import CreatorSidebar from "@/components/creator/creator/CreatorSidebar"

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex w-full">

        {/* Sidebar */}
        <aside className="w-80 shrink-0 border-r border-white/10">
          <CreatorSidebar />
        </aside>

        {/* Content Area */}
        <section className="flex-1 px-10 py-10">
          {children}
        </section>

      </div>
    </main>
  )
}