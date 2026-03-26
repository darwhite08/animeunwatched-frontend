"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Shield, Zap, Share2, Database, Layers } from "lucide-react"

const ROW_1 = [
  { title: "Zoro: The Ronin", type: "Seinen", status: "Completed", img: "/assets/png/zoro.png" },
  { title: "Tanjiro: Sun Breath", type: "Shonen", status: "Watching", img: "/assets/png/tanjiro.png" },
  { title: "Goku: Ultra Instinct", type: "Shonen", status: "Completed", img: "/assets/png/goku.png" },
  { title: "Luffy: Gear 5", type: "Shonen", status: "Watching", img: "/assets/png/luffy.png" },
]

const ROW_2 = [
  { title: "Rengoku: Flame Hashira", type: "Action", status: "Legendary", img: "/assets/png/rengoku_with_sword.png" },
  { title: "Zoro: Onigashima", type: "Epic", status: "Archived", img: "/assets/png/zoro_on_ponoglif.png" },
  { title: "Luffy: Pirate King", type: "Adventure", status: "Ongoing", img: "/assets/png/luffy_sitting.png" },
  { title: "Tanjiro: Final Selection", type: "Dark Fantasy", status: "Logged", img: "/assets/png/tanjiro.png" },
]

export default function Showcase() {
  return (
    <section className="py-32 bg-black relative overflow-hidden border-y border-white/5">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-[1440px] mx-auto px-8 space-y-20 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">
              <Layers size={14} /> The Archive Gallery • Live Feed
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white leading-none">
              Visual <span className="italic text-indigo-500">Repository.</span>
            </h2>
          </div>
          <p className="text-white/30 text-sm font-medium max-w-sm md:text-right leading-relaxed italic">
            Every chronicle you track is transformed into a high-fidelity digital asset within your private vault.
          </p>
        </div>

        {/* DUAL-TRACK MARQUEE */}
        <div className="space-y-8">
          {/* Row 1: Moving Left */}
          <MarqueeRow items={ROW_1} direction={-1} speed={30} />
          
          {/* Row 2: Moving Right */}
          <MarqueeRow items={ROW_2} direction={1} speed={35} />
        </div>

        {/* FEATURE HIGHLIGHT STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-white/5">
          <HighlightItem 
            icon={Shield} 
            title="Metadata Integrity" 
            desc="We pull ultra-high-res assets and deep-link metadata for every entry." 
          />
          <HighlightItem 
            icon={Zap} 
            title="Instant Synchronization" 
            desc="Log an episode on mobile; see the archive update in 40ms globally." 
          />
          <HighlightItem 
            icon={Share2} 
            title="Universal Export" 
            desc="Your data belongs to you. Export your entire legacy in clean JSON anytime." 
          />
        </div>
      </div>
    </section>
  )
}

function MarqueeRow({ items, direction, speed }: { items: any[], direction: number, speed: number }) {
  // Triple the items for a truly seamless infinite loop
  const loopItems = [...items, ...items, ...items]

  return (
    <div className="flex overflow-hidden group">
      <motion.div 
        animate={{ x: direction > 0 ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap"
      >
        {loopItems.map((item, i) => (
          <div 
            key={i} 
            className="relative h-[450px] w-[320px] rounded-[3rem] border border-white/10 bg-[#080808] overflow-hidden group/card"
          >
            <Image 
              src={item.img} 
              alt={item.title} 
              fill 
              className="object-cover grayscale-[40%] group-hover/card:grayscale-0 group-hover/card:scale-110 transition-all duration-700" 
            />
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
            
            {/* Card Content */}
            <div className="absolute bottom-8 left-8 right-8 space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                  {item.type}
                </span>
                <span className="text-[10px] font-bold text-white/40 italic">{item.status}</span>
              </div>
              <h4 className="text-2xl font-black text-white tracking-tighter leading-tight">{item.title}</h4>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function HighlightItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-4 group">
      <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <h5 className="text-lg font-black text-white tracking-tight uppercase italic">{title}</h5>
        <p className="text-white/30 text-xs font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}