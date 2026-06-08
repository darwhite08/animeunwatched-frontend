"use client"

import { Sparkles, ShieldCheck } from "lucide-react"
import { useOnboardClub } from "@/hooks/useClubs"

const DEFAULT_RULES = [
  "Be respectful — no harassment or hate.",
  "Stay on topic for this club.",
  "Use spoiler tags for unaired or recent episodes.",
  "No spam or self-promotion.",
]

export function ClubOnboarding({ slug, club, onDone }: { slug: string; club: { name?: string; rules?: string | null; welcomeMessage?: string | null }; onDone: () => void }) {
  const onboard = useOnboardClub(slug)
  const rules = club?.rules ? club.rules.split("\n").filter(Boolean) : DEFAULT_RULES
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/20 text-accent"><Sparkles size={26} /></span>
          <h2 className="mt-3 text-2xl font-black uppercase italic text-foreground">Welcome to {club?.name}</h2>
          {club?.welcomeMessage && <p className="mt-1 text-sm text-muted">{club.welcomeMessage}</p>}
        </div>
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted"><ShieldCheck size={14} /> Club rules</p>
          <ol className="list-decimal space-y-1 pl-4 text-sm text-muted">{rules.map((r, i) => <li key={i}>{r.replace(/^[-*]\s*/, "")}</li>)}</ol>
        </div>
        <button onClick={() => onboard.mutate(undefined, { onSuccess: onDone })} disabled={onboard.isPending} className="mt-5 w-full rounded-xl bg-accent py-3 text-sm font-bold text-black disabled:opacity-50">
          {onboard.isPending ? "…" : "Agree & enter"}
        </button>
      </div>
    </div>
  )
}
