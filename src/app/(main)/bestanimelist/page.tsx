"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import LeaderboardHeader from "@/components/bestanimelist/BestAnimeListHeader"
import FilterDrawer from "@/components/bestanimelist/FilterDrawer"

type Anime = {
  id: number
  rank: number
  title: string
  genres: string[]
  status: string
  format: string
  rating: number
  studio: string
  episodes: number
  description: string
  image: string
}

const mockAnime: Anime[] = [
  {
    id: 1,
    rank: 1,
    title: "Attack on Titan",
    genres: ["Action", "Fantasy"],
    status: "Finished Airing",
    format: "TV Series",
    rating: 9.5,
    studio: "MAPPA",
    episodes: 75,
    description:
      "Humanity’s struggle for survival against giant Titans.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS575pFj2cDSr8mJ1PQAFS6DhqioRWR2CJnkw&s",
  },
  {
    id: 2,
    rank: 2,
    title: "Fullmetal Alchemist: Brotherhood",
    genres: ["Adventure", "Drama"],
    status: "Finished Airing",
    format: "TV Series",
    rating: 9.3,
    studio: "Bones",
    episodes: 64,
    description: "The quest for the Philosopher’s Stone.",
    image:
      "https://m.media-amazon.com/images/M/MV5BNDczZWMyMjEtZDI0ZS00YThjLWE2MjEtNTIxNmVmZDhkNDg5XkEyXkFqcGc@._V1_.jpg",
  },
]

export default function BestAnimeListPage() {
  const [selectedFilters, setSelectedFilters] =
    useState<Record<string, string[]>>({})
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const filteredAnime = useMemo(() => {
    return mockAnime.filter((anime) => {
      return Object.entries(selectedFilters).every(
        ([category, values]) => {
          if (!values || values.length === 0) return true

          switch (category) {
            case "Genre":
              return values.some((v) =>
                anime.genres.includes(v)
              )
            case "Status":
              return values.includes(anime.status)
            case "Format":
              return values.includes(anime.format)
            case "Rating":
              return values.some(
                (v) =>
                  anime.rating >=
                  parseFloat(v.replace("+", ""))
              )
            case "Studio":
              return values.includes(anime.studio)
            default:
              return true
          }
        }
      )
    })
  }, [selectedFilters])

  const clearFilters = () => setSelectedFilters({})

  return (
    <div className="min-h-screen bg-black text-white">
      <LeaderboardHeader />

      <div className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mt-12 flex gap-10">

          {/* Desktop Sidebar */}
          <motion.aside
            animate={{ width: isCollapsed ? 80 : 320 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block shrink-0"
          >
            <div className="sticky top-24 h-[calc(100vh-6rem)]">

              {/* Collapse Toggle */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() =>
                    setIsCollapsed(!isCollapsed)
                  }
                  className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                >
                  {isCollapsed ? (
                    <SlidersHorizontal size={18} />
                  ) : (
                    <X size={18} />
                  )}
                </button>
              </div>

              {!isCollapsed && (
                <FilterDrawer
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                />
              )}
            </div>
          </motion.aside>

          {/* Mobile Filter Button */}
          <div className="md:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-full bg-indigo-600 p-4 shadow-lg hover:bg-indigo-500 transition"
            >
              <SlidersHorizontal />
            </button>
          </div>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {isMobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() =>
                    setIsMobileOpen(false)
                  }
                  className="fixed inset-0 bg-black z-40"
                />

                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.3 }}
                  className="fixed left-0 top-0 h-full w-80 bg-black z-50 p-6"
                >
                  <FilterDrawer
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* RIGHT CONTENT */}
          <main className="flex-1 space-y-8">

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <p className="text-sm text-white/60">
                Showing {filteredAnime.length} results
              </p>

              {Object.keys(selectedFilters).length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filteredAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}

            {filteredAnime.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50 backdrop-blur">
                No anime found matching your filters.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}