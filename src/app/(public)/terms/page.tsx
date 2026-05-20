import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Kaiveron",
  description: "Kaiveron terms of service and usage rules.",
}

const SECTIONS = [
  { title: "Acceptance", content: "By using Kaiveron, you agree to these terms. If you don't agree, don't use the service. We may update terms — continued use means acceptance." },
  { title: "Your Account", content: "You're responsible for your account security. Use a strong password. Don't share credentials. We're not liable for unauthorized access due to your negligence. One account per person." },
  { title: "Content Rules", content: "No harassment, hate speech, or illegal content. No spam or automated bot activity. Anime spoilers must be tagged. Content that violates these rules will be removed and accounts may be suspended." },
  { title: "Intellectual Property", content: "Your content remains yours. By posting, you grant us a license to display it on the platform. We don't claim ownership. Anime images and metadata are sourced from Jikan (MyAnimeList API) under their terms." },
  { title: "Creator Content", content: "Creators are responsible for their published content. Plagiarism will result in immediate account suspension. Revenue sharing (when implemented) requires age verification and tax information." },
  { title: "Service Changes", content: "We may modify or discontinue features with reasonable notice. We won't delete your data without 30-day notice. The free tier will always remain free." },
  { title: "Limitation of Liability", content: "We provide the service as-is. We're not liable for data loss (though we back up daily), downtime, or third-party anime platform availability. Maximum liability is limited to the last 12 months of any fees paid." },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-4">Legal</p>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white mb-3">
          Terms of Service<span style={{color:"#f59e0b"}}>.</span>
        </h1>
        <p className="text-white/35 text-sm mb-12">Last updated: May 2026 · Read carefully before using the platform.</p>
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
