"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"

/**
 * Characters (with Japanese voice actor) + Staff for an anime, from the
 * /anime/:malId/characters and /staff endpoints (Jikan passthrough).
 */
export function AnimeCastSection({ malId }: { malId: number }) {
  const [showAllChars, setShowAllChars] = useState(false)
  const [showAllStaff, setShowAllStaff] = useState(false)

  const characters = useQuery({
    queryKey: ["anime-characters", malId],
    queryFn: () => ep.getAnimeCharacters(malId),
    staleTime: 60 * 60 * 1000,
  })
  const staff = useQuery({
    queryKey: ["anime-staff", malId],
    queryFn: () => ep.getAnimeStaff(malId),
    staleTime: 60 * 60 * 1000,
  })

  const chars = (characters.data?.data ?? []).slice().sort((a, b) => {
    const order = (r: string) => (r === "Main" ? 0 : r === "Supporting" ? 1 : 2)
    return order(a.role) - order(b.role)
  })
  const staffList = staff.data?.data ?? []

  const charsShown = showAllChars ? chars : chars.slice(0, 12)
  const staffShown = showAllStaff ? staffList : staffList.slice(0, 8)

  return (
    <div className="space-y-12">
      {/* ── Characters ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Characters & Voice Cast</h2>
          {chars.length > 12 && (
            <button onClick={() => setShowAllChars(v => !v)} className="text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-accent">
              {showAllChars ? "Show less" : `Show all ${chars.length}`}
            </button>
          )}
        </div>

        {characters.isLoading ? (
          <SkeletonGrid rows={2} />
        ) : chars.length === 0 ? (
          <p className="text-sm text-subtle">No character data available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charsShown.map((c, i) => {
              const jpVa = c.voice_actors?.find(v => v.language === "Japanese") ?? c.voice_actors?.[0]
              return (
                <div key={`${c.character.mal_id}-${i}`} className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-white/[0.02] p-2.5">
                  {/* Character */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.character.images?.jpg?.image_url || "/assets/png/placeholder.png"} alt={c.character.name}
                      referrerPolicy="no-referrer" loading="lazy" className="h-14 w-12 rounded-lg object-cover bg-surface shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{c.character.name}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-subtle">{c.role}</div>
                    </div>
                  </div>
                  {/* Voice actor (Japanese) */}
                  {jpVa && (
                    <div className="flex items-center gap-3 min-w-0 text-right">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-muted truncate">{jpVa.person.name}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-subtle">{jpVa.language}</div>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={jpVa.person.images?.jpg?.image_url || "/assets/png/placeholder.png"} alt={jpVa.person.name}
                        referrerPolicy="no-referrer" loading="lazy" className="h-14 w-12 rounded-lg object-cover bg-surface shrink-0" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Staff ── */}
      {(staff.isLoading || staffList.length > 0) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Staff</h2>
            {staffList.length > 8 && (
              <button onClick={() => setShowAllStaff(v => !v)} className="text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-accent">
                {showAllStaff ? "Show less" : `Show all ${staffList.length}`}
              </button>
            )}
          </div>
          {staff.isLoading ? (
            <SkeletonGrid rows={1} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {staffShown.map((s, i) => (
                <div key={`${s.person.mal_id}-${i}`} className="flex items-center gap-3 rounded-2xl border border-border bg-white/[0.02] p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.person.images?.jpg?.image_url || "/assets/png/placeholder.png"} alt={s.person.name}
                    referrerPolicy="no-referrer" loading="lazy" className="h-12 w-12 rounded-full object-cover bg-surface shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{s.person.name}</div>
                    <div className="text-[11px] text-subtle truncate">{s.positions.join(", ")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function SkeletonGrid({ rows }: { rows: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: rows * 4 }).map((_, i) => (
        <div key={i} className="h-[76px] rounded-2xl border border-border bg-surface/40 animate-pulse" />
      ))}
    </div>
  )
}
