"use client"

import { motion } from "framer-motion"

const dummyResults = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  title: `Recommended Anime ${i + 1}`,
  image: "https://source.unsplash.com/400x600/?anime",
  score: (8 + Math.random()).toFixed(1)
}))

export default function AIResultsGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-xl font-semibold mb-8">
        AI Recommendations
      </h2>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } }
        }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        {dummyResults.map((anime) => (
          <motion.div
            key={anime.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-2 right-2 bg-black/80 text-xs px-2 py-1 rounded-full border border-white/10">
                ⭐ {anime.score}
              </div>
            </div>

            <h3 className="mt-3 text-sm font-medium truncate">
              {anime.title}
            </h3>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}