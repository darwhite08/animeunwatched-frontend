"use client"

export default function GenreCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h2 className="text-white/60 text-sm mb-4">
        Top Genres
      </h2>

      <div className="space-y-3">
        <GenreBar name="Shonen" percent={70} />
        <GenreBar name="Fantasy" percent={55} />
        <GenreBar name="Psychological" percent={40} />
      </div>
    </div>
  )
}

function GenreBar({
  name,
  percent,
}: {
  name: string
  percent: number
}) {
  return (
    <div>
      <div className="flex justify-between text-sm text-white/50">
        <span>{name}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full mt-1">
        <div
          style={{ width: `${percent}%` }}
          className="h-2 bg-indigo-600 rounded-full"
        />
      </div>
    </div>
  )
}