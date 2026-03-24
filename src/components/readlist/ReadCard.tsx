// src/components/readlist/ReadCard.tsx
import { motion } from "framer-motion"
import Image from "next/image"
import { Bookmark, MoreVertical, Play } from "lucide-react"

export const ReadCard = ({ title, author, progress, chapter, status, image }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] overflow-hidden transition-all duration-500 hover:border-indigo-500/30"
    >
      {/* COVER IMAGE WITH OVERLAY */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-75 group-hover:brightness-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-1">{author}</p>
        </div>

        {/* PROGRESS BLOCK */}
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-indigo-400">Chapter {chapter}</span>
            <span className="text-white/40">{progress}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
            />
          </div>
        </div>

        <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-black uppercase tracking-[0.2em] group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
          <Play size={14} fill="currentColor" /> Continue Reading
        </button>
      </div>
    </motion.div>
  )
}