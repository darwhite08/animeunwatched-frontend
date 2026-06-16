import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Child Safety Standards | Kaiveron",
  description:
    "Kaiveron's standards against child sexual abuse and exploitation (CSAE), how to report concerns, and how we comply with child safety laws.",
}

const SECTIONS = [
  {
    title: "Our Commitment",
    content:
      "Kaiveron has zero tolerance for child sexual abuse and exploitation (CSAE) and child sexual abuse material (CSAM). We prohibit any content, conduct, or contact that sexualizes, endangers, or exploits minors. This page sets out our child safety standards as required by Google Play's Child Safety Standards policy.",
  },
  {
    title: "Prohibited Conduct",
    content:
      "The following are strictly forbidden and result in immediate removal and account termination: child sexual abuse material; sexualization of minors in text, images, or video; grooming, solicitation, or sextortion of minors; trafficking or endangerment of children; and any attempt to use the platform to contact minors for harmful purposes. We report apparent CSAM to the relevant authorities and the National Center for Missing & Exploited Children (NCMEC) or equivalent bodies as required by law.",
  },
  {
    title: "Age Requirement",
    content:
      "Kaiveron is intended for users aged 13 and over and is not directed to children under 13. Accounts found to belong to children under 13 are removed. We do not knowingly collect personal data from children under 13.",
  },
  {
    title: "How We Prevent and Detect Abuse",
    content:
      "We combine user reporting, account moderation, and content review to detect and act on child-safety violations. Users can report any post, profile, message, or community, and can block other users. Reports involving child safety are prioritized for urgent review and removal.",
  },
  {
    title: "How to Report a Child Safety Concern",
    content:
      "Inside the app, use the Report option on any post, profile, comment, or conversation (and Block to stop contact). To report CSAE/CSAM or any child-safety concern directly to our team, email aws@kaiveron.com with the subject \"Child Safety\". We review and act on these reports urgently and escalate to law enforcement where appropriate.",
  },
  {
    title: "Legal Compliance",
    content:
      "We comply with applicable child safety laws in the jurisdictions where we operate, including obligations to preserve and report apparent CSAM. We cooperate with law enforcement and authorized child-protection organizations on lawful requests.",
  },
  {
    title: "Point of Contact",
    content:
      "Child safety point of contact: aws@kaiveron.com. For general privacy questions see our Privacy Policy. We respond to child-safety reports as a priority.",
  },
]

export default function ChildSafetyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-4">Safety</p>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground mb-3">
          Child Safety Standards<span style={{ color: "var(--app-accent)" }}>.</span>
        </h1>
        <p className="text-subtle text-sm mb-12">
          Our standards against child sexual abuse and exploitation (CSAE), per Google Play&apos;s Child Safety
          Standards policy. Last updated: June 2026.
        </p>

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
