"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react"
import { useRegister } from "@/hooks/useAuth"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { ApiError, api } from "@/lib/api/client"
import { connectSocket } from "@/lib/socket"
import { useQueryClient } from "@tanstack/react-query"
import type { User } from "@/lib/api/types"

// Window.google type is declared in login/page.tsx (shared via global augmentation)

export default function RegisterPage() {
  const router = useRouter()
  const register = useRegister()

  const { push } = useToast()
  const qc = useQueryClient()
  const setAccess = useAuthStore(s => s.setAccess)
  const setUser   = useAuthStore(s => s.setUser)

  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null)
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function handleOAuthSuccess(user: User, accessToken: string) {
    setAccess(accessToken)
    setUser(user)
    connectSocket(accessToken)
    qc.invalidateQueries({ queryKey: ["auth/me"] })
    router.push("/dashboard")
  }

  const handleGoogleRegister = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      push("Google OAuth not configured", "error"); return
    }
    setOauthLoading("google")
    window.google?.accounts.id.prompt((n) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        setOauthLoading(null)
        push("Google sign-up was dismissed. Try again.", "info")
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required.")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setError("")
    register.mutate(
      {
        email: form.email,
        username: form.username,
        displayName: form.username,
        password: form.password,
      },
      {
        onSuccess: () => router.push("/dashboard"),
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.code === "CONFLICT") {
              setError("An account with that email or username already exists.")
            } else if (err.code === "VALIDATION") {
              setError(err.message ?? "Please check your details and try again.")
            } else {
              setError(err.message ?? "Something went wrong. Please try again.")
            }
          } else {
            setError("Unable to create account. Please check your connection.")
          }
        },
      }
    )
  }

  const handleOAuth = (provider: "google" | "apple") => {
    if (provider === "google") { handleGoogleRegister(); return }
    push("Apple Sign In requires credentials — use email for now.", "info")
  }

  const isSubmitting = register.isPending
  const isDisabled = oauthLoading !== null || isSubmitting

  return (
    <>
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        window.google?.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
          callback: async (response: { credential: string }) => {
            try {
              setOauthLoading("google")
              const data = await api<{ accessToken: string; user: User }>("/auth/google", {
                method: "POST",
                body: JSON.stringify({ idToken: response.credential }),
              })
              handleOAuthSuccess(data.user, data.accessToken)
            } catch (err) {
              push(err instanceof ApiError ? err.message : "Google sign-up failed", "error")
            } finally {
              setOauthLoading(null)
            }
          },
        })
      }}
    />
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
                disabled={isDisabled}
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
                disabled={isDisabled}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
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
                disabled={isDisabled}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
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
                  disabled={isDisabled}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
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
              disabled={isDisabled}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-[11px] uppercase tracking-widest text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
            >
              {isSubmitting
                ? <><Loader2 size={15} className="animate-spin" /> Creating Account…</>
                : "Initialize Account"}
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
    </>
  )
}
