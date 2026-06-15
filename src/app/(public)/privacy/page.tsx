import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Kaiveron",
  description: "How Kaiveron handles your data, privacy, and security.",
}

const SECTIONS = [
  {
    title: "Who We Are (Data Fiduciary)",
    content: "Kaiveron is operated by Priyanshu Chandra (Athavita). Under India's Digital Personal Data Protection Act 2023 (DPDP), we are the Data Fiduciary for the personal data you share with us. Contact: info@athavita.com.",
  },
  {
    title: "Data We Collect",
    content: "We collect information you provide directly: account details (email, username, display name, password hashed with argon2id), content you create (posts, reviews, anime lists, comments, blogs), and engagement data (likes, follows, votes). When you use messaging and creator features you may share photos, videos, voice notes, and the audio/video of voice and video calls. On mobile we also process a push-notification token to deliver alerts, and crash/diagnostic logs to keep the app stable. Server logs include request method, path, status code, latency, and an anonymized request ID. We do not sell your data to third parties. Ever.",
  },
  {
    title: "Camera, Microphone & Media",
    content: "Some features need access to your device camera, microphone, and media. We access your camera and microphone only at the moment you start a voice or video call, record a voice note, or capture/upload a photo or video — never in the background. We process and transmit only the media you choose to send; calls are real-time and the media stream is not stored by us beyond what you explicitly post. You can grant or revoke camera, microphone, and photo permissions at any time in your device settings, and the rest of the app keeps working without them.",
  },
  {
    title: "How We Use It",
    content: "Your data powers your experience: anime recommendations, streak tracking, community features, and personalized discovery. We use aggregate analytics to improve the platform. Your watch history stays private by default — you control what's public. Lawful basis under DPDP: consent (for analytics) and contract performance (for the service itself).",
  },
  {
    title: "Auth & Tokens",
    content: "Access tokens are short-lived (15 minutes) and stored in memory only, never localStorage. Refresh tokens are httpOnly cookies scoped to /api/v1/auth, rotated on every use. You can revoke all sessions anytime via Settings → Security → Logout All.",
  },
  {
    title: "Your Rights",
    content: "Under DPDP §11–§14 you have the right to: access (Settings → Privacy → Export Data), correction (Settings → Profile), erasure (Settings → Account → Delete — immediate cascade), and grievance redressal (info@athavita.com, 7-day SLA). You may withdraw analytics consent at any time via the cookie banner; the service still works without it.",
  },
  {
    title: "Cookies & Analytics",
    content: "Strictly necessary: aw_refresh (httpOnly, secure, SameSite=Lax) for authentication. Analytics (optional, requires your consent): Google Analytics 4 with anonymized IP — used to count page views and understand which features are valuable. We do not run advertising cookies, ad pixels, or cross-site trackers.",
  },
  {
    title: "Data Retention",
    content: "We keep your account data while your account is active. On deletion, content is dropped immediately; security/audit logs are anonymized and kept 365 days. Notifications are pruned after 90 days. Backups roll over within 7 days. Full table in our internal data-retention policy.",
  },
  {
    title: "Where Your Data Lives",
    content: "Database: AWS RDS in us-east-1 (North Virginia). App servers: AWS App Runner, us-east-1. Frontend hosting: Vercel global edge. Error tracking: Sentry. All transit is TLS 1.2+ with HSTS preload. Data at rest is encrypted by AWS-managed keys.",
  },
  {
    title: "Children",
    content: "Kaiveron is not directed to children under 13. If you believe a child has registered, email info@athavita.com and we will delete the account.",
  },
  {
    title: "Contact",
    content: "Privacy questions: info@athavita.com. We respond within 48 hours. DPDP §13 grievance officer requests: same address, 7-day SLA.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-4">Legal</p>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground mb-3">
          Privacy Policy<span style={{color:"var(--app-accent)"}}>.</span>
        </h1>
        <p className="text-subtle text-sm mb-12">Last updated: June 2026 · Compliant with India&apos;s Digital Personal Data Protection Act, 2023.</p>

        <div className="space-y-10">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="space-y-3">
              <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                <span className="text-accent/50 font-mono text-sm mr-2">{String(i + 1).padStart(2, "0")}.</span>
                {s.title}
              </h2>
              <p className="text-muted leading-relaxed font-medium">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
