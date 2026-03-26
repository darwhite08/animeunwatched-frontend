"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, Zap, Clock, Star, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchValue, setSearchValue] = useState("");

  // Close on Escape is already handled by your logic usually, 
  // but let's ensure the UI feels like a native app.
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 100, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#0c0c0c]/80 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Spotlight Input Wrapper */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <Search size={22} className="text-indigo-500" />
              <input
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search archives or type a command..."
                className="w-full bg-transparent border-none outline-none text-xl font-medium text-white placeholder:text-white/20"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-white/30 uppercase tracking-tighter">
                <Command size={10} /> <span>K</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-3 max-h-[400px] overflow-y-auto no-scrollbar">
              
              {/* Category: Commands */}
              {!searchValue && (
                <div className="mb-4">
                  <p className="px-4 py-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Quick Actions</p>
                  <div className="space-y-1">
                    {[
                      { icon: <Zap size={14} />, label: "Jump to Discover", cmd: "G + D" },
                      { icon: <Star size={14} />, label: "View Top Rated", cmd: "G + T" },
                      { icon: <Clock size={14} />, label: "Recently Added", cmd: "G + R" },
                    ].map((item) => (
                      <div key={item.label} className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
                        <div className="flex items-center gap-3 text-white/60 group-hover:text-white">
                          <span className="text-indigo-500/50 group-hover:text-indigo-400">{item.icon}</span>
                          <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                        </div>
                        <span className="text-[9px] font-mono text-white/10 group-hover:text-white/30">{item.cmd}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category: Results / Trending */}
              <div>
                <p className="px-4 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  {searchValue ? "Matching Archives" : "Neural Trending"}
                </p>
                <div className="space-y-1">
                  {["Solo Leveling", "Vagabond", "Cyberpunk Edgerunners", "Monster"].map((term) => (
                    <div key={term} className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-indigo-600/10 cursor-pointer transition-all border border-transparent hover:border-indigo-500/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-indigo-400">
                          <ArrowRight size={14} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-tight text-white/40 group-hover:text-white transition-colors">
                          {term}
                        </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black text-indigo-500 italic">OPEN ARCHIVE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Status Bar */}
            <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between">
               <div className="flex gap-4">
                  <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">↑↓ to navigate</span>
                  <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">↵ to select</span>
               </div>
               <div className="text-[9px] font-black text-indigo-500/40 uppercase tracking-widest animate-pulse">
                  Neural_Link_Ready
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}