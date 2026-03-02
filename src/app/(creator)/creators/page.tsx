"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import CreatorDashboard from "@/components/creator/creator/CreatorDashboard"

export default function BlogPage() {
  const searchParams = useSearchParams()
  const folderId = searchParams.get("folder")

  const content = [
    { id: "1", title: "Gojo vs Sukuna Breakdown", type: "Feed", folderId: "1" },
    { id: "2", title: "Why Luffy Never Gives Up", type: "Feed", folderId: "2" },
    { id: "3", title: "Eren's Real Plan Explained", type: "Feed", folderId: "1" },

    { id: "4", title: "Attack on Titan Ending Deep Dive", type: "Blog", folderId: "3" },
    { id: "5", title: "Top 10 Most Underrated Anime", type: "Blog", folderId: "4" },

    { id: "6", title: "Best New Gen MC?", type: "Poll", folderId: "5" },
    { id: "7", title: "Strongest Hashira?", type: "Poll", folderId: "5" },
  ]

  const filteredContent = folderId
    ? content.filter(item => item.folderId === folderId)
    : content
  return (
    <main className="min-h-screen bg-black text-white flex">
      <div className="flex gap-8 w-full mx-auto">

        {/* Sidebar */}

        {/* Main Content */}
        <div className="flex-1 space-y-12 py-10">

          {/* ORIGINAL DASHBOARD (UNCHANGED) */}
          <CreatorDashboard />

          {/* ===== FILTERED CONTENT ===== */}
          <SectionHeader
            title={folderId ? "Filtered Content" : "All Content"}
            href="/creators"
          />

          <div className="grid md:grid-cols-3 gap-6">
            {filteredContent.length > 0 ? (
              filteredContent.map(item => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  type={item.type as "Feed" | "Blog" | "Poll"}
                />
              ))
            ) : (
              <div className="text-white/40 col-span-3">
                No content in this folder.
              </div>
            )}
          </div>

          {/* ===== POLL SECTION ===== */}
          <SectionHeader
            title="Your Polls"
            href="/creator/polls"
          />

          <div className="grid md:grid-cols-3 gap-6">
            <ContentCard title="Best New Gen MC?" type="Poll" />
            <ContentCard title="Strongest Hashira?" type="Poll" />
            <ContentCard title="Best Anime of 2024?" type="Poll" />
          </div>

        </div>
      </div>
    </main>
  )
}

/* ========================= */

function SectionHeader({
  title,
  href,
}: {
  title: string
  href: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Link
        href={href}
        className="text-sm text-indigo-400 hover:text-indigo-300 transition"
      >
        View All →
      </Link>
    </div>
  )
}

function ContentCard({
  title,
  type,
}: {
  title: string
  type: "Feed" | "Blog" | "Poll"
}) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 hover:border-indigo-500 transition cursor-pointer">

      <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full">
        {type}
      </span>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="text-sm text-white/50 mt-2">
        1.2k views • 54 interactions
      </p>

    </div>
  )
}