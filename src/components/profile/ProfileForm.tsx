"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"

export default function ProfileForm() {
  const [username, setUsername] = useState("OtakuMaster")
  const [email, setEmail] = useState("otaku@anime.com")
  const [bio, setBio] = useState(
    "Lover of shonen and psychological anime."
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-8"
    >
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-semibold">
          OM
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">
          <Upload size={16} />
          Change Avatar
        </button>
      </div>

      {/* Username */}
      <div>
        <label className="text-sm text-white/50">
          Username
        </label>
        <input
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          className="mt-2 w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-sm text-white/50">
          Email
        </label>
        <input
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="mt-2 w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-sm text-white/50">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) =>
            setBio(e.target.value)
          }
          rows={4}
          className="mt-2 w-full rounded-xl bg-neutral-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
        <Stat label="Anime Watched" value="124" />
        <Stat label="On Watchlist" value="38" />
        <Stat label="Top Genre" value="Shonen" />
        <Stat label="Global Rank" value="#812" />
      </div>

      <div className="flex justify-end">
        <button className="rounded-xl bg-indigo-600 px-6 py-3 font-medium hover:bg-indigo-500 transition">
          Save Changes
        </button>
      </div>
    </motion.div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
      <p className="text-sm text-white/50">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  )
}