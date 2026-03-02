"use client"

import { useSearchParams } from "next/navigation"
import { feedContent } from "@/features/creator/data/feedData"

export default function FeedPage() {
  const searchParams = useSearchParams()
  const folderId = searchParams.get("folder")

  const filtered = folderId
    ? feedContent.filter(item => item.folderId === folderId)
    : feedContent

  return (
    <>
      <h1 className="text-2xl font-semibold">Feed Content</h1>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-5 hover:border-indigo-500 transition"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-white/50 mt-2">
                1.2k views • 54 interactions
              </p>
            </div>
          ))
        ) : (
          <div className="text-white/40 col-span-3">
            No posts in this folder.
          </div>
        )}
      </div>
    </>
  )
}