"use client"

import { useState, useMemo } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import { List, Plus, Globe, Lock, Edit2, Trash2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

type MyList = { id: string; title: string; description: string; isPublic: boolean; animeIds: string[]; createdAt: string }

const INITIAL_LISTS: MyList[] = [
  { id:"1", title:"All-Time Favorites",       description:"My personal GOAT list",                   isPublic:true,  animeIds:["fullmetal-alchemist-brotherhood","steins-gate","attack-on-titan","monster","vinland-saga"], createdAt:"2024-01-15" },
  { id:"2", title:"Psychological Picks",       description:"Mind-bending anime that changed my view", isPublic:true,  animeIds:["monster","steins-gate","neon-genesis-evangelion","death-note","puella-magi-madoka-magica"], createdAt:"2024-02-20" },
  { id:"3", title:"Watch With Friends",        description:"Great for a group watch session",          isPublic:false, animeIds:["demon-slayer","jujutsu-kaisen","one-punch-man","spy-x-family"], createdAt:"2024-03-10" },
]

export default function MyListsPage() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  // Build a "My Watchlist" from real data as the first list
  const realWatchlist: MyList | null = useMemo(() => {
    const entries = listData?.data ?? []
    if (entries.length === 0) return null
    return {
      id: "watchlist",
      title: "My Watchlist",
      description: `${entries.length} anime tracked`,
      isPublic: true,
      animeIds: entries.slice(0, 5).map(e => String(e.anime?.malId ?? e.animeId)),
      createdAt: new Date().toISOString().split("T")[0],
    }
  }, [listData])

  const baseLists = realWatchlist ? [realWatchlist, ...INITIAL_LISTS] : INITIAL_LISTS
  const [lists, setLists] = useState(baseLists)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const { data: browseData } = useBrowseAnime({ limit: 20 })
  const browseAnime = (browseData?.data ?? []).map(mapDTO)

  const togglePublic = (id: string) => {
    setLists(ls => ls.map(l => l.id===id ? {...l, isPublic:!l.isPublic} : l))
    const list = lists.find(l=>l.id===id)
    push(list?.isPublic ? "List set to private" : "List is now public", "info")
  }

  const deleteList = (id: string) => {
    setLists(ls => ls.filter(l => l.id!==id))
    push("List deleted", "info")
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">My Archive</p>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
            My Lists<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>
          <p className="text-subtle text-sm mt-1">{lists.length} curated lists</p>
        </div>
        <button onClick={() => push("List creation coming soon!", "info")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-bright text-xs font-black uppercase tracking-widest text-foreground transition-all mt-2"
        >
          <Plus size={13} /> New List
        </button>
      </div>

      <AnimatePresence>
        {lists.map((list, i) => {
          const animes = list.animeIds.map(id => browseAnime.find(a=>a.id===id)).filter(Boolean) as Anime[]
          return (
            <motion.div key={list.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
              transition={{ delay: i*0.06 }}
              className="p-6 rounded-2xl bg-surface border border-border hover:border-border transition-colors space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-black text-foreground">{list.title}</h2>
                    <span className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      list.isPublic ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-subtle bg-surface border-border"
                    }`}>
                      {list.isPublic ? <><Globe size={9}/> Public</> : <><Lock size={9}/> Private</>}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{list.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => togglePublic(list.id)}
                    className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-surface transition-colors"
                    title={list.isPublic ? "Make private" : "Make public"}
                  >
                    {list.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                  </button>
                  <button onClick={() => push("List editing coming soon!", "info")}
                    className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-surface transition-colors"
                  ><Edit2 size={14} /></button>
                  <button onClick={() => deleteList(list.id)}
                    className="p-2 rounded-lg text-subtle hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  ><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Cover thumbnails */}
              <div className="flex -space-x-2">
                {animes.slice(0,6).map(a => (
                  <button key={a.id} onClick={() => setSelectedAnime(a)}
                    className="relative h-12 w-9 rounded-lg overflow-hidden border-2 border-[var(--app-bg)] hover:scale-110 hover:z-10 transition-transform"
                  >
                    <Image src={a.image} alt={a.title} fill className="object-cover" sizes="36px" />
                  </button>
                ))}
                {animes.length > 6 && (
                  <div className="relative h-12 w-9 rounded-lg bg-surface border-2 border-[var(--app-bg)] flex items-center justify-center text-[10px] font-black text-muted">
                    +{animes.length-6}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-subtle">
                <span>{animes.length} anime</span>
                <span>Created {new Date(list.createdAt).toLocaleDateString("en-US", { month:"short", year:"numeric" })}</span>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
