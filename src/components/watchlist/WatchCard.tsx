"use client"

type Anime = {
  title: string
  image: string
  status: string
  progress?: number
  totalEpisodes: number
  watchedEpisodes?: number
  genres: string[]
}

export default function WatchCard({
  anime,
}: {
  anime: Anime
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:border-white/20 transition">

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold">
          {anime.title}
        </h3>

        {/* Status Badge */}
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400">
          {anime.status}
        </span>

        {/* Episode Info */}
        {anime.watchedEpisodes && (
          <p className="text-sm text-white/50">
            Episode {anime.watchedEpisodes} of{" "}
            {anime.totalEpisodes}
          </p>
        )}

        {/* Progress */}
        {anime.progress !== undefined && (
          <div className="space-y-2">
            <div className="h-2 bg-neutral-800 rounded-full">
              <div
                style={{ width: `${anime.progress}%` }}
                className="h-2 bg-indigo-600 rounded-full transition-all"
              />
            </div>
            <p className="text-xs text-white/40">
              {anime.progress}% completed
            </p>
          </div>
        )}

        {/* Genres */}
        <div className="flex flex-wrap gap-2 pt-2">
          {anime.genres.map((genre) => (
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