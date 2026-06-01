"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Terminal } from "lucide-react";

const FAQS = [
  { 
    id: "01",
    q: "Is the core protocol genuinely free?", 
    a: "The core tracking engine remains free indefinitely. Advanced neural features like the AI Oracle and Custom Holographic Themes require a Prime Grade clearance.",
    clearance: "PUBLIC"
  },
  { 
    id: "02",
    q: "Can I migrate my existing archives?", 
    a: "Affirmative. Our One-Click Neural Sync supports instantaneous imports from MyAnimeList, Anilist, and Kitsu. Zero data loss guaranteed.",
    clearance: "LEVEL_1"
  },
  { 
    id: "03",
    q: "How secure is my personal watchlist?", 
    a: "Your archives are secured via AES-256 encryption. We utilize the same cryptographic protocols as decentralized black-market ledgers. Your data is yours alone.",
    clearance: "RESTRICTED"
  },
  { 
    id: "04",
    q: "How does the Neural Discovery work?", 
    a: "It maps your emotional responses to past viewings against a 30,000+ title vector database to calculate your precise 'Synch Rate' with unseen anime.",
    clearance: "CLASSIFIED"
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first by default for visual weight

  return (
    <section className="relative py-32 px-6 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
      
      {/* Decorative Background Blur */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Left Column: Cinematic Sticky Header */}
      <div className="lg:sticky lg:top-40 flex-1 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500"
        >
          <Terminal size={14} /> Query The Oracle
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-7xl lg:text-[6rem] font-black text-foreground uppercase italic tracking-tighter leading-[0.85]"
        >
          Intelligence <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">Briefing.</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted max-w-sm text-lg font-medium leading-relaxed tracking-tight"
        >
          Decrypting common inquiries regarding the Kaiveron protocol, data sovereignty, and neural syncing.
        </motion.p>
      </div>

      {/* Right Column: Interactive Vault List */}
      <div className="flex-1 w-full max-w-3xl space-y-4 relative z-10">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;

          return (
            <motion.div 
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 bg-background
                ${isOpen ? "border-emerald-500/30 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)]" : "border-border hover:border-border"}
              `}
            >
              {/* Active Glow Background */}
              <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent transition-opacity duration-500 pointer-events-none ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />

              <button 
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full relative z-10 p-6 md:p-8 flex items-center justify-between text-left gap-6"
              >
                <div className="flex flex-col gap-2">
                   <span className={`text-[10px] font-mono tracking-[0.2em] transition-colors ${isOpen ? "text-emerald-500" : "text-subtle"}`}>
                     FILE_{faq.id} // {faq.clearance}
                   </span>
                   <span className={`text-xl md:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${isOpen ? "text-foreground" : "text-muted group-hover:text-foreground"}`}>
                     {faq.q}
                   </span>
                </div>

                {/* Animated Cross Icon */}
                <div className={`shrink-0 h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-500 ${isOpen ? "bg-emerald-500 text-black border-transparent rotate-90" : "bg-transparent text-subtle border-border group-hover:border-white/30 group-hover:text-foreground"}`}>
                   {isOpen ? <X size={20} /> : <Plus size={20} />}
                </div>
              </button>

              {/* The "Decrypted" Answer */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-6 md:px-8 pb-8 pt-0 relative z-10">
                       <div className="h-px w-full bg-gradient-to-r from-emerald-500/20 to-transparent mb-6" />
                       <motion.p 
                         initial={{ y: 10, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         transition={{ delay: 0.1, duration: 0.4 }}
                         className="text-base md:text-lg text-muted leading-relaxed font-medium max-w-2xl"
                       >
                         {faq.a}
                       </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  );
}