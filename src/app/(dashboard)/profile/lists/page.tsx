"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ANIME_DB } from "@/lib/data/anime"
import { List, Plus, Globe, Lock, Edit2, Trash2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"

type MyList = { id: string; title: string; description: string; isPublic: boolean; animeIds: string[]; createdAt: string }

const INITIAL_LISTS: MyList[] = [
  { id:"1", title:"All-Time Favorites",       description:"My personal GOAT list",                   isPublic:true,  animeIds:["fullmetal-alchemist-brotherhood","steins-gate","attack-on-titan","monster","vinland-saga"], createdAt:"2024-01-15" },
  { id:"2", title:"Psychological Picks",       description:"Mind-bending anime that changed my view", isPublic:true,  animeIds:["monster","steins-gate","neon-genesis-evangelion","death-note","puella-magi-madoka-magica"], createdAt:"2024-02-20" },
  { id:"3", title:"Watch With Friends",        description:"Great for a group watch session",          isPublic:false, animeIds:["demon-slayer","jujutsu-kaisen","one-punch-man","spy-x-family"], createdAt:"2024-03-10" },
]

export default function MyListsPage() {
  const { push } = useToast()
  const [lists, setLists] = useState(INITIAL_LISTS)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

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
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-2">My Archive</p>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            My Lists<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-white/35 text-sm mt-1">{lists.length} curated lists</p>
        </div>
        <button onClick={() => push("List creation coming soon!", "info")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-all mt-2"
        >
          <Plus size={13} /> New List
        </button>
      </div>

      <AnimatePresence>
        {lists.map((list, i) => {
          const animes = list.animeIds.map(id => ANIME_DB.find(a=>a.id===id)).filter(Boolean) as Anime[]
          return (
            <motion.div key={list.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
              transition={{ delay: i*0.06 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-black text-white">{list.title}</h2>
                    <span className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      list.isPublic ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-white/30 bg-white/5 border-white/10"
                    }`}>
                      {list.isPublic ? <><Globe size={9}/> Public</> : <><Lock size={9}/> Private</>}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">{list.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => togglePublic(list.id)}
                    className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    title={list.isPublic ? "Make private" : "Make public"}
                  >
                    {list.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                  </button>
                  <button onClick={() => push("List editing coming soon!", "info")}
                    className="p-2 rounded-lg text-white/30 hover:text-indigo-400 hover:bg-white/5 transition-colors"
                  ><Edit2 size={14} /></button>
                  <button onClick={() => deleteList(list.id)}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  ><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Cover thumbnails */}
              <div className="flex -space-x-2">
                {animes.slice(0,6).map(a => (
                  <button key={a.id} onClick={() => setSelectedAnime(a)}
                    className="relative h-12 w-9 rounded-lg overflow-hidden border-2 border-[#0a0a0a] hover:scale-110 hover:z-10 transition-transform"
                  >
                    <Image src={a.image} alt={a.title} fill className="object-cover" sizes="36px" />
                  </button>
                ))}
                {animes.length > 6 && (
                  <div className="relative h-12 w-9 rounded-lg bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-black text-white/50">
                    +{animes.length-6}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-white/25">
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
