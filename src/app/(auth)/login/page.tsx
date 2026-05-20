"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useLogin } from "@/hooks/useAuth"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { ApiError, api } from "@/lib/api/client"
import { connectSocket } from "@/lib/socket"
import { useQueryClient } from "@tanstack/react-query"
import type { User } from "@/lib/api/types"

/* ── Types injected by Google / Apple SDKs ────────────────────────────── */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void
          prompt: (n?: (ntf: { isNotDisplayed(): boolean; isSkippedMoment(): boolean }) => void) => void
          cancel: () => void
          renderButton: (el: HTMLElement, opts: object) => void
        }
      }
    }
    AppleID?: {
      auth: {
        init:   (cfg: object) => void
        signIn: () => Promise<{
          authorization: { id_token: string; code: string }
          user?: { name?: { firstName?: string; lastName?: string }; email?: string }
        }>
      }
    }
  }
}

export default function LoginPage() {
  const router  = useRouter()
  const login   = useLogin()
  const { push } = useToast()
  const setAccess = useAuthStore(s => s.setAccess)
  const setUser   = useAuthStore(s => s.setUser)

  const qc = useQueryClient()

  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null)
  const [form, setForm]   = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [formError, setFormError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  /* ── Shared: called after any OAuth provider succeeds ─────────────── */
  function handleOAuthSuccess(user: User, accessToken: string) {
    setAccess(accessToken)
    setUser(user)
    connectSocket(accessToken)
    qc.invalidateQueries({ queryKey: ["auth/me"] })
    router.push("/dashboard")
  }

  /* ── Google — renderButton (stays on login page, no redirect) ──────── */
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Trigger Google's hidden rendered button — works on desktop + mobile without leaving the page
  const handleGoogleLogin = () => {
    setOauthLoading("google")
    const btn = googleBtnRef.current?.querySelector<HTMLElement>('[role="button"],button,div[tabindex="0"]')
    if (btn) { btn.click(); return }
    // Fallback: prompt — clears loading state if user dismisses the dialog
    window.google?.accounts.id.prompt((notification: { isNotDisplayed(): boolean; isSkippedMoment(): boolean }) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setOauthLoading(null)
      }
    })
  }

  /* ── Apple ─────────────────────────────────────────────────────────── */
  const handleAppleLogin = async () => {
    if (!process.env.NEXT_PUBLIC_APPLE_CLIENT_ID) {
      push("Apple Sign In is not configured (NEXT_PUBLIC_APPLE_CLIENT_ID missing)", "error")
      return
    }
    if (!window.AppleID) {
      push("Apple Sign In SDK not loaded", "error")
      return
    }

    try {
      setOauthLoading("apple")

      window.AppleID.auth.init({
        clientId:    process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
        scope:       "name email",
        redirectURI: window.location.origin + "/login",
        usePopup:    true,
      })

      const data = await window.AppleID.auth.signIn()

      const result = await api<{ accessToken: string; user: User }>("/auth/apple", {
        method: "POST",
        body:   JSON.stringify({
          idToken:   data.authorization.id_token,
          email:     data.user?.email,
          firstName: data.user?.name?.firstName,
          lastName:  data.user?.name?.lastName,
        }),
      })
      handleOAuthSuccess(result.user, result.accessToken)
    } catch (err) {
      if ((err as { error?: string })?.error !== "popup_closed_by_user") {
        const msg = err instanceof ApiError ? err.message : "Apple sign-in failed"
        push(msg, "error")
      }
    } finally {
      setOauthLoading(null)
    }
  }

  /* ── Email / password ───────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) {
      setFormError("Email and password are required.")
      return
    }
    setFormError("")
    login.mutate(
      { email: form.email, password: form.password },
      {
        onSuccess: () => router.push("/dashboard"),
        onError: (err) => {
          if (err instanceof ApiError) {
            setFormError(err.code === "VALIDATION"
              ? "Invalid email or password."
              : (err.message ?? "Something went wrong. Please try again."))
          } else {
            setFormError("Unable to sign in. Please check your connection.")
          }
        },
      }
    )
  }

  const isSubmitting = login.isPending
  const isDisabled   = oauthLoading !== null || isSubmitting

  return (
    <>
      {/* Google Identity Services — renderButton keeps user on this page */}
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
                const msg = err instanceof ApiError ? err.message : "Google sign-in failed"
                push(msg, "error")
              } finally {
                setOauthLoading(null)
              }
            },
            // FedCM: native browser prompt with no redirect, no third-party cookies needed
            use_fedcm_for_prompt: true,
            itp_support: true,
          })
          // Render Google's button in hidden container — our custom button triggers it
          if (googleBtnRef.current) {
            window.google?.accounts.id.renderButton(googleBtnRef.current, {
              type: "standard",
              theme: "filled_black",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 400,
            })
          }
        }}
      />
      {/* Apple ID JS SDK */}
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
      />

      <main className="relative min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-600/20 blur-[140px] rounded-full" />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-10"
            style={{ boxShadow: "0 0 40px rgba(245,158,11,0.1), 0 20px 60px rgba(0,0,0,0.5)" }}>

            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="52" height="52"
                style={{ filter: "drop-shadow(0 0 16px rgba(245,158,11,0.4))" }}>
                <defs>
                  <linearGradient id="loginKGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24"/>
                    <stop offset="100%" stopColor="#f59e0b"/>
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="22" fill="#0A0F1E"/>
                <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
                  fill="url(#loginKGold)"/>
              </svg>
              <div className="text-center">
                <p className="text-lg font-black tracking-tight text-white uppercase italic">
                  KAIVERON<span style={{ color: "#f59e0b" }}>.</span>
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25 mt-0.5">
                  Neural Anime Archive
                </p>
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-black tracking-tighter text-white italic uppercase">
                Welcome Back
              </h1>
              <p className="text-sm text-white/50">Continue your anime journey</p>
            </div>

            {/* Hidden Google renderButton container — our visible button triggers it */}
            <div ref={googleBtnRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1, overflow: "hidden" }} aria-hidden />

            {/* OAuth Buttons */}
            <div className="mt-10 space-y-4">

              {/* Google — redirect flow (works on localhost without Google Console setup) */}
              <motion.a
                href="/api/v1/auth/google/redirect"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {false
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                  : <>
                      <Image src="/assets/icons/google.png" alt="Google" width={20} height={20} className="object-contain" />
                      Continue with Google
                    </>
                }
              </motion.a>

              {/* Apple */}
              <motion.button
                onClick={handleAppleLogin}
                disabled={isDisabled}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {oauthLoading === "apple"
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                  : <>
                      <Image src="/assets/icons/apple.png" alt="Apple" width={18} height={18} className="object-contain invert" />
                      Continue with Apple
                    </>
                }
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-8 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 uppercase tracking-widest font-semibold">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email + password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@domain.com"
                  autoComplete="email"
                  disabled={isDisabled}
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Your password"
                    autoComplete="current-password"
                    disabled={isDisabled}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
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

              {formError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 font-bold"
                >
                  {formError}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isDisabled}
                className="w-full h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm text-black flex items-center justify-center gap-2 focus:outline-none" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",boxShadow:"0 0 30px rgba(245,158,11,0.35)"}}
              >
                {isSubmitting
                  ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
                  : "Sign In"
                }
              </motion.button>
            </form>

            <p className="mt-8 text-xs text-center text-white/40">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-white/70 hover:text-white transition">Terms</Link>{" "}
              &{" "}
              <Link href="/privacy" className="text-white/70 hover:text-white transition">Privacy Policy</Link>
            </p>
            <p className="mt-6 text-sm text-center text-white/50">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-amber-400 hover:text-amber-300 transition font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </motion.section>
      </main>
    </>
  )
}
