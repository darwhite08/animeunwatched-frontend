"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, Command, Terminal,Cpu } from "lucide-react"

const suggestions = [
  "Overpowered MC who hides strength",
  "Dark psychological thriller under 24 episodes",
  "Romance with happy ending",
  "Underrated hidden gems",
  "Anime like Demon Slayer but darker"
]

export default function AIPromptInput() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    // Simulate API Call
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto group">
      {/* Outer Glow Decoration */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[2rem] blur-xl transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[1.8rem] p-2 backdrop-blur-3xl shadow-2xl">
        
        {/* Top Navigation Bar Style Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-2 text-indigo-400">
              <Terminal size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural_Query_Interface</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/20 text-[10px] font-mono">
            <Command size={10} /> <span className="tracking-tighter">SHIFT + ENTER</span>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            {/* The Textarea */}
            <textarea
              value={prompt}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Query the archives... (e.g. 'Seinen with philosophical depth')"
              rows={3}
              className="w-full bg-transparent border-none rounded-xl p-4 text-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-0 resize-none font-medium leading-relaxed"
            />
            
            {/* Animated Scan Line (Only shows when focused) */}
            <AnimatePresence>
              {isFocused && (
                <motion.div 
                  initial={{ top: 0, opacity: 0 }}
                  animate={{ top: "100%", opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Prompt Suggestions with Staggered Entrance */}
          <div className="flex flex-wrap gap-2 mt-4 px-2">
            {suggestions.map((text, i) => (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={text}
                onClick={() => setPrompt(text)}
                className="group/btn relative px-3 py-1.5 text-[11px] font-bold rounded-lg border border-white/5 text-white/40 hover:text-indigo-400 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-500/0 group-hover/btn:bg-indigo-500/10 transition-colors" />
                <span className="relative z-10 uppercase tracking-wider">{text}</span>
              </motion.button>
            ))}
          </div>

          {/* The Action Button */}
          <div className="mt-6 flex items-center justify-end gap-4 px-2">
            <div className="flex-1 hidden md:block">
               <div className="flex items-center gap-4 text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">
                  <Cpu size={12} />
                  <span>Hardware Acceleration: ON</span>
                  <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-50, 50] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }} 
                      className="h-full w-4 bg-indigo-500/40" 
                    />
                  </div>
               </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="relative group/submit overflow-hidden px-8 py-3 bg-indigo-600 disabled:opacity-50 rounded-xl transition-all"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/submit:animate-shimmer" />
              
              <div className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="text-xs font-black text-white uppercase tracking-widest italic">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-xs font-black text-white uppercase tracking-widest italic">Execute Search</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}