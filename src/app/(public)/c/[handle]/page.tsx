"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Users, Star, PenLine, MessageSquareQuote, Clapperboard, Users2, Calendar, ArrowRight } from "lucide-react"
import { api } from "@/lib/api/client"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"
import { SupportCreator } from "@/components/social/SupportCreator"

type Storefront = {
  creator: { id: string; username: string; displayName: string; avatarUrl: string | null; bio: string | null; verifiedKind: "USER" | "CREATOR" | "STUDIO" | null; joinedAt: string }
  stats: { followers: number; reputation: number; level: number; tierTitle: string }
  isMonetized: boolean
  content: {
    blogs: { slug: string; title: string; publishedAt: string | null }[]
    shots: { id: string; thumbnailUrl: string | null; caption: string | null }[]
    posts: { id: string; content: string; imageUrl: string | null; createdAt: string }[]
    reviews: { id: string; score: number; snippet: string; anime: { malId: number; title: string; imageUrl: string | null } | null }[]
    clubs: { slug: string; name: string; members: number }[]
  }
}

export default function StorefrontPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params)
  const [data, setData] = useState<Storefront | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api<Storefront>(`/storefront/${handle}`).then(setData).catch(() => setError(true))
  }, [handle])

  if (error) return <div className="py-24 text-center text-muted">Creator not found.</div>
  if (!data) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-accent" size={28} /></div>

  const { creator, stats, content } = data
  const hasContent = content.shots.length || content.blogs.length || content.posts.length || content.reviews.length || content.clubs.length

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:pt-36">
      {/* Hero */}
      <div className="rounded-3xl border border-border bg-gradient-to-b from-accent-soft to-transparent p-8 text-center">
        {creator.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.avatarUrl} alt="" className="mx-auto h-24 w-24 rounded-full border-2 border-accent/40 object-cover" />
        ) : (
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent text-3xl font-black text-white">{creator.displayName?.[0]?.toUpperCase() ?? "?"}</div>
        )}
        <h1 className="mt-4 flex items-center justify-center gap-2 text-3xl font-black uppercase italic tracking-tighter text-foreground">
          {creator.displayName} <VerifiedBadge kind={creator.verifiedKind} size={22} />
        </h1>
        <p className="text-sm text-muted">@{creator.username}</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-accent-bright">
          <Star size={12} /> Lv {stats.level} · {stats.tierTitle}
        </div>
        {creator.bio && <p className="mx-auto mt-4 max-w-md text-sm text-muted">{creator.bio}</p>}

        <div className="mt-5 flex items-center justify-center gap-5 text-sm">
          <span className="flex items-center gap-1.5 text-foreground"><Users size={15} className="text-muted" /> <b>{stats.followers.toLocaleString()}</b> <span className="text-muted">followers</span></span>
          <span className="flex items-center gap-1.5 text-foreground"><Star size={15} className="text-amber-400" /> <b>{stats.reputation.toLocaleString()}</b> <span className="text-muted">rep</span></span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href={`/u/${creator.username}`} className="rounded-xl bg-accent px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-90">View profile</Link>
          <SupportCreator username={creator.username} />
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted"><Calendar size={12} /> Creator since {new Date(creator.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
      </div>

      {!hasContent && <p className="py-16 text-center text-sm text-muted">No public content yet.</p>}

      {/* Shots */}
      {content.shots.length > 0 && (
        <Section icon={<Clapperboard size={16} />} title="Shots" href="/shots">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {content.shots.map((s) => (
              <Link key={s.id} href="/shots" className="aspect-[9/16] overflow-hidden rounded-xl border border-border bg-black">
                {s.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : <div className="flex h-full w-full items-center justify-center"><Clapperboard size={18} className="text-muted" /></div>}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Blogs */}
      {content.blogs.length > 0 && (
        <Section icon={<PenLine size={16} />} title="Blogs">
          <div className="space-y-2">
            {content.blogs.map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} className="flex items-center justify-between rounded-2xl border border-border bg-white/[0.02] px-5 py-3.5 hover:border-border-hover">
                <span className="truncate font-bold text-foreground">{b.title}</span>
                <ArrowRight size={15} className="shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Reviews */}
      {content.reviews.length > 0 && (
        <Section icon={<MessageSquareQuote size={16} />} title="Reviews">
          <div className="space-y-2">
            {content.reviews.map((r) => (
              <Link key={r.id} href={r.anime ? `/anime/${r.anime.malId}/reviews` : "#"} className="flex gap-3 rounded-2xl border border-border bg-white/[0.02] p-4 hover:border-border-hover">
                {r.anime?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.anime.imageUrl} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="truncate font-bold text-foreground">{r.anime?.title ?? "Anime"}</span><span className="flex items-center gap-0.5 text-xs font-black text-amber-400"><Star size={11} className="fill-amber-400" /> {r.score}</span></div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{r.snippet}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Clubs */}
      {content.clubs.length > 0 && (
        <Section icon={<Users2 size={16} />} title="Clubs">
          <div className="grid gap-2 sm:grid-cols-2">
            {content.clubs.map((c) => (
              <Link key={c.slug} href={`/clubs/${c.slug}`} className="flex items-center justify-between rounded-2xl border border-border bg-white/[0.02] px-5 py-3.5 hover:border-border-hover">
                <span className="truncate font-bold text-foreground">{c.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted"><Users2 size={13} /> {c.members}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ icon, title, href, children }: { icon: React.ReactNode; title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted">{icon} {title}</h2>
        {href && <Link href={href} className="text-[11px] font-bold text-accent-bright">See all</Link>}
      </div>
      {children}
    </section>
  )
}
