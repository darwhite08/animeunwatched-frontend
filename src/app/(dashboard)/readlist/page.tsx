"use client"

import { useMemo, useState } from "react"
import ReadCard from "@/components/readlist/ReadCard"
import clsx from "clsx"
import { Search } from "lucide-react"

type Status = "Reading" | "Planning" | "Completed"

type Manga = {
  id: number
  title: string
  image: string
  status: Status
  totalChapters: number
  readChapters?: number
  progress?: number
  genres: string[]
}

const mangaData: Manga[] = [
  {
    id: 1,
    title: "Berserk",
    image: "/assets/png/goku.png",
    status: "Reading",
    totalChapters: 374,
    readChapters: 210,
    progress: 56,
    genres: ["Dark Fantasy", "Action"],
  },
  {
    id: 2,
    title: "One Punch Man",
    image: "/assets/png/luffy.png",
    status: "Planning",
    totalChapters: 180,
    genres: ["Action", "Comedy"],
  },
  {
    id: 3,
    title: "Tokyo Ghoul",
    image: "/assets/png/naruto.png",
    status: "Completed",
    totalChapters: 143,
    readChapters: 143,
    progress: 100,
    genres: ["Horror", "Drama"],
  },
]

const tabs = ["All", "Reading", "Planning", "Completed"]

export default function ReadlistPage() {
  const [activeTab, setActiveTab] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return mangaData.filter((manga) => {
      const matchesTab =
        activeTab === "All" ||
        manga.status === activeTab

      const matchesSearch = manga.title
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
            My Readlist
          </h1>
          <p className="text-white/50 mt-2">
            Track your manga and light novels.
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
            placeholder="Search manga..."
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
        {filtered.length > 0 ? (
          filtered.map((manga) => (
            <ReadCard key={manga.id} manga={manga} />
          ))
        ) : (
          <div className="col-span-full text-center text-white/50 py-20">
            No manga found.
          </div>
        )}
      </div>
    </div>
  )
}