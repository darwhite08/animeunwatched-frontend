"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"

interface JikanStaff {
  person: { mal_id: number; name: string; images: { jpg: { image_url: string } } }
  positions: string[]
}

export default function StaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const malId   = parseInt(id, 10)

  const { data, isLoading } = useQuery({
    queryKey: ["anime-staff", id],
    queryFn:  () => api<{ data: JikanStaff[] }>(`/anime/${malId}/staff`),
    staleTime: 60 * 60_000,
    enabled:   !isNaN(malId),
  })

  const staff = data?.data ?? []

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-6">
      <div className="max-w-6xl mx-auto px-6">
        <Link href={`/anime/${id}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors mb-8 group">
          <ChevronLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Anime
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">Staff<span style={{ color: "#f59e0b" }}>.</span></h1>
          {!isLoading && <span className="text-sm text-subtle">{staff.length} members</span>}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-accent-bright" /></div>
        ) : staff.length === 0 ? (
          <p className="text-center py-24 text-subtle text-sm">No staff data available for this anime.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {staff.map((s, i) => (
              <motion.div key={`${s.person.mal_id}-${i}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface hover:border-accent/20 transition-all">
                <div className="h-14 w-10 rounded-xl overflow-hidden bg-surface shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.person.images.jpg.image_url} alt={s.person.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-foreground truncate">{s.person.name}</p>
                  <p className="text-[10px] text-accent-bright/70 truncate">{s.positions.join(", ")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
