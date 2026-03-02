"use client"

type Manga = {
  title: string
  image: string
  status: string
  totalChapters: number
  readChapters?: number
  progress?: number
  genres: string[]
}

export default function ReadCard({
  manga,
}: {
  manga: Manga
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:border-indigo-500/40 transition">

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={manga.image}
          alt={manga.title}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold">
          {manga.title}
        </h3>

        <span className="text-xs px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400">
          {manga.status}
        </span>

        {manga.readChapters && (
          <p className="text-sm text-white/50">
            Chapter {manga.readChapters} of{" "}
            {manga.totalChapters}
          </p>
        )}

        {manga.progress !== undefined && (
          <div className="space-y-2">
            <div className="h-2 bg-neutral-800 rounded-full">
              <div
                style={{ width: `${manga.progress}%` }}
                className="h-2 bg-indigo-600 rounded-full transition-all"
              />
            </div>
            <p className="text-xs text-white/40">
              {manga.progress}% completed
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {manga.genres.map((genre) => (
            <span
              key={genre}
              className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}