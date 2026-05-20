"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { MessageSquare, Heart, Trash2, Edit2, Plus, Eye } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useFeed } from "@/hooks/usePosts"
import { useDeletePost } from "@/hooks/useThreads"

const MY_POSTS = [
  { id:1, content:"Frieren's power scaling episode broke my brain. Mana concealment as the TRUE skill ceiling is the most thoughtful magic system reveal I've seen. 🤯", anime:"Frieren: Beyond Journey's End", likes:312, comments:48, views:2140, time:"2h ago" },
  { id:2, content:"Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adaptation has done before.", anime:"Chainsaw Man", likes:184, comments:93, views:1820, time:"3d ago" },
  { id:3, content:"Just finished Monster for the first time in 2026. 74 episodes and not a single bad one. Johan is the greatest villain in anime history.", anime:"Monster", likes:427, comments:62, views:3400, time:"1w ago" },
  { id:4, content:"Your Lie in April uses color theory to signal emotional states at a graduate level. I've watched the piano duet scene 11 times.", anime:"Your Lie in April", likes:256, comments:34, views:1980, time:"2w ago" },
  { id:5, content:"The way Vinland Saga S2 recontextualizes S1's violence is one of the most narratively brave things I've seen in anime.", anime:"Vinland Saga", likes:198, comments:27, views:1560, time:"3w ago" },
]

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
  return `${Math.floor(d/86400000)}d ago`
}

export default function MyPostsPage() {
  const { push } = useToast()
  const authUser = useAuthStore(s => s.user)
  const { data: feedData } = useFeed()

  // Show only the user's own posts from their feed
  const apiPosts = (feedData?.pages.flatMap(p => p.data) ?? [])
    .filter(p => p.authorId === authUser?.id)
    .map(p => ({
      id: p.id as unknown as number,
      content: p.content,
      anime: p.anime?.title ?? "",
      likes: p._count?.likes ?? 0,
      comments: p._count?.comments ?? 0,
      views: 0,
      time: timeAgo(p.createdAt),
    }))

  const posts = apiPosts.length > 0 ? apiPosts : MY_POSTS
  const deletePost = useDeletePost()
  const del = (id: number) => {
    const post = posts.find(p => p.id === id)
    if (!post) return
    deletePost.mutate(String(id), {
      onSuccess: () => push("Post deleted", "info"),
      onError: () => push("Failed to delete post", "error"),
    })
  }

  const totalLikes   = posts.reduce((s,p) => s + p.likes,    0)
  const totalViews   = posts.reduce((s,p) => s + p.views,    0)
  const totalComments= posts.reduce((s,p) => s + p.comments, 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Your Voice</p>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">My Posts<span style={{color:"#f59e0b"}}>.</span></h1>
        </div>
        <Link href="/community" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all mt-2">
          <Plus size={13}/> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon:Heart,          label:"Total Likes",    value:totalLikes.toLocaleString(),    color:"text-rose-400"    },
          { icon:Eye,            label:"Total Views",    value:totalViews.toLocaleString(),    color:"text-amber-400"  },
          { icon:MessageSquare,  label:"Comments",       value:totalComments.toLocaleString(), color:"text-blue-400"    },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 text-center space-y-1">
            <s.icon size={16} className={`${s.color} mx-auto`} />
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-white/25">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((p, i) => (
            <motion.div key={p.id} layout initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,height:0 }}
              transition={{ delay:i*0.04 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors space-y-3"
            >
              {p.anime && (
                <span className="inline-flex items-center text-[9px] font-bold text-amber-400 bg-indigo-500/8 border border-indigo-500/15 px-2.5 py-1 rounded-lg">
                  {p.anime}
                </span>
              )}
              <p className="text-sm text-white/70 leading-relaxed">{p.content}</p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-4 text-[10px] text-white/30">
                  <span className="flex items-center gap-1"><Heart size={11}/> {p.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11}/> {p.comments}</span>
                  <span className="flex items-center gap-1"><Eye size={11}/> {p.views.toLocaleString()}</span>
                  <span>{p.time}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => push("Post editing coming soon!", "info")} className="p-2 rounded-lg text-white/25 hover:text-amber-400 hover:bg-white/5 transition-colors"><Edit2 size={13}/></button>
                  <button onClick={() => del(p.id)} className="p-2 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 size={13}/></button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
