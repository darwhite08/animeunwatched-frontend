"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { api, ApiError } from "@/lib/api/client"

function ResetPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token  = params.get("token") ?? ""

  const [password,    setPassword]    = useState("")
  const [confirm,     setConfirm]     = useState("")
  const [show,        setShow]        = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [done,        setDone]        = useState(false)
  const [error,       setError]       = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 10) { setError("Password must be at least 10 characters."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    if (!token)               { setError("Missing reset token. Request a new link."); return }

    // Frontend complexity check matches backend
    let classes = 0
    if (/[a-z]/.test(password)) classes++
    if (/[A-Z]/.test(password)) classes++
    if (/[0-9]/.test(password)) classes++
    if (/[^a-zA-Z0-9]/.test(password)) classes++
    if (classes < 3) { setError("Use at least 3 of: lowercase, uppercase, number, special character."); return }

    setSubmitting(true)
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      })
      setDone(true)
      setTimeout(() => router.push("/login"), 2500)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Invalid or expired reset link.")
      } else {
        setError("Something went wrong. Try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-[#020202] text-white flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-600/10 blur-[150px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors mb-8 group">
          <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Sign In
        </Link>

        <div className="border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">Password Reset</h1>
                <p className="text-sm text-white/40 mt-2">Redirecting you to login…</p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">New Password</h1>
                <p className="text-sm text-white/40 mt-2">Choose a strong password (min. 10 chars, 3 character classes).</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/35 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type={show ? "text" : "password"}
                      autoFocus
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
                    />
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/35 mb-1.5">Confirm</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/40 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !token}
                  className="w-full py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.01] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}
                >
                  {submitting ? <Loader2 size={14} className="inline animate-spin mr-2" /> : null}
                  {submitting ? "Resetting…" : "Reset Password"}
                </button>

                {!token && (
                  <p className="text-xs text-amber-400/70 text-center">
                    Missing reset token. <Link href="/forgot-password" className="underline">Request a new link</Link>.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </motion.div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020202] flex items-center justify-center"><Loader2 size={24} className="animate-spin text-amber-400" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
