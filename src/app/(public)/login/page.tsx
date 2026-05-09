"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { mockLogin } from "@/lib/mockAuth"
import { useLogin } from "@/hooks/useAuth"
import { ApiError } from "@/lib/api/client"

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()

  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null)
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [formError, setFormError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleOAuth = (provider: "google" | "apple") => {
    setOauthLoading(provider)
    setTimeout(() => {
      mockLogin(provider)
      router.push("/")
    }, 600)
  }

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
            if (err.code === "VALIDATION") {
              setFormError("Invalid email or password.")
            } else {
              setFormError(err.message ?? "Something went wrong. Please try again.")
            }
          } else {
            setFormError("Unable to sign in. Please check your connection.")
          }
        },
      }
    )
  }

  const isSubmitting = login.isPending
  const isDisabled = oauthLoading !== null || isSubmitting

  return (
    <main className="relative min-h-screen bg-black text-white flex items-center justify-center px-6">

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[140px] rounded-full" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-10 shadow-[0_0_40px_rgba(99,102,241,0.15)]">

          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-sm text-white/60">
              Continue your anime journey
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="mt-10 space-y-4">

            {/* Google */}
            <motion.button
              onClick={() => handleOAuth("google")}
              disabled={isDisabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Image
                src="/assets/icons/google.png"
                alt="Google"
                width={28}
                height={40}
                priority
                className="object-contain"
              />
              {oauthLoading === "google" ? "Signing in..." : "Continue with Google"}
            </motion.button>

            {/* Apple */}
            <motion.button
              onClick={() => handleOAuth("apple")}
              disabled={isDisabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Image
                src="/assets/icons/apple.png"
                alt="Apple"
                width={30}
                height={40}
                priority
                className="object-contain"
              />
              {oauthLoading === "apple" ? "Signing in..." : "Continue with Apple"}
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

          {/* Email + Password Form */}
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
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
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
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all disabled:opacity-50"
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
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm text-white flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
            >
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Terms */}
          <p className="mt-8 text-xs text-center text-white/40">
            By continuing, you agree to our{" "}
            <span className="text-white/70 hover:text-white transition cursor-pointer">
              Terms
            </span>{" "}
            &{" "}
            <span className="text-white/70 hover:text-white transition cursor-pointer">
              Privacy Policy
            </span>
          </p>
          <p className="mt-6 text-sm text-center text-white/50">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300 transition font-bold"
            >
              Sign up
            </Link>
          </p>
        </div>

      </motion.section>
    </main>
  )
}
