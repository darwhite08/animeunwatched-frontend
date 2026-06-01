"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { motion } from "framer-motion"
import Link from "next/link"
import { Layers, Share2, Heart, ChevronLeft } from "lucide-react"
import { useToast } from "@/stores/toast.store"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

const COLLECTIONS_DATA: Record<string, {
  name: string; description: string; curator: string
  accentClass: string; filter: (a: Anime) => boolean
}> = {
  psychological:  { name:"Mind-Bending Masterpieces", description:"Anime that rewires how you think about reality, morality, and what it means to be human.", curator:"Neural Archive",  accentClass:"from-purple-900/40 to-purple-950/10 border-purple-500/20", filter:a=>a.genres.includes("Psychological")&&a.rating>=8.5 },
  "hidden-gems":  { name:"Hidden Gems",               description:"Criminally underrated anime that deserve 10x more attention than they get.",               curator:"Otaku_Arch",  accentClass:"from-amber-900/40 to-amber-950/10 border-accent/20",  filter:a=>a.rank>8&&a.rating>=8.6 },
  binge:          { name:"Binge in a Weekend",         description:"Complete series under 25 episodes. Maximum impact, minimum time investment.",               curator:"ShadowWatcher",accentClass:"from-emerald-900/40 to-emerald-950/10 border-emerald-500/20",filter:a=>(a.episodes??999)<=25&&a.rating>=8.6 },
  "dark-fantasy": { name:"Dark Fantasy",               description:"Brutal, beautiful, and unrelenting. For when you want your anime to hurt.",                  curator:"VoidSeeker",  accentClass:"from-rose-900/40 to-rose-950/10 border-rose-500/20",    filter:a=>(a.genres.includes("Seinen")||a.genres.includes("Horror"))&&a.rating>=8.5 },
  scifi:          { name:"Sci-Fi & Cyberpunk",         description:"Time travel, mechs, post-human futures, and the weight of technology on the soul.",          curator:"CipherRonin", accentClass:"from-sky-900/40 to-sky-950/10 border-sky-500/20",     filter:a=>a.genres.includes("Sci-Fi") },
  emotional:      { name:"Emotional Devastators",      description:"Warning: keep tissues nearby. These will break you, then rebuild you.",                       curator:"Neural Oracle",accentClass:"from-indigo-900/40 to-indigo-950/10 border-accent/20",filter:a=>a.tags.some(t=>["emotional","tragedy","grief"].includes(t)) },
}

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const col = COLLECTIONS_DATA[id]
  if (!col) notFound()
  const { push } = useToast()
  const [liked, setLiked] = useState(false)
  const [selected, setSelected] = useState<Anime | null>(null)
  const { data: browseData } = useBrowseAnime({ limit: 20 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)

  const anime = allAnime.filter(col.filter).sort((a,b) => b.rating - a.rating)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${col.accentClass} border-b border-border pt-32 pb-12`}>
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/collections" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground mb-6 transition-colors">
            <ChevronLeft size={11}/> All Collections
          </Link>
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Layers size={20} className="text-muted" />
                <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-subtle">Curated Collection</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground leading-none">{col.name}<span style={{color:"#f59e0b"}}>.</span></h1>
              <p className="text-muted text-sm max-w-xl leading-relaxed">{col.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-subtle">
                <span>Curated by <span className="text-muted font-black">{col.curator}</span></span>
                <span>·</span>
                <span>{anime.length} anime</span>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => { setLiked(l=>!l); push(liked?"Removed from favorites":"Collection saved!","success") }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${liked?"bg-rose-500/15 border-rose-500/30 text-rose-400":"border-border bg-surface text-muted hover:text-foreground"}`}
              ><Heart size={13} fill={liked?"currentColor":"none"}/>{liked?"Saved":"Save"}</button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); push("Link copied!","success") }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-surface text-muted hover:text-foreground text-xs font-black uppercase tracking-widest transition-all"
              ><Share2 size={13}/>Share</button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {anime.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {anime.map((a,i) => <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected}/>)}
          </motion.div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border rounded-[3rem]">
            <p className="text-subtle font-black uppercase tracking-widest">No anime match this collection yet</p>
          </div>
        )}
      </div>

      <AnimeModal isOpen={selected!==null} onClose={()=>setSelected(null)} anime={selected}/>
    </div>
  )
}
