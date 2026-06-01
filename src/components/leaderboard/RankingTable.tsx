// src/components/leaderboard/RankingTable.tsx
import { motion } from "framer-motion"
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react"

export const RankingTable = () => {
  const participants = [
    { rank: 4, name: "Goku_Sama", lvl: 45, xp: "12,400", trend: "up", tags: ["Binger"] },
    { rank: 5, name: "Naruto_Hokage", lvl: 42, xp: "11,900", trend: "down", tags: ["Veteran"] },
    { rank: 812, name: "Priyanshu", lvl: 20, xp: "4,500", trend: "none", isUser: true, tags: ["Pro"] },
  ]

  return (
    <div className="space-y-4">
      {participants.map((player) => (
        <motion.div
          key={player.rank}
          whileHover={{ x: 10 }}
          className={`relative p-1 rounded-[2rem] bg-gradient-to-r transition-all duration-500 ${
            player.isUser ? 'from-indigo-600/50 to-purple-600/50' : 'from-white/5 to-transparent'
          }`}
        >
          <div className="flex items-center justify-between p-6 bg-surface rounded-[1.9rem] border border-border">
            <div className="flex items-center gap-8">
              {/* Rank & Trend */}
              <div className="w-16 flex flex-col items-center">
                <span className={`text-3xl font-black italic ${player.isUser ? 'text-accent-bright' : 'text-subtle'}`}>
                  #{player.rank}
                </span>
                {player.trend === "up" && <TrendingUp size={12} className="text-emerald-500" />}
                {player.trend === "down" && <TrendingDown size={12} className="text-red-500" />}
                {player.trend === "none" && <Minus size={12} className="text-subtle" />}
              </div>

              {/* Identity */}
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-border flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-xl font-bold tracking-tight ${player.isUser ? 'text-foreground' : 'text-muted'}`}>
                      {player.name}
                    </p>
                    {player.isUser && <ShieldCheck size={16} className="text-accent-bright" />}
                  </div>
                  <div className="flex gap-2">
                    {player.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-surface text-muted border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-12">
               <div className="hidden md:block text-center">
                  <p className="text-[10px] font-black text-subtle uppercase tracking-[0.2em]">Mastery</p>
                  <p className="text-xl font-black text-muted italic leading-none">Lvl {player.lvl}</p>
               </div>
               <div className="text-right w-32">
                  <p className="text-[10px] font-black text-accent-bright/50 uppercase tracking-[0.2em]">Experience</p>
                  <p className="text-2xl font-black text-foreground tracking-tighter leading-none">{player.xp}</p>
               </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}