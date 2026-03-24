// src/components/leaderboard/TopThree.tsx
import { motion } from "framer-motion"
import Image from "next/image"
import { Crown } from "lucide-react"

export const TopThree = () => {
  const ranks = [
    { pos: 2, name: "Zoro_Main", xp: "18,400", img: "/assets/png/zoro.png", delay: 0.2 },
    { pos: 1, name: "Priyanshu", xp: "24,100", img: "/assets/png/tanjiro.png", delay: 0 },
    { pos: 3, name: "Luffy_San", xp: "15,900", img: "/assets/png/luffy.png", delay: 0.4 },
  ]

  return (
    <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-4 max-w-5xl mx-auto">
      {ranks.map((user) => (
        <motion.div
          key={user.pos}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: user.delay, duration: 0.8 }}
          className={`relative w-full group ${
            user.pos === 1 ? 'md:z-20 md:-translate-y-12' : 'md:z-10'
          }`}
        >
          {/* Winner's Crown */}
          {user.pos === 1 && (
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-14 left-1/2 -translate-x-1/2 text-yellow-500"
            >
              <Crown size={48} fill="currentColor" strokeWidth={1} className="drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            </motion.div>
          )}

          <div className={`relative p-8 rounded-[3.5rem] border transition-all duration-700 overflow-hidden ${
            user.pos === 1 
              ? 'bg-gradient-to-b from-indigo-500/20 to-black border-indigo-500/40 py-16' 
              : 'bg-[#0a0a0a] border-white/5 py-12'
          }`}>
            {/* Shimmer effect for Rank 1 */}
            {user.pos === 1 && (
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="relative h-32 w-32 md:h-40 md:w-40">
                <div className={`absolute inset-0 rounded-[2.5rem] rotate-6 group-hover:rotate-0 transition-transform duration-500 border-2 ${
                   user.pos === 1 ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-white/10'
                }`} />
                <div className="relative h-full w-full rounded-[2.2rem] overflow-hidden bg-zinc-900 border border-white/10">
                  <Image src={user.img} alt={user.name} fill className="object-cover" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className={`text-2xl font-black tracking-tighter ${user.pos === 1 ? 'text-white' : 'text-white/60'}`}>
                  {user.name}
                </p>
                <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">{user.xp} XP</p>
              </div>

              <div className={`px-6 py-2 rounded-2xl bg-black border border-white/10 font-black italic text-xl ${
                user.pos === 1 ? 'text-yellow-500 border-yellow-500/20' : 'text-white/20'
              }`}>
                #{user.pos}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}