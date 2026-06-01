"use client"

import { useState, useEffect } from "react"
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
  const [refBy, setRefBy] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("ref")
    if (ref) {
      setRefBy(ref)
      // Persist so it survives OAuth redirects
      sessionStorage.setItem("aw_ref", ref)
    } else {
      const stored = sessionStorage.getItem("aw_ref")
      if (stored) setRefBy(stored)
    }
  }, [])
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null)
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function handleOAuthSuccess(user: User, accessToken: string) {
    setAccess(accessToken)
    setUser(user)
    connectSocket(accessToken)
    qc.invalidateQueries({ queryKey: ["auth/me"] })
    // New users go through onboarding (existing users skip via localStorage flag)
    const hasOnboarded = typeof window !== "undefined" && localStorage.getItem("aw_onboarded")
    router.push(hasOnboarded ? "/dashboard" : "/onboarding")
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
        ...(refBy ? { referredBy: refBy } : {}),
      } as Parameters<typeof register.mutate>[0],
      {
        onSuccess: () => router.push("/onboarding"),
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
    <main className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-20">
      {/* Background glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-700/10 blur-[120px] rounded-full" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="52" height="52"
            style={{ filter: "drop-shadow(0 0 16px color-mix(in srgb, var(--app-accent) 40%, transparent))" }}>
            <defs>
              <linearGradient id="registerKGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--app-accent-bright)"/>
                <stop offset="100%" stopColor="var(--app-accent)"/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="22" fill="#0A0F1E"/>
            <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
              fill="url(#registerKGold)"/>
          </svg>
          <div className="text-center">
            <span className="text-xl font-black tracking-tighter uppercase italic text-foreground">
              KAIVERON<span style={{ color: "var(--app-accent)" }}>.</span>
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-subtle mt-0.5">
              Neural Anime Archive
            </p>
          </div>
        </div>

        {refBy && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
              Invited by <span className="text-emerald-300">@{refBy}</span>
            </p>
            <p className="text-[10px] text-emerald-400/60 mt-0.5">You both get bonus XP when you join!</p>
          </div>
        )}

        <div className="border border-border bg-surface backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_60px_rgba(99,102,241,0.1)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">
              Initialize Account
            </h1>
            <p className="text-sm text-muted mt-2">Join 12,402 Shinobi on the Neural Network</p>
          </div>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            {/* Google — redirect flow (works on localhost without Google Console setup) */}
            <motion.a
              href="/api/v1/auth/google/redirect"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full h-12 rounded-2xl border border-border bg-surface hover:bg-surface transition-all flex items-center justify-center gap-3 text-sm font-bold"
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
              className="w-full h-12 rounded-2xl border border-border bg-surface hover:bg-surface transition-all flex items-center justify-center gap-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/assets/icons/apple.png" alt="apple" width={22} height={22} className="object-contain" />
              {oauthLoading === "apple" ? "Connecting…" : "Continue with Apple"}
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-surface" />
            <span className="text-[10px] font-black text-subtle uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-surface" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">
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
                className={`w-full h-12 rounded-2xl bg-surface border px-4 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/50 focus:bg-surface transition-all disabled:opacity-50 ${
                  form.username && form.username.length < 3 ? "border-red-500/50" : "border-border"
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
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@domain.com"
                autoComplete="email"
                disabled={isDisabled}
                className="w-full h-12 rounded-2xl bg-surface border border-border px-4 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/50 focus:bg-surface transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">
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
                  className="w-full h-12 rounded-2xl bg-surface border border-border px-4 pr-12 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/50 focus:bg-surface transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
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
                        ? level <= 2 ? "bg-accent" : "bg-emerald-500"
                        : "bg-surface"
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
              className="w-full h-12 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-[11px] uppercase tracking-widest text-black flex items-center justify-center gap-2" style={{background:"linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))",boxShadow:"0 0 30px color-mix(in srgb, var(--app-accent) 35%, transparent)"}}
            >
              {isSubmitting
                ? <><Loader2 size={15} className="animate-spin" /> Creating Account…</>
                : "Initialize Account"}
            </motion.button>
          </form>

          <p className="mt-6 text-xs text-center text-subtle">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-muted hover:text-foreground transition-colors">Terms</Link>
            {" "}&{" "}
            <Link href="/privacy" className="text-muted hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>

          <p className="mt-4 text-sm text-center text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-bright hover:text-accent-bright font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.section>
    </main>
    </>
  )
}
