"use client"

const leaders = [
  {
    id: 1,
    name: "OtakuMaster",
    points: 5675,
    watched: 124,
    avatar: "/assets/png/goku.png",
  },
  {
    id: 2,
    name: "AnimeSensei",
    points: 5443,
    watched: 118,
    avatar: "/assets/png/luffy.png",
  },
  {
    id: 3,
    name: "ShonenKing",
    points: 4362,
    watched: 97,
    avatar: "/assets/png/naruto.png",
  },
]

export default function TopThree() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {leaders.map((user, index) => (
        <div
          key={user.id}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col items-center text-center hover:border-indigo-500/40 transition"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="h-20 w-20 rounded-full object-cover border border-white/20"
          />

          <p className="mt-4 font-semibold">
            {user.name}
          </p>

          <p className="text-indigo-400 text-lg font-semibold mt-1">
            {user.points} pts
          </p>

          <p className="text-white/50 text-sm mt-1">
            {user.watched} anime watched
          </p>

          <span className="mt-4 text-xs px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400">
            Rank #{index + 1}
          </span>
        </div>
      ))}

    </div>
  )
}