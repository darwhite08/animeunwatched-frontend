"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { api, ApiError } from "@/lib/api/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.")
      return
    }
    setSubmitting(true)
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      })
      setSent(true)
    } catch (err) {
      // Backend always returns 204 — only fail on rate limit or network error
      if (err instanceof ApiError && err.code === "RATE_LIMITED") {
        setError(err.message)
      } else {
        // Treat anything else as success to avoid leaking which emails exist
        setSent(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors mb-8 group">
          <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Sign In
        </Link>

        <div className="border border-border bg-surface backdrop-blur-xl rounded-3xl p-8">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase italic tracking-tight text-foreground">Check your inbox</h1>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  If <span className="text-foreground">{email}</span> is registered with us, we&apos;ve sent a password reset link. It expires in 1 hour.
                </p>
              </div>
              <p className="text-[10px] text-subtle leading-relaxed">
                Didn&apos;t receive it? Check your spam folder. Still nothing? The email might not be registered.
              </p>
              <Link href="/login" className="inline-block text-xs font-black uppercase tracking-widest text-accent-bright hover:text-accent-bright transition-colors">
                Back to login →
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black uppercase italic tracking-tight text-foreground">Reset Password</h1>
                <p className="text-sm text-muted mt-2">Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-subtle mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                    <input
                      type="email"
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/40 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.01] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 4px 20px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}
                >
                  {submitting ? <Loader2 size={14} className="inline animate-spin mr-2" /> : null}
                  {submitting ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </main>
  )
}
