"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react"
import { mockLogin } from "@/lib/mockAuth"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null)
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required."); return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return
    }
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    mockLogin("google") // use mock for demo
    router.push("/dashboard")
  }

  const handleOAuth = (provider: "google" | "apple") => {
    setOauthLoading(provider)
    setTimeout(() => { mockLogin(provider); router.push("/dashboard") }, 600)
  }

  return (
    <main className="relative min-h-screen bg-[#020202] text-white flex items-center justify-center px-6 py-20">
      {/* Background glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-700/10 blur-[120px] rounded-full" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">
            UNWATCHED<span className="text-indigo-500">.</span>
          </span>
        </div>

        <div className="border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_60px_rgba(99,102,241,0.1)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Initialize Account
            </h1>
            <p className="text-sm text-white/40 mt-2">Join 12,402 Shinobi on the Neural Network</p>
          </div>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            {(["google", "apple"] as const).map(provider => (
              <motion.button
                key={provider}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleOAuth(provider)}
                disabled={oauthLoading !== null || loading}
                className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image
                  src={`/assets/icons/${provider}.png`}
                  alt={provider}
                  width={22}
                  height={22}
                  className="object-contain"
                />
                {oauthLoading === provider
                  ? "Connecting…"
                  : `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                Username
              </label>
              <input
                value={form.username}
                onChange={set("username")}
                placeholder="shinobi_arch"
                autoComplete="username"
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@domain.com"
                autoComplete="email"
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 font-bold"
              >
                {error}
              </motion.p>
            )}

            {/* Password strength hint */}
            {form.password && (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      form.password.length >= level * 3
                        ? level <= 2 ? "bg-amber-500" : "bg-emerald-500"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-[11px] uppercase tracking-widest text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Creating Account…</> : "Initialize Account"}
            </motion.button>
          </form>

          <p className="mt-6 text-xs text-center text-white/30">
            By registering, you agree to our{" "}
            <span className="text-white/60 hover:text-white transition-colors cursor-pointer">Terms</span>
            {" "}&{" "}
            <span className="text-white/60 hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
          </p>

          <p className="mt-4 text-sm text-center text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.section>
    </main>
  )
}
