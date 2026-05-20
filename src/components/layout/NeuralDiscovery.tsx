"use client";

import { motion } from "framer-motion";
import { Cpu, ScanEye, Activity } from "lucide-react";
import AIPromptInput from "../ai-discover/AIPromptInput";

export default function NeuralDiscovery() {
  return (
    <section className="py-32 bg-[#030303] relative overflow-hidden border-y border-white/[0.03]">
      {/* 1. DYNAMIC ARCHITECTURAL GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      {/* 2. BREATHING VOLUMETRIC GLOWS */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600 blur-[140px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700 blur-[150px] rounded-full pointer-events-none"
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          
          {/* High-End Status Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
            <span className="text-amber-300 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
              <Cpu size={14} className="text-amber-400" /> Neural Engine V4.0
            </span>
          </motion.div>

          {/* Typography hierarchy matching the Hero/Showcase */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]"
          >
            QUERY THE <br className="md:hidden" />
            <span className="relative inline-block italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 animate-shimmer bg-[length:200%_auto] pr-2">
              UNSEEN.
              {/* Text reflection/inner glow */}
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400/40 via-purple-300/40 to-indigo-400/40 blur-lg pointer-events-none">
                UNSEEN.
              </span>
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="text-white/50 max-w-2xl text-sm md:text-lg font-medium leading-relaxed"
          >
            Stop searching by generic tags. Start searching by <span className="text-white/90 italic font-bold">soul</span>. Define complex character scenarios and let our neural interface find your exact obsession.
          </motion.p>
        </div>
        
        {/* PROMPTER CONTAINER (The "HUD") */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, type: "spring", stiffness: 50, damping: 20 }}
          className="relative w-full mt-12 mx-auto max-w-4xl"
        >
          {/* Tactical HUD Crosshairs */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-indigo-500/50 hidden md:block" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-indigo-500/50 hidden md:block" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-indigo-500/50 hidden md:block" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-indigo-500/50 hidden md:block" />
          
          {/* Top Meta Bar */}
          <div className="absolute -top-8 right-0 text-[10px] font-mono text-amber-300/60 tracking-[0.2em] uppercase flex items-center gap-3 hidden md:flex">
            <ScanEye size={14} className="text-amber-400" />
            <span>Pattern Recognition: <span className="text-amber-400 font-bold">Active</span></span>
          </div>

          {/* The Input Component wrapped in an elegant glass pane */}
          <div className="relative z-10 p-2 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.03] shadow-[0_0_50px_-12px_rgba(79,70,229,0.15)] backdrop-blur-2xl">
             <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/5 pointer-events-none" />
             <AIPromptInput /> 
          </div>

          {/* Bottom Meta Bar */}
          <div className="absolute -bottom-8 left-0 text-[10px] font-mono text-amber-300/60 tracking-[0.2em] uppercase flex items-center gap-3 hidden md:flex">
            <Activity size={14} className="text-amber-400 animate-pulse" />
            <span>Syncing with Global Archives...</span>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}