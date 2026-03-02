"use client"

import { useMemo, useState } from "react"
import WatchCard from "@/components/watchlist/WatchCard"
import clsx from "clsx"
import { Search } from "lucide-react"

type Status = "Watching" | "Planning" | "Completed"

type Anime = {
  id: number
  title: string
  image: string
  status: Status
  progress?: number
  totalEpisodes: number
  watchedEpisodes?: number
  genres: string[]
}

const animeData: Anime[] = [
  {
    id: 1,
    title: "One Piece",
    image: "/assets/png/luffy.png",
    status: "Watching",
    progress: 25,
    totalEpisodes: 1085,
    watchedEpisodes: 270,
    genres: ["Action", "Adventure"],
  },
  {
    id: 2,
    title: "Demon Slayer",
    image: "/assets/png/tanjiro.png",
    status: "Watching",
    progress: 27,
    totalEpisodes: 26,
    watchedEpisodes: 7,
    genres: ["Action", "Supernatural"],
  },
  {
    id: 3,
    title: "Naruto Shippuden",
    image: "/assets/png/naruto.png",
    status: "Planning",
    totalEpisodes: 500,
    genres: ["Action", "Adventure"],
  },
  {
    id: 4,
    title: "Attack on Titan",
    image: "/assets/png/zoro.png",
    status: "Completed",
    progress: 100,
    totalEpisodes: 87,
    watchedEpisodes: 87,
    genres: ["Action", "Drama"],
  },
]

const tabs = ["All", "Watching", "Planning", "Completed"]

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState("All")
  const [search, setSearch] = useState("")

  const filteredAnime = useMemo(() => {
    return animeData.filter((anime) => {
      const matchesTab =
        activeTab === "All" ||
        anime.status === activeTab

      const matchesSearch = anime.title
        .toLowerCase()
        .includes(search.toLowerCase())

      return matchesTab && matchesSearch
    })
  }, [activeTab, search])

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            My Watchlist
          </h1>
          <p className="text-white/50 mt-2">
            Track what you're watching and what's next.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search
            size={16}
            className="absolute left-3 top-3 text-white/40"
          />
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search anime..."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "relative pb-2 text-sm transition",
              activeTab === tab
                ? "text-white"
                : "text-white/40 hover:text-white"
            )}
          >
            {tab}

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnime.length > 0 ? (
          filteredAnime.map((anime) => (
            <WatchCard key={anime.id} anime={anime} />
          ))
        ) : (
          <div className="col-span-full text-center text-white/50 py-20">
            No anime found.
          </div>
        )}
      </div>
    </div>
  )
}