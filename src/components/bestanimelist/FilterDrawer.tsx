"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, SlidersHorizontal } from "lucide-react"
import { filterSections } from "./filterData"
import { FilterCheckboxGroup } from "./FilterCheckboxGroup"

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedGenres: string[]
  onGenreToggle: (id: string) => void
  selectedType: string
  onTypeToggle: (id: string) => void
  onReset: () => void
  resultCount: number
}

export default function FilterDrawer({
  isOpen, onClose,
  selectedGenres, onGenreToggle,
  selectedType, onTypeToggle,
  onReset, resultCount,
}: FilterDrawerProps) {
  const genreSection = filterSections.find(s => s.id === "genres")!
  const formatSection = filterSections.find(s => s.id === "format")!
  const statusSection = filterSections.find(s => s.id === "status")!

  const totalActive = selectedGenres.length + (selectedType ? 1 : 0)

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-[#0a0a0a] border-l border-white/10 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <SlidersHorizontal size={16} className="text-indigo-400" />
                <h2 className="text-base font-black text-white uppercase italic tracking-tighter">
                  Refine Results
                </h2>
                {totalActive > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[9px] font-black text-white">
                    {totalActive}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto px-8 no-scrollbar">
              <FilterCheckboxGroup
                title={genreSection.title}
                options={genreSection.options}
                selected={selectedGenres}
                onChange={onGenreToggle}
              />
              <FilterCheckboxGroup
                title={formatSection.title}
                options={formatSection.options}
                selected={selectedType ? [selectedType] : []}
                onChange={onTypeToggle}
              />
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 flex gap-3">
              <button
                onClick={() => { onClose() }}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-colors"
              >
                Show {resultCount} Results
              </button>
              <button
                onClick={() => { onReset(); onClose() }}
                className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors"
                title="Reset filters"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
