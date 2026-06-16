import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Delete Your Account | Kaiveron",
  description: "How to delete your Kaiveron account and what data is removed or retained.",
}

const STEPS = [
  "Open the Kaiveron app (or kaiveron.com) and sign in.",
  "Go to Profile → Settings → Account.",
  "Tap “Delete account”.",
  "Confirm. Your account and associated data are deleted immediately.",
]

const DELETED = [
  "Account profile (email, username, display name, avatar)",
  "Your posts, reels (Shots), comments, threads, and blog content",
  "Anime/manga lists, reviews, ratings, votes, and streak data",
  "Direct messages and group-chat membership you authored",
  "Follows, likes, and other engagement records",
]

const RETAINED = [
  "Security & audit logs are anonymized (no longer linked to you) and kept for up to 365 days for fraud/abuse prevention, as required by law.",
  "Encrypted backups roll over and are purged within 7 days of deletion.",
]

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-4">Kaiveron</p>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground mb-3">
          Delete Your Account<span style={{ color: "var(--app-accent)" }}>.</span>
        </h1>
        <p className="text-subtle text-sm mb-12">
          This page explains how to delete your Kaiveron account and exactly what data is removed.
        </p>

        <div className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
              <span className="text-accent/50 font-mono text-sm mr-2">01.</span>Delete from inside the app
            </h2>
            <ol className="list-decimal space-y-2 pl-6 text-muted font-medium leading-relaxed">
              {STEPS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
              <span className="text-accent/50 font-mono text-sm mr-2">02.</span>Request deletion by email
            </h2>
            <p className="text-muted leading-relaxed font-medium">
              Can&apos;t sign in? Email{" "}
              <a href="mailto:info@athavita.com" className="text-accent-bright underline">
                info@athavita.com
              </a>{" "}
              from the address on your account with the subject &quot;Delete my account&quot;. We verify ownership
              and complete the deletion within 7 days (DPDP grievance SLA).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
              <span className="text-accent/50 font-mono text-sm mr-2">03.</span>What gets deleted
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-muted font-medium leading-relaxed">
              {DELETED.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
              <span className="text-accent/50 font-mono text-sm mr-2">04.</span>What is briefly retained
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-muted font-medium leading-relaxed">
              {RETAINED.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
              <span className="text-accent/50 font-mono text-sm mr-2">05.</span>Questions
            </h2>
            <p className="text-muted leading-relaxed font-medium">
              Contact{" "}
              <a href="mailto:info@athavita.com" className="text-accent-bright underline">
                info@athavita.com
              </a>
              . See our{" "}
              <a href="/privacy" className="text-accent-bright underline">
                Privacy Policy
              </a>{" "}
              for full details on data handling and retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
