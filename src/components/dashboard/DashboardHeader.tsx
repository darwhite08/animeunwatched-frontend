"use client"

import { Search, Plus } from "lucide-react"

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold">
          Welcome back, Otaku 👋
        </h1>
        <p className="text-white/50 mt-1">
          Track your anime journey and discover new worlds.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-white/40" size={16} />
          <input
            placeholder="Search anime..."
            className="bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <button className="bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-500 transition flex items-center gap-2">
          <Plus size={16} />
          Add Anime
        </button>
      </div>
    </div>
  )
}