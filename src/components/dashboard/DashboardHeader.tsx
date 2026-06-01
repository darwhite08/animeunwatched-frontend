"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus } from "lucide-react"

export default function DashboardHeader() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold">
          Welcome back, Otaku 👋
        </h1>
        <p className="text-muted mt-1">
          Track your anime journey and discover new worlds.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={submit} className="relative">
          <Search className="absolute left-3 top-3 text-muted" size={16} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search anime..."
            className="bg-neutral-900 border border-border rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </form>

        <Link
          href="/bestanimelist"
          className="px-4 py-2 rounded-xl text-black flex items-center gap-2 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}
        >
          <Plus size={16} />
          Add Anime
        </Link>
      </div>
    </div>
  )
}
