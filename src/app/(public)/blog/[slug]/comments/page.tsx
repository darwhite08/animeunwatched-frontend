"use client"

import { use, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { MessageSquare, Send, ThumbsUp, ChevronLeft } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"

type Comment = { id: number; author: string; avatar: string; body: string; time: string; likes: number; likedByMe: boolean; replies?: Comment[] }

const MOCK: Comment[] = [
  { id:1, author:"Otaku_Arch", avatar:"O", body:"Incredibly well-written. The section on narrative structure is exactly what I've been thinking but couldn't articulate.", time:"2h ago", likes:18, likedByMe:false, replies:[
    { id:11, author:"ShadowWatcher", avatar:"S", body:"Agreed. The comparison to western animation is particularly insightful.", time:"1h ago", likes:6, likedByMe:true },
  ]},
  { id:2, author:"NeuralBot_X", avatar:"N", body:"Good article but I'd push back on the point about pacing. Some of the 'slow' episodes are what make the emotional payoff work.", time:"3h ago", likes:12, likedByMe:false },
  { id:3, author:"VoidSeeker",  avatar:"V", body:"This is getting shared in our club discussion. Perfect timing — we were just debating this topic.", time:"5h ago", likes:8, likedByMe:false },
  { id:4, author:"CipherRonin", avatar:"C", body:"I'd love to see a follow-up specifically about the music direction and how it affects the emotional beats.", time:"1d ago", likes:24, likedByMe:false },
]

export default function BlogCommentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { push } = useToast()
  const [comments, setComments] = useState(MOCK)
  const [draft, setDraft] = useState("")
  const [liked, setLiked] = useState(new Set(MOCK.filter(c=>c.likedByMe).map(c=>c.id)))

  const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())

  const submit = () => {
    if (!draft.trim()) return
    const u = useAuthStore.getState().user; const name = u?.username ?? "you"; setComments(prev => [{ id: Date.now(), author: name, avatar: name[0]?.toUpperCase() ?? "?", body:draft, time:"just now", likes:0, likedByMe:false }, ...prev])
    setDraft("")
    push("Comment posted!", "success")
  }

  const toggleLike = (id: number) => {
    setLiked(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n })
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-2xl mx-auto px-6 pt-32 space-y-8">
        <div>
          <Link href={`/blog/${slug}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-bright/60 hover:text-foreground transition-colors mb-4">
            <ChevronLeft size={11} /> Back to Article
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-accent-bright" />
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Comments</h1>
            <span className="text-subtle text-sm font-mono">({comments.length})</span>
          </div>
          <p className="text-subtle text-xs truncate">{title}</p>
        </div>

        {/* Compose */}
        <div className="p-5 rounded-2xl bg-surface border border-accent/15 space-y-3">
          <textarea value={draft} onChange={e=>setDraft(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className={`text-[10px] font-mono ${500-draft.length<50?"text-accent-bright":"text-subtle"}`}>{500-draft.length}</span>
            <button onClick={submit} disabled={!draft.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-xs font-black uppercase tracking-wider text-foreground transition-all"
            >
              <Send size={12} /> Post
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          {comments.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0">{c.avatar}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-muted">{c.author}</span>
                    <span className="text-[9px] text-subtle">{c.time}</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{c.body}</p>
                  <button onClick={()=>toggleLike(c.id)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${liked.has(c.id)?"text-emerald-400":"text-subtle hover:text-muted"}`}
                  >
                    <ThumbsUp size={11} fill={liked.has(c.id)?"currentColor":"none"}/>
                    {c.likes + (liked.has(c.id) !== c.likedByMe ? (liked.has(c.id)?1:-1):0)}
                  </button>
                </div>
              </div>

              {/* Nested replies */}
              {c.replies?.map(r => (
                <div key={r.id} className="ml-11 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/50 to-violet-600/50 flex items-center justify-center font-black text-xs shrink-0">{r.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-muted">{r.author}</span>
                      <span className="text-[9px] text-subtle">{r.time}</span>
                    </div>
                    <p className="text-sm text-muted">{r.body}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
