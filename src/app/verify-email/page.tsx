"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MailCheck, Loader2, RotateCw } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { ApiError } from "@/lib/api/client"
import { verifyEmail, resendVerification } from "@/lib/api/endpoints"

const CODE_LEN = 6

export default function VerifyEmailPage() {
  const router = useRouter()
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)
  const sessionReady = useAuthStore(s => s.sessionReady)

  const [digits, setDigits] = useState<string[]>(Array(CODE_LEN).fill(""))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  // Already verified (or arrived without a session) → leave this screen.
  useEffect(() => {
    if (!sessionReady) return
    if (!user) { router.replace("/login"); return }
    if (user.emailVerifiedAt) { router.replace("/onboarding") }
  }, [sessionReady, user, router])

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const code = digits.join("")

  const submit = useCallback(async (full: string) => {
    setError("")
    setSubmitting(true)
    try {
      const { user: updated } = await verifyEmail(full)
      setUser(updated)
      push("Email verified — welcome to Kaiveron!", "success")
      router.push("/onboarding")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not verify the code. Try again."
      setError(msg)
      setDigits(Array(CODE_LEN).fill(""))
      inputs.current[0]?.focus()
    } finally {
      setSubmitting(false)
    }
  }, [push, router, setUser])

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "")
    if (!clean) { setDigits(d => { const n = [...d]; n[i] = ""; return n }); return }
    setDigits(d => {
      const n = [...d]
      // Support typing/pasting multiple chars from one box.
      for (let k = 0; k < clean.length && i + k < CODE_LEN; k++) n[i + k] = clean[k]
      return n
    })
    const next = Math.min(i + clean.length, CODE_LEN - 1)
    inputs.current[next]?.focus()
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LEN)
    if (!text) return
    e.preventDefault()
    const n = Array(CODE_LEN).fill("")
    for (let k = 0; k < text.length; k++) n[k] = text[k]
    setDigits(n)
    inputs.current[Math.min(text.length, CODE_LEN - 1)]?.focus()
  }

  // Auto-submit once all six digits are present.
  useEffect(() => {
    if (code.length === CODE_LEN && /^\d{6}$/.test(code) && !submitting) {
      void submit(code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  async function resend() {
    if (cooldown > 0) return
    try {
      const res = await resendVerification()
      if (res.alreadyVerified) { router.replace("/onboarding"); return }
      push("New code sent — check your inbox.", "success")
      setCooldown(60)
    } catch (err) {
      if (err instanceof ApiError && err.code === "BAD_REQUEST") {
        // Cooldown / not-configured messages come back here.
        push(err.message, "info")
        setCooldown(30)
      } else {
        push(err instanceof ApiError ? err.message : "Could not resend the code.", "error")
      }
    }
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/15 blur-[150px] rounded-full" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="border border-border bg-surface backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_60px_rgba(99,102,241,0.1)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 0 30px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}
            >
              <MailCheck size={28} className="text-black" />
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">
              Confirm your email
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              We sent a 6-digit code to
              {user?.email ? <> <span className="text-foreground font-bold">{user.email}</span>.</> : " your email."}
              {" "}Enter it below to activate your account.
            </p>
          </div>

          <div className="flex justify-center gap-2 sm:gap-3 mb-2" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                value={d}
                onChange={e => setDigit(i, e.target.value)}
                onKeyDown={e => onKeyDown(i, e)}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                disabled={submitting}
                autoFocus={i === 0}
                aria-label={`Digit ${i + 1}`}
                className={`w-12 h-14 sm:w-13 sm:h-15 rounded-2xl bg-surface border text-center text-2xl font-black text-foreground outline-none transition-all focus:border-accent/60 disabled:opacity-50 ${
                  error ? "border-red-500/50" : "border-border"
                }`}
              />
            ))}
          </div>

          {submitting && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted mt-4">
              <Loader2 size={14} className="animate-spin" /> Verifying…
            </div>
          )}

          {error && !submitting && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 font-bold text-center mt-4">
              {error}
            </motion.p>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={resend}
              disabled={cooldown > 0}
              className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw size={13} />
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
            <p className="text-[11px] text-subtle text-center">
              Wrong address?{" "}
              <button
                onClick={() => { useAuthStore.getState().clear(); router.replace("/register") }}
                className="text-accent-bright hover:underline font-bold"
              >
                Start over
              </button>
            </p>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
