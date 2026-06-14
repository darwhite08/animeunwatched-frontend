"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users, ChevronLeft, Star, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"

interface JikanCharacter {
  character: { mal_id: number; name: string; images: { jpg: { image_url: string } } }
  role: string
  voice_actors: Array<{ person: { name: string }; language: string }>
  favorites: number
}

export default function CharactersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const malId   = parseInt(id, 10)

  const { data, isLoading } = useQuery({
    queryKey: ["anime-characters", id],
    queryFn:  () => api<{ data: JikanCharacter[] }>(`/anime/${malId}/characters`),
    staleTime: 60 * 60_000,
    enabled:   !isNaN(malId),
  })

  const characters = data?.data ?? []

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-6">
      <div className="max-w-6xl mx-auto px-6">
        <Link href={`/anime/${id}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors mb-8 group">
          <ChevronLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Anime
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <Users size={20} className="text-accent-bright" />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">Characters<span style={{ color: "var(--app-accent)" }}>.</span></h1>
          {!isLoading && <span className="text-sm text-subtle">{characters.length} total</span>}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-accent-bright" /></div>
        ) : characters.length === 0 ? (
          <p className="text-center py-24 text-subtle text-sm">No character data available for this anime.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {characters.map((c, i) => {
              const va = c.voice_actors.find(v => v.language === "Japanese")
              return (
                <motion.div key={c.character.mal_id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                  className="group rounded-2xl overflow-hidden border border-border bg-surface hover:border-white/25 transition-all">
                  <div className="relative aspect-[3/4] bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy" decoding="async" src={c.character.images.jpg.image_url} alt={c.character.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-accent/20 text-accent-bright border border-accent/30">{c.role}</span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-black text-foreground leading-tight">{c.character.name}</p>
                    {va && <p className="text-[9px] text-subtle truncate">CV: {va.person.name}</p>}
                    {c.favorites > 0 && (
                      <div className="flex items-center gap-1 text-[9px] text-accent-bright/60">
                        <Star size={8} className="fill-accent-bright/60" />{c.favorites.toLocaleString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
