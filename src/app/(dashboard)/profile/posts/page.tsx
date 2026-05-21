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
    return <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-amber-400" /></div>
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-400" />
          <h2 className="text-lg font-black uppercase italic tracking-tight text-white">My Posts<span style={{ color: "#f59e0b" }}>.</span></h2>
          {posts.length > 0 && <span className="text-xs text-white/30">{data?.meta?.total ?? posts.length} total</span>}
        </div>
        <Link href="/community"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
          <Plus size={11} /> New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
            <MessageSquare size={24} className="text-white/20" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-white/25">No posts yet</p>
          <Link href="/community" className="text-xs font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/posts/${post.id}`}
                className="block p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-amber-500/20 hover:bg-white/[0.04] transition-all group">
                <p className="text-sm text-white/80 leading-relaxed group-hover:text-white transition-colors line-clamp-3">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-[9px] text-white/25 font-bold">
                  <span>{timeAgo(post.createdAt)}</span>
                  <span className="flex items-center gap-1"><Heart size={9} />{post._count?.likes ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={9} />{post._count?.comments ?? 0}</span>
                  {post.anime && <span className="text-amber-400/60 truncate max-w-[120px]">{post.anime.title}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
