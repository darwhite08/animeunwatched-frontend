"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { MoreVertical, Play, BookOpen } from "lucide-react"
import { useToast } from "@/stores/toast.store"

// We deconstruct 'manga' because the parent page passes 'manga={manga}'
export const ReadCard = ({ manga }: { manga: any }) => {
  const { push } = useToast()
  // Destructure for cleaner code
  const { title, author, progress, status, image, category } = manga;
  const soon = () => push("Manga reading is coming with the next release", "info")

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -12 }}
      className="group relative rounded-[2.8rem] border border-border bg-[#080808] overflow-hidden transition-all duration-700 hover:border-accent/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
    >
      {/* COVER IMAGE WITH DYNAMIC OVERLAY */}
      <div className="relative h-80 w-full overflow-hidden">
        <Image 
          src={image} 
          alt={title} 
          fill 
          priority
          className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.6] group-hover:brightness-100" 
        />
        
        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10" />
        
        {/* Top Badges */}
        <div className="absolute top-6 inset-x-6 flex justify-between items-center z-20">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-border text-[9px] font-black uppercase tracking-[0.2em] text-accent-bright">
            {category || "Archives"}
          </div>
          <button
            type="button"
            onClick={soon}
            aria-label="Manga options (coming soon)"
            className="p-2 bg-black/40 backdrop-blur-md rounded-xl border border-border text-subtle hover:text-foreground transition-all"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Floating Play Icon on Hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-black shadow-[0_0_30px_rgba(79,70,229,0.5)]">
            <BookOpen size={24} />
          </div>
        </div>
      </div>

      {/* CONTENT BLOCK */}
      <div className="p-10 space-y-8 relative">
        {/* Top subtle separator glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-foreground tracking-tighter leading-tight group-hover:text-accent-bright transition-colors">
            {title}
          </h3>
          <p className="text-[11px] font-bold text-subtle uppercase tracking-[0.2em]">{author}</p>
        </div>

        {/* PROGRESS SYSTEM */}
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="text-muted italic">{status}</span>
            <span className="text-foreground">{progress}% Complete</span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden p-[2px] border border-border">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-white/40 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            />
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          type="button"
          onClick={soon}
          className="w-full py-5 rounded-2xl bg-surface border border-border text-[10px] font-black uppercase tracking-[0.3em] text-muted hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-3"
        >
          <Play size={14} fill="currentColor" /> Resume Chapter
        </button>
      </div>
    </motion.div>
  )
}