"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MessageSquare, Heart, Loader2, Plus } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Post } from "@/lib/api/types"

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

export default function ProfilePostsPage() {
  const user = useAuthStore(s => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ["user-posts", user?.username],
    queryFn:  () => api<{ data: Post[]; meta: { total: number } }>(`/users/${user?.username}/posts?limit=30`),
    enabled:  !!user?.username,
    staleTime: 60_000,
  })

  const posts = data?.data ?? []

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-accent-bright" /></div>
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-accent-bright" />
          <h2 className="text-lg font-black uppercase italic tracking-tight text-foreground">My Posts<span style={{ color: "var(--app-accent)" }}>.</span></h2>
          {posts.length > 0 && <span className="text-xs text-subtle">{data?.meta?.total ?? posts.length} total</span>}
        </div>
        <Link href="/community"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}>
          <Plus size={11} /> New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
            <MessageSquare size={24} className="text-subtle" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-subtle">No posts yet</p>
          <Link href="/community" className="text-xs font-black uppercase tracking-widest text-accent-bright hover:text-foreground transition-colors">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/posts/${post.id}`}
                className="block p-5 rounded-2xl border border-border bg-surface hover:border-white/20 hover:bg-surface transition-all group">
                <p className="text-sm text-muted leading-relaxed group-hover:text-foreground transition-colors line-clamp-3">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-[9px] text-subtle font-bold">
                  <span>{timeAgo(post.createdAt)}</span>
                  <span className="flex items-center gap-1"><Heart size={9} />{post._count?.likes ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={9} />{post._count?.comments ?? 0}</span>
                  {post.anime && <span className="text-accent-bright/60 truncate max-w-[120px]">{post.anime.title}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
