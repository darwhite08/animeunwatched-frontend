"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw } from "lucide-react"
import { filterSections } from "./filterData"
import { FilterCheckboxGroup } from "./FilterCheckboxGroup"

export default function FilterDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-[#0a0a0a] border-l border-white/10 z-[101] p-8"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-white uppercase italic italic">Filters</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-200px)] no-scrollbar">
              {filterSections.map((section) => (
                <FilterCheckboxGroup key={section.id} title={section.title} options={section.options} />
              ))}
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex gap-4">
              <button className="flex-1 py-4 bg-indigo-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">Apply</button>
              <button className="p-4 bg-white/5 rounded-xl text-white hover:bg-white/10"><RotateCcw size={16} /></button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}