"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Terminal, Crosshair, Cpu } from "lucide-react";

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Scale the massive text down slightly as it comes into view for a "settling" gravity effect
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020202] py-32"
    >
      {/* 1. ARCHITECTURAL GRID & NOISE */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        {/* Film Grain for an organic, cinematic feel */}
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      {/* 2. THE INDIGO EVENT HORIZON */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[500px] bg-indigo-600/10 blur-[150px] rounded-[100%] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* 3. FOUR-CORNER CROSSHAIRS (HUD Detail) */}
      <div className="absolute inset-8 pointer-events-none hidden md:block">
        <Crosshair size={24} className="absolute top-0 left-0 text-white/20" />
        <Crosshair size={24} className="absolute top-0 right-0 text-white/20" />
        <Crosshair size={24} className="absolute bottom-0 left-0 text-white/20" />
        <Crosshair size={24} className="absolute bottom-0 right-0 text-white/20" />
      </div>

      {/* 4. CONTENT PAYLOAD */}
      <motion.div 
        style={{ scale, y, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center"
      >
        {/* Pre-Title Status */}
        <div className="flex items-center gap-3 mb-12">
          <div className="flex h-2 w-2 relative">
             <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75" />
             <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.4em] text-amber-400 uppercase">
            Global_Sync_Available // V.4.0
          </span>
        </div>

        {/* Massive Viewport Typography */}
        <h2 className="text-[12vw] md:text-[10rem] font-black tracking-tighter leading-[0.75] uppercase italic text-white mix-blend-plus-lighter">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">Legend</span><br />
          <span className="relative inline-block">
            {/* Inner text glow */}
            <span className="absolute -inset-4 bg-indigo-500/30 blur-2xl rounded-full opacity-60 animate-pulse pointer-events-none" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              Starts Here.
            </span>
          </span>
        </h2>

        {/* Technical Subtitle */}
        <p className="mt-16 text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed tracking-tight uppercase">
          Abandon the scattered lists. Join <span className="text-white">12,402 active Shinobi</span> currently archiving their legacy on the Neural Network.
        </p>

        {/* The Action Trigger */}
        <div className="mt-20 relative group cursor-pointer">
          {/* Outer Rotating Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-[spin_4s_linear_infinite]" style={{ animationPlayState: 'paused' }} />
          
          <button className="relative flex items-center gap-6 px-10 py-6 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 group-hover:bg-white group-hover:border-transparent group-hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            
            {/* Left Icon Block */}
            <div className="flex items-center justify-center text-indigo-500 group-hover:text-black transition-colors duration-500">
               <Terminal size={24} />
            </div>

            {/* Main Text */}
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-black text-white/40 group-hover:text-black/40 uppercase tracking-[0.3em] transition-colors duration-500">
                Execute Command
              </span>
              <span className="text-xl font-black text-white group-hover:text-black uppercase tracking-tight transition-colors duration-500">
                Initialize Protocol
              </span>
            </div>

            {/* Right Arrow Block */}
            <div className="ml-4 h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500 transform group-hover:translate-x-2">
               <ArrowRight size={20} className="text-white group-hover:text-white" />
            </div>
            
            {/* Shimmer Line */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </div>

        {/* Post-Action Status HUD */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-[9px] font-mono tracking-[0.2em] text-white/20 uppercase">
          <span className="flex items-center gap-2"><Cpu size={12}/> Hardware Accelerated</span>
          <span>Latency: 12ms</span>
          <span>Encryption: AES-256</span>
        </div>
      </motion.div>
    </section>
  );
}