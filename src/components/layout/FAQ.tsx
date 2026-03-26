"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const FAQS = [
  { q: "Is it really free?", a: "The core tracking protocol is free forever. Elite features like AI Oracle and Custom Themes are part of Prime Grade." },
  { q: "Can I import from MyAnimeList?", a: "Yes. Our One-Click Sync supports MAL, Anilist, and Kitsu imports instantly." },
  { q: "Is my data secure?", a: "Your archives are encrypted with the same protocols used by the Black Market. Your data belongs to you." },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-32 px-8 max-w-3xl mx-auto space-y-16">
      <h3 className="text-4xl font-black tracking-tighter text-center italic uppercase">Intelligence <span className="text-indigo-500">Briefing</span></h3>
      
      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-3xl border border-white/5 bg-[#080808] overflow-hidden">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-8 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-bold text-white/80">{faq.q}</span>
              {openIndex === i ? <Minus size={20} className="text-indigo-500" /> : <Plus size={20} className="text-white/20" />}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 text-sm text-white/40 leading-relaxed font-medium"
                >
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}