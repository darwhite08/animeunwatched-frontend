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
    setError("")

    // Client-side validation with clear field-specific messages
    if (!form.username.trim()) { setError("Username is required."); return }
    if (form.username.trim().length < 3) { setError("Username must be at least 3 characters."); return }
    if (form.username.trim().length > 30) { setError("Username must be 30 characters or less."); return }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) {
      setError("Username can only contain letters, numbers and underscores (_)."); return
    }
    if (!form.email.trim()) { setError("Email is required."); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address."); return
    }
    if (!form.password) { setError("Password is required."); return }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (form.password.length > 128) { setError("Password must be 128 characters or less."); return }

    register.mutate(
      {
        email:       form.email.trim(),
        username:    form.username.trim(),
        displayName: form.username.trim(),
        password:    form.password,
      },
      {
        onSuccess: () => router.push("/dashboard"),
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.code === "CONFLICT") {
              setError("An account with that email or username already exists. Try signing in instead.")
            } else if (err.code === "VALIDATION") {
              // Extract first meaningful Zod issue if available
              const issues = (err as ApiError & { issues?: Array<{ path: string[]; message: string }> }).issues
              if (issues?.length) {
                const first = issues[0]
                const field = first.path?.[0]
                const fieldLabel = field === "email" ? "Email"
                  : field === "username" ? "Username"
                  : field === "password" ? "Password"
                  : field === "displayName" ? "Display name"
                  : null
                setError(fieldLabel ? `${fieldLabel}: ${first.message}` : first.message)
              } else {
                setError("Please check your details: username (3–30 chars, letters/numbers/_), valid email, password (8+ chars).")
              }
            } else {
              setError(err.message ?? "Something went wrong. Please try again.")
            }
          } else {
            setError("Unable to create account. Please check your connection and try again.")
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
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-600/15 blur-[150px] rounded-full" />
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
          <div className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 20px rgba(245,158,11,0.4)" }}>
            <Sparkles size={18} className="text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">
            KAIVERON<span style={{ color: "#f59e0b" }}>.</span>
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
            {/* Google — redirect flow (works on localhost without Google Console setup) */}
            <motion.a
              href="/api/v1/auth/google/redirect"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-bold"
            >
              <Image src="/assets/icons/google.png" alt="google" width={22} height={22} className="object-contain" />
              Continue with Google
            </motion.a>
            {/* Apple */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleOAuth("apple")}
              disabled={isDisabled}
              className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/assets/icons/apple.png" alt="apple" width={22} height={22} className="object-contain" />
              {oauthLoading === "apple" ? "Connecting…" : "Continue with Apple"}
            </motion.button>
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
                placeholder="shinobi_arch (min. 3 chars)"
                autoComplete="username"
                minLength={3}
                maxLength={30}
                disabled={isDisabled}
                className={`w-full h-12 rounded-2xl bg-white/5 border px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50 ${
                  form.username && form.username.length < 3 ? "border-red-500/50" : "border-white/10"
                }`}
              />
              {form.username.length > 0 && form.username.length < 3 && (
                <p className="text-[11px] text-red-400/80 mt-1 ml-1">
                  {3 - form.username.length} more character{3 - form.username.length > 1 ? "s" : ""} needed
                </p>
              )}
              {form.username.length > 0 && !/^[a-zA-Z0-9_]+$/.test(form.username) && (
                <p className="text-[11px] text-red-400/80 mt-1 ml-1">
                  Only letters, numbers, and underscores allowed
                </p>
              )}
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
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
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
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && form.password.length < 8 && (
                <p className="text-[11px] text-red-400/80 mt-1 ml-1">
                  {8 - form.password.length} more character{8 - form.password.length > 1 ? "s" : ""} needed
                </p>
              )}
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
              className="w-full h-12 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-[11px] uppercase tracking-widest text-black flex items-center justify-center gap-2" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",boxShadow:"0 0 30px rgba(245,158,11,0.35)"}}
            >
              {isSubmitting
                ? <><Loader2 size={15} className="animate-spin" /> Creating Account…</>
                : "Initialize Account"}
            </motion.button>
          </form>

          <p className="mt-6 text-xs text-center text-white/30">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors">Terms</Link>
            {" "}&{" "}
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
          </p>

          <p className="mt-4 text-sm text-center text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.section>
    </main>
    </>
  )
}
