"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Flame, TrendingUp, MessageSquare, Vote,
  ChevronRight, Star, BarChart2,
  ArrowUpRight,
} from "lucide-react"
import { HeartLike } from "@/components/ui/HeartLike"
import Link from "next/link"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useTrending } from "@/hooks/usePosts"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Types (all data is live; see hooks below) ── */
type TrendingPost = {
  id: string
  author: string
  avatar: string
  avatarUrl?: string | null
  content: string
  anime?: string
  likes: number
  comments: number
  timeAgo: string
  tags: string[]
  liked?: boolean
}

type ApiPoll = {
  id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  totalVotes?: number
  expiresAt?: string | null
}

type TrendingPoll = {
  id: string
  question: string
  votes: number
  options: { label: string; pct: number }[]
}

/* Compact relative time, e.g. "14m ago", "3h ago", "2d ago". */
function relativeTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60_000) return "just now"
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  return `${Math.floor(d / 86_400_000)}d ago`
}

/* Pull #hashtags out of a post body (first 3) for the tag row. */
function extractTags(content: string): string[] {
  const out: string[] = []
  const re = /(^|\s)#([a-zA-Z0-9_-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null && out.length < 3) out.push(m[2].toLowerCase())
  return out
}

/* Strip [spoiler] wrappers so previews read cleanly. */
function cleanContent(content: string): string {
  return content.replace(/\[\/?spoiler\]/gi, "").trim()
}

/* ── Sub-components ── */
function PostCard({ post, index }: { post: TrendingPost; index: number }) {
  const [liked, setLiked] = useState(false)
  const isHot = post.likes > 300

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative p-5 rounded-2xl bg-surface border border-border hover:border-border transition-all space-y-3"
    >
      {isHot && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/25">
          <Flame size={10} className="text-orange-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Hot</span>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3">
        {post.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={post.avatarUrl} alt="" className="h-9 w-9 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0">
            {post.avatar}
          </div>
        )}
        <div>
          <p className="text-sm font-black text-foreground">{post.author}</p>
          <p className="text-[10px] text-subtle">{post.timeAgo}</p>
        </div>
      </div>

      {/* Anime badge */}
      {post.anime && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-accent/8 border border-accent/15 text-[9px] font-bold text-accent-bright">
          <Star size={8} /> {post.anime}
        </span>
      )}

      {/* Content */}
      <p className="text-sm text-muted leading-relaxed line-clamp-3">{post.content}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="text-[9px] font-bold text-accent-bright/50">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <span className={`flex items-center gap-1.5 text-xs font-bold ${liked ? "text-rose-400" : "text-subtle"}`}>
          <HeartLike liked={liked} onToggle={() => setLiked((l) => !l)} size={15} />
          {liked ? post.likes + 1 : post.likes}
        </span>
        <Link
          href={`/posts/${post.id}#comments`}
          className="flex items-center gap-1.5 text-xs font-bold text-subtle hover:text-foreground transition-colors"
        >
          <MessageSquare size={13} />
          {post.comments}
        </Link>
      </div>
    </motion.article>
  )
}

function PollBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  )
}

const POLL_COLORS = ["bg-accent", "bg-violet-500", "bg-blue-500"]

/* ── Page ── */
export default function CommunityTrendingPage() {
  // Live anime for the "Trending Discussions" rail
  const { data: browseData } = useBrowseAnime({ limit: 4 })
  const ANIME_DISCUSSION = (browseData?.data ?? []).map(mapDTO).slice(0, 4)

  // Live algorithm-ranked posts (HN-style score, 60s refresh)
  const { data: trendingData } = useTrending(12)
  const TRENDING_POSTS: TrendingPost[] = (trendingData?.data ?? []).map(p => {
    const name = p.author.displayName || p.author.username
    return {
      id: p.id,
      author: name,
      avatar: name[0]?.toUpperCase() ?? "?",
      avatarUrl: p.author.avatarUrl,
      content: cleanContent(p.content),
      anime: p.anime?.title,
      likes: p._count?.likes ?? 0,
      comments: p._count?.comments ?? 0,
      timeAgo: relativeTime(p.createdAt),
      tags: extractTags(p.content),
      liked: p.isLikedByMe,
    }
  })

  // Live polls (active only, top by votes)
  const { data: pollsData } = useQuery({
    queryKey: ["trending-polls"],
    queryFn:  () => api<{ data: ApiPoll[] }>("/polls?limit=12"),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
  const TRENDING_POLLS: TrendingPoll[] = (pollsData?.data ?? [])
    .filter(p => !p.expiresAt || new Date(p.expiresAt) > new Date())
    .map(p => {
      const total = p.totalVotes ?? p.options.reduce((s, o) => s + o.votes, 0)
      return {
        id: p.id,
        question: p.question,
        votes: total,
        options: [...p.options]
          .sort((a, b) => b.votes - a.votes)
          .slice(0, 3)
          .map(o => ({ label: o.text, pct: total > 0 ? Math.round((o.votes / total) * 100) : 0 })),
      }
    })
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-28">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle mb-8">
          <Link href="/community" className="hover:text-muted transition-colors">Community</Link>
          <ChevronRight size={11} className="text-subtle" />
          <span className="text-accent-bright">Trending</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-3">
            Live · Updated every 15 min
          </p>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase italic text-foreground leading-none">
              Trending<br />
              <span className="text-accent-bright">Now</span>
              <span style={{color:"var(--app-accent)"}}>.</span>
            </h1>
            {/* Live pulse */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/25 self-start mt-4">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Live</span>
            </div>
          </div>
          <p className="text-subtle text-sm">What the Shinobi community can&apos;t stop talking about.</p>
        </motion.div>

        {/* ── SECTION 1: Trending Posts ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <Flame size={15} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Section 01</p>
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-foreground">Trending Posts</h2>
              </div>
            </div>
            <Link
              href="/community/feed"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-foreground transition-colors"
            >
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          {TRENDING_POSTS.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRENDING_POSTS.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <p className="text-sm font-bold text-muted">No trending posts yet.</p>
              <Link href="/community" className="mt-2 inline-block text-[11px] font-black uppercase tracking-widest text-accent-bright hover:text-foreground transition-colors">
                Start the conversation →
              </Link>
            </div>
          )}
        </section>

        {/* ── SECTION 2: Trending Anime Discussions ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center">
                <TrendingUp size={15} className="text-accent-bright" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Section 02</p>
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-foreground">Trending Discussions</h2>
              </div>
            </div>
            <Link
              href="/community/anime"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-foreground transition-colors"
            >
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ANIME_DISCUSSION.map((anime, i) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.07 }}
                className="group relative rounded-2xl overflow-hidden border border-border hover:border-white/30 transition-all cursor-pointer"
              >
                <Link href={`/anime/${anime.id}`} className="block">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={anime.image}
                      alt={anime.title}
                      fill
                      className="object-cover brightness-60 group-hover:brightness-75 transition-all duration-500 scale-105 group-hover:scale-100"
                      sizes="200px"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                      <p className="text-xs font-black text-foreground uppercase italic tracking-tight leading-tight line-clamp-2 mb-2">
                        {anime.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {anime.rating > 0 ? (
                          <>
                            <Star size={10} className="text-accent-bright" fill="currentColor" />
                            <span className="text-[10px] font-black text-muted">
                              {anime.rating.toFixed(1)} · Discuss
                            </span>
                          </>
                        ) : (
                          <>
                            <MessageSquare size={10} className="text-accent-bright" />
                            <span className="text-[10px] font-black text-muted">Discuss</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: Trending Polls ── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center">
                <Vote size={15} className="text-accent-bright" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Section 03</p>
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-foreground">Trending Polls</h2>
              </div>
            </div>
            <Link
              href="/poll"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-foreground transition-colors"
            >
              View All <ArrowUpRight size={11} />
            </Link>
          </div>

          {TRENDING_POLLS.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <p className="text-sm font-bold text-muted">No active polls right now.</p>
              <Link href="/poll" className="mt-2 inline-block text-[11px] font-black uppercase tracking-widest text-accent-bright hover:text-foreground transition-colors">
                Create a poll →
              </Link>
            </div>
          ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {TRENDING_POLLS.map((poll, i) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.08 }}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-white/20 transition-all space-y-4"
              >
                <div>
                  <p className="text-sm font-black text-foreground leading-snug">{poll.question}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <BarChart2 size={10} className="text-accent-bright" />
                    <span className="text-[10px] text-subtle">{poll.votes.toLocaleString()} votes</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {poll.options.map((opt, oi) => (
                    <div key={opt.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-muted">{opt.label}</span>
                        <span className="font-black text-muted">{opt.pct}%</span>
                      </div>
                      <PollBar pct={opt.pct} color={POLL_COLORS[oi % POLL_COLORS.length]} />
                    </div>
                  ))}
                </div>
                <Link
                  href="/poll"
                  className="block text-center text-[10px] font-black uppercase tracking-widest text-accent-bright/60 hover:text-foreground transition-colors"
                >
                  Vote →
                </Link>
              </motion.div>
            ))}
          </div>
          )}
        </section>

        {/* CTA — full trending page */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-8 border-t border-border flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-subtle">Want more?</p>
            <p className="text-sm text-muted mt-0.5">See the full anime rankings board with live scores.</p>
          </div>
          <Link
            href="/rankings"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent/15 border border-accent/25 text-[11px] font-black uppercase tracking-widest text-accent-bright hover:bg-white/25 transition-all"
          >
            Full Rankings <ArrowUpRight size={12} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
