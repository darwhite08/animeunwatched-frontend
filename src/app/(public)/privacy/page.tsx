import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Kaiveron",
  description: "How Kaiveron handles your data, privacy, and security.",
}

const SECTIONS = [
  {
    title: "Data We Collect",
    content: "We collect information you provide directly: account details (email, username, display name), content you create (posts, reviews, anime lists), and usage data (pages visited, features used). We do not sell your data to third parties. Ever.",
  },
  {
    title: "How We Use It",
    content: "Your data powers your experience: anime recommendations, streak tracking, community features, and personalized discovery. We use aggregate analytics to improve the platform. Your watch history stays private by default — you control what's public.",
  },
  {
    title: "Auth & Tokens",
    content: "Access tokens are short-lived (15 minutes) and stored in memory only, never localStorage. Refresh tokens are httpOnly cookies scoped to /api/v1/auth. You can revoke all sessions anytime via Settings → Security → Logout All.",
  },
  {
    title: "Your Rights",
    content: "You can export all your data at any time from Settings → Account → Export Data. You can delete your account permanently — we purge all data within 30 days. You can request corrections to any inaccurate data.",
  },
  {
    title: "Cookies",
    content: "We use exactly one cookie: aw_refresh (httpOnly, secure, SameSite=Lax) for authentication. No tracking cookies. No third-party advertising cookies. No pixel trackers.",
  },
  {
    title: "Contact",
    content: "Privacy questions? Email us at privacy@kaiveron.app. We respond within 48 hours. For data deletion requests, use the in-app Settings page for immediate action.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-4">Legal</p>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white mb-3">
          Privacy Policy<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-sm mb-12">Last updated: May 2026 · We are committed to protecting your data.</p>

        <div className="space-y-10">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="space-y-3">
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                <span className="text-indigo-500/50 font-mono text-sm mr-2">{String(i + 1).padStart(2, "0")}.</span>
                {s.title}
              </h2>
              <p className="text-white/55 leading-relaxed font-medium">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
