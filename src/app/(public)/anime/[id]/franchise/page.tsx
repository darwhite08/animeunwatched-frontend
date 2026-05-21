"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, Loader2, ExternalLink } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"

interface JikanRelation {
  relation: string
  entry: Array<{ mal_id: number; name: string; type: string; url: string }>
}

export default function FranchisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const malId   = parseInt(id, 10)

  const { data, isLoading } = useQuery({
    queryKey: ["anime-franchise", id],
    queryFn:  () => api<{ data: JikanRelation[] }>(`/anime/${malId}/franchise`),
    staleTime: 60 * 60_000,
    enabled:   !isNaN(malId),
  })

  const relations = data?.data ?? []

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32 pt-6">
      <div className="max-w-4xl mx-auto px-6">
        <Link href={`/anime/${id}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors mb-8 group">
          <ChevronLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Anime
        </Link>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-8">
          Franchise<span style={{ color: "#f59e0b" }}>.</span>
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-amber-400" /></div>
        ) : relations.length === 0 ? (
          <p className="text-center py-24 text-white/30 text-sm">No related entries found for this anime.</p>
        ) : (
          <div className="space-y-8">
            {relations.map((rel) => (
              <div key={rel.relation}>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/70 mb-3">{rel.relation}</p>
                <div className="space-y-2">
                  {rel.entry.map((entry, i) => (
                    <motion.div key={entry.mal_id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-[#0a0a0a] hover:border-amber-500/20 transition-all group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white">{entry.name}</p>
                        <p className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">{entry.type}</p>
                      </div>
                      {entry.type === "anime" && (
                        <Link href={`/anime/${entry.mal_id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all shrink-0">
                          View <ExternalLink size={9} />
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
