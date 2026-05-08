"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaGoogle, FaApple } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { mockLogin } from "@/lib/mockAuth"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<"google" | "apple" | null>(null)

  const handleLogin = (provider: "google" | "apple") => {
    setLoading(provider)

    // Small delay to simulate real auth feel
    setTimeout(() => {
      mockLogin(provider)
      router.push("/")
    }, 600)
  }

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

          {/* Buttons */}
          <div className="mt-10 space-y-4">

            {/* Google */}
            <motion.button
              onClick={() => handleLogin("google")}
              disabled={loading !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <Image
                src="/assets/icons/google.png"
                alt="AnimeUnwatched Logo"
                width={28}
                height={40}
                priority
                className="object-contain"
              />
              {loading === "google" ? "Signing in..." : "Continue with Google"}
            </motion.button>

            {/* Apple */}
            <motion.button
              onClick={() => handleLogin("apple")}
              disabled={loading !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Image
                src="/assets/icons/apple.png"
                alt="AnimeUnwatched Logo"
                width={30}
                height={40}
                priority
                className="object-contain"
              />
              {loading === "apple" ? "Signing in..." : "Continue with Apple"}
            </motion.button>

          </div>

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
            Don’t have an account?{" "}
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