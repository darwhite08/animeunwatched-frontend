"use client"

/**
 * KaiveronLanding — the public "/" marketing page (logged-out visitors only;
 * authed users are redirected to /shots by <LandingGate>).
 *
 * Faithful port of the standalone "Invitation Only" design: a 3-pane hero
 * (Ledger / Seal / Manifest) with a floating switcher, manifesto/creed,
 * real-screen showcase, app + messages sections, stats, FAQ and a request-access
 * gate. The email captures are wired to the real waitlist endpoint; the invite
 * code path forwards to /register?invite=.
 *
 * Self-contained chrome (own nav + footer + atmospheric background) — the
 * (public) layout renders this route bare (no AppShell / Navbar / Footer).
 */

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Sora, JetBrains_Mono } from "next/font/google"
import { useRouter } from "next/navigation"
import { joinWaitlist } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/client"

// Self-hosted (no render-blocking external request, no layout shift). Exposed as
// CSS variables so the ported design CSS can reference them by name.
const sora = Sora({ subsets: ["latin"], weight: ["200", "300", "400", "500", "600", "700", "800"], variable: "--font-sora", display: "swap" })
const jbMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jb", display: "swap" })

const MARK = "/landing/mark.webp"
const WORDMARK = "/landing/wordmark.webp"

/* ── ANIME mega-menu ───────────────────────────────────────────────────── */
type AnimeItem = { icon: IconName; label: string; desc: string; href: string }
const ANIME_MENU: AnimeItem[] = [
  { icon: "browse", label: "Browse All", desc: "All 30,000+ anime", href: "/bestanimelist" },
  { icon: "trailers", label: "Trailers", desc: "Watch anime trailers", href: "/trailers" },
  { icon: "ai", label: "AI Discover", desc: "Neural recommendations", href: "/ai-discover" },
  { icon: "seasonal", label: "Seasonal", desc: "Any year & season", href: "/seasonal" },
  { icon: "calendar", label: "Calendar", desc: "Airing schedule", href: "/calendar" },
  { icon: "top", label: "Top Rated", desc: "Community ranked", href: "/rankings" },
  { icon: "genres", label: "Genres", desc: "Browse by genre", href: "/genres" },
  { icon: "studios", label: "Studios", desc: "Browse by studio", href: "/studios" },
  { icon: "mood", label: "Mood Picker", desc: "Match your vibe", href: "/mood" },
  { icon: "recs", label: "Recommendations", desc: "Picks for you", href: "/recommendations" },
  { icon: "collections", label: "Collections", desc: "Curated lists", href: "/collections" },
]

type IconName =
  | "browse" | "trailers" | "ai" | "seasonal" | "calendar" | "top"
  | "genres" | "studios" | "mood" | "recs" | "collections"

function MenuIcon({ name }: { name: IconName }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (name) {
    case "browse": return <svg viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7" {...p} /><line x1="4" y1="12" x2="20" y2="12" {...p} /><line x1="4" y1="17" x2="14" y2="17" {...p} /></svg>
    case "trailers": return <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" {...p} /><path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" /></svg>
    case "ai": return <svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="11" rx="3" {...p} /><line x1="12" y1="5" x2="12" y2="8" {...p} /><circle cx="12" cy="4" r="1.3" fill="currentColor" stroke="none" /><circle cx="9.5" cy="13" r="1.1" fill="currentColor" stroke="none" /><circle cx="14.5" cy="13" r="1.1" fill="currentColor" stroke="none" /></svg>
    case "seasonal": return <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2.5" {...p} /><line x1="4" y1="9.5" x2="20" y2="9.5" {...p} /><line x1="8.5" y1="3.5" x2="8.5" y2="6.5" {...p} /><line x1="15.5" y1="3.5" x2="15.5" y2="6.5" {...p} /></svg>
    case "calendar": return <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2.5" {...p} /><line x1="4" y1="9.5" x2="20" y2="9.5" {...p} /><path d="M9 14.5l2 2 4-4" {...p} /></svg>
    case "top": return <svg viewBox="0 0 24 24"><path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.5 9.5l5.2-.8z" {...p} /></svg>
    case "genres": return <svg viewBox="0 0 24 24"><path d="M4 13l7-7 8 8-7 7z" {...p} /><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" /></svg>
    case "studios": return <svg viewBox="0 0 24 24"><path d="M4 20V8l7-3v15M11 20h9V11l-9-3" {...p} /><line x1="14.5" y1="12.5" x2="14.5" y2="12.6" {...p} /><line x1="14.5" y1="16" x2="14.5" y2="16.1" {...p} /></svg>
    case "mood": return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" {...p} /><path d="M8.5 14c1 1.3 2.1 2 3.5 2s2.5-.7 3.5-2" {...p} /><line x1="9" y1="10" x2="9" y2="10.1" {...p} /><line x1="15" y1="10" x2="15" y2="10.1" {...p} /></svg>
    case "recs": return <svg viewBox="0 0 24 24"><path d="M12 4l1.3 3.4L17 8.7l-3.7 1.3L12 13.4 10.7 10 7 8.7l3.7-1.3z" {...p} /><path d="M17.5 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" {...p} /></svg>
    case "collections": return <svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5" {...p} /><rect x="13" y="4" width="7" height="7" rx="1.5" {...p} /><rect x="4" y="13" width="7" height="7" rx="1.5" {...p} /><rect x="13" y="13" width="7" height="7" rx="1.5" {...p} /></svg>
  }
}

/* ── Email → waitlist capture (hero panes) ─────────────────────────────── */
function InviteForm({
  source,
  buttonLabel,
  doneText,
  placeholder = "you@domain.com",
  sub,
  onCodeLink,
}: {
  source: string
  buttonLabel: string
  doneText: string
  placeholder?: string
  sub: React.ReactNode
  onCodeLink: () => void
}) {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [member, setMember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || busy) return
    setBusy(true)
    setErr(null)
    try {
      const res = await joinWaitlist(email, source)
      setBusy(false)
      // Already has an account — point them at sign-in, don't fake a signup.
      if (res?.alreadyMember) setMember(true)
      else setDone(true)
    } catch (ex) {
      // Never fake success — a swallowed error means the email was NOT saved.
      // Surface it so the visitor (and shared-IP users) can actually retry.
      setBusy(false)
      setErr(
        ex instanceof ApiError && ex.status === 429
          ? "Too many requests from your network — wait a moment and try again."
          : "Couldn't submit that just now. Please try again.",
      )
    }
  }

  return (
    <form className={`invite anim${done || member ? " done" : ""}`} onSubmit={submit}>
      <div className="row">
        <input
          type="email"
          placeholder={placeholder}
          aria-label="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Sending…" : buttonLabel}
          <span className="arrow">→</span>
        </button>
      </div>
      <div className="sub">
        {sub}
        <a
          href="#gate"
          onClick={() => onCodeLink()}
        >
          Have an invite code?
        </a>
      </div>
      {err && (
        <div
          role="alert"
          style={{ marginTop: 12, fontFamily: "var(--font-jb),monospace", fontSize: 11.5, letterSpacing: ".08em", color: "#F0A35E" }}
        >
          {err}
        </div>
      )}
      <div className="ok">
        <span className="seal" />
        {member ? (
          <span>
            You&rsquo;re already a member —{" "}
            <a href="/login" style={{ textDecoration: "underline" }}>
              sign in
            </a>
            .
          </span>
        ) : (
          doneText
        )}
      </div>
    </form>
  )
}

export default function KaiveronLanding() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [hero, setHero] = useState(1)
  const [animeOpen, setAnimeOpen] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const animeRef = useRef<HTMLDivElement | null>(null)

  // Close the ANIME mega-menu on outside click or Escape.
  useEffect(() => {
    if (!animeOpen) return
    function onDown(e: MouseEvent) {
      if (animeRef.current && !animeRef.current.contains(e.target as Node)) setAnimeOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAnimeOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [animeOpen])

  // Restore the visitor's last-chosen hero variant.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kvrn_hero")
      // Sync from localStorage after first paint (SSR-safe; avoids hydration
      // mismatch by rendering the default pane on the server, then restoring).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setHero(Number(saved))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function focusCode() {
    window.setTimeout(() => {
      document.getElementById("landing-code-input")?.focus()
    }, 520)
  }

  // Decorative orbit dots around the seal mark (pane 2).
  const orbit = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2
    const R = 104
    return {
      x: Math.cos(a) * R - 2,
      y: Math.sin(a) * R - 2,
    }
  })

  return (
    <>
      <style>{CSS}</style>

      <div className={`kvln ${sora.variable} ${jbMono.variable}`}>
        <div className="atmos" aria-hidden="true">
          <div className="grid" />
          <div className="vig" />
          <div className="grain" />
        </div>

        <nav className={`top${scrolled ? " scrolled" : ""}`} id="nav">
          <a className="brand" href="#top">
            <span className="markbox">
              <img src={MARK} alt="" />
            </span>
            <img className="wm" src={WORDMARK} alt="KAIVERON" />
          </a>
          <div className="links">
            <a href="#top">Home</a>
            <div className="navitem" ref={animeRef}>
              <button
                type="button"
                className={`navlink${animeOpen ? " open" : ""}`}
                aria-expanded={animeOpen}
                onClick={() => setAnimeOpen((o) => !o)}
              >
                Anime <span className="caret">▾</span>
              </button>
              {animeOpen && (
                <div className="megamenu" role="menu">
                  {ANIME_MENU.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="megaitem"
                      role="menuitem"
                      onClick={() => setAnimeOpen(false)}
                    >
                      <span className="mi-ic">
                        <MenuIcon name={it.icon} />
                      </span>
                      <span className="mi-tx">
                        <span className="mi-l">{it.label}</span>
                        <span className="mi-d">{it.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/blog">Blog</Link>
            <Link href="/community">Community</Link>
          </div>
          <div className="navright">
            <Link href="/login" className="navsignin">
              Sign in
            </Link>
            <a className="navcta" href="#gate">
              <span className="dot" />
              Request Access
            </a>
          </div>
        </nav>

        <span id="top" />

        <section className="hero" id="hero" ref={heroRef}>
          <div className="glow" />
          <div className="wrap">
            {/* Pane 01 — Ledger */}
            <div className={`hero-pane${hero === 1 ? " active" : ""}`}>
              <div className="ledger">
                <div className="eyebrow anim">
                  <span className="gtick" />
                  Est. 2026 · Admission by invitation
                </div>
                <h1 className="anim">
                  Not another
                  <br />
                  tracker. <span className="fade">An order.</span>
                </h1>
                <p className="lead anim">
                  Kaiveron is a closed community for the seriously devoted — track every series,
                  log every chapter, and earn your standing among fans who actually finish what
                  they start.
                </p>
                <InviteForm
                  source="landing-hero-ledger"
                  buttonLabel="Request an invite"
                  doneText="Request received. Watch your inbox — the door opens quietly."
                  onCodeLink={focusCode}
                  sub={<span>Reviewed within 72 hours.</span>}
                />
                <div className="statline anim">
                  <b>12,402</b> admitted &nbsp;·&nbsp; <span className="gd">8,719</span> on the
                  waitlist
                </div>
              </div>
            </div>

            {/* Pane 02 — Seal */}
            <div className={`hero-pane${hero === 2 ? " active" : ""}`}>
              <div className="seal-pane">
                <div className="sealmark anim">
                  <div className="ring glow" />
                  <div className="ring" />
                  <div className="ring r2" />
                  <div className="orbit">
                    {orbit.map((o, i) => (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "#F7C879",
                          boxShadow: "0 0 8px 1px rgba(245,166,35,.7)",
                          transform: `translate(${o.x}px,${o.y}px)`,
                        }}
                      />
                    ))}
                  </div>
                  <img src={MARK} alt="Kaiveron mark" />
                </div>
                <div className="eyebrow anim" style={{ marginBottom: 6 }}>
                  By invitation only
                </div>
                <h1 className="anim">
                  You were
                  <br />
                  brought here.
                </h1>
                <p className="lead anim">
                  Kaiveron isn&rsquo;t found. It&rsquo;s offered. A private order for the few who
                  treat the canon as something worth keeping.
                </p>
                <InviteForm
                  source="landing-hero-seal"
                  placeholder="Enter your email"
                  buttonLabel="Petition for entry"
                  doneText="Your petition is noted. We'll be in touch."
                  onCodeLink={focusCode}
                  sub={null}
                />
                <div className="statline anim">
                  <b>12,402</b> sworn in &nbsp;·&nbsp; <span className="gd">8,719</span> waiting at
                  the door
                </div>
              </div>
            </div>

            {/* Pane 03 — Manifest */}
            <div className={`hero-pane${hero === 3 ? " active" : ""}`}>
              <div className="manifest-pane">
                <div>
                  <div className="eyebrow anim">
                    <span className="gtick" />
                    The member manifest
                  </div>
                  <h1 className="anim" style={{ marginTop: 24 }}>
                    You don&rsquo;t
                    <br />
                    sign up. You
                    <br />
                    get <span className="fade">vouched in.</span>
                  </h1>
                  <p className="lead anim">
                    Every member was brought in by another. No open registration, no
                    growth-hacking — just a slow chain of people who actually know the work.
                  </p>
                  <InviteForm
                    source="landing-hero-manifest"
                    buttonLabel="Ask to be vouched"
                    doneText="Noted. A member will be asked to vouch."
                    onCodeLink={focusCode}
                    sub={null}
                  />
                </div>
                <div className="dossier anim">
                  <div className="dhead">
                    <span>Members · live</span>
                    <span className="live">
                      <i />
                      recording
                    </span>
                  </div>
                  <div className="drow">
                    <span className="no">01</span>
                    <span className="handle">@shirayuki</span>
                    <span className="st in">initiated</span>
                  </div>
                  <div className="drow">
                    <span className="no">02</span>
                    <span className="handle">
                      @kor<span className="red">█████</span>
                    </span>
                    <span className="st in">initiated</span>
                  </div>
                  <div className="drow">
                    <span className="no">03</span>
                    <span className="handle">
                      @<span className="red">███</span>volkov
                    </span>
                    <span className="st in">initiated</span>
                  </div>
                  <div className="drow">
                    <span className="no">04</span>
                    <span className="handle">@midnight.arc</span>
                    <span className="st in">initiated</span>
                  </div>
                  <div className="drow">
                    <span className="no">05</span>
                    <span className="handle">
                      @<span className="red">████████</span>
                    </span>
                    <span className="st">vouching…</span>
                  </div>
                  <div className="dfoot">+ 12,397 records sealed · 8,719 on the waitlist</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="band manifesto" id="manifesto">
          <div className="wrap">
            <div className="seclabel">
              <span className="idx">01</span>
              <span>Why Kaiveron exists</span>
              <span className="ln" />
              <span>The code</span>
            </div>
            <p className="big">
              The internet gave every fandom a megaphone and took away the <b>room</b>. Kaiveron is
              the room — <span className="gd">small, deliberate, earned</span> — for people who
              don&rsquo;t just watch the canon, they <b>keep</b> it.
            </p>
            <div className="creed">
              <div className="t">
                <div className="n">I.</div>
                <h3>Finish what you start.</h3>
                <p>
                  Dropped shows are not opinions. Standing here is built on the series you saw
                  through — every arc, every chapter, logged.
                </p>
              </div>
              <div className="t">
                <div className="n">II.</div>
                <h3>No AI slop.</h3>
                <p>
                  Real fans, real takes. We don&rsquo;t tolerate AI-generated filler, farmed
                  engagement or algorithmic slop — every post comes from a human who actually
                  watched it.
                </p>
              </div>
              <div className="t">
                <div className="n">III.</div>
                <h3>The door stays narrow.</h3>
                <p>
                  Growth is not the goal. Every member is vouched in, and admission stays slow on
                  purpose. Scarcity is the feature.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="band" id="inside" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="seclabel">
              <span className="idx">02</span>
              <span>What waits inside</span>
              <span className="ln" />
              <span>Real screens · live now</span>
            </div>

            <ShowRow
              clab="AI Discover"
              title={<>Find your next <span className="gd">obsession.</span></>}
              body="Describe the mood — “seinen with philosophical depth and no filler” — and our neural search reads 30,000+ titles to find your perfect match. AI for discovery, never for content."
              chips={["Mood-based search", "Hidden gems", "Studio filtering"]}
              url="kaiveron.com/ai-discover"
              img="/landing/ai-discover.webp"
              alt="Kaiveron AI Discover"
            />
            <ShowRow
              rev
              clab="The Pantheon"
              title={<>Standing is <span className="gd">earned.</span></>}
              body="XP for every episode, streaks that compound, and a live board of reviewers, streaks and contributors — Genin to Jonin to Legendary."
              chips={["Top Reviewers", "Longest Streaks", "Most Episodes"]}
              url="kaiveron.com/leaderboard"
              img="/landing/leaderboard.webp"
              alt="Kaiveron leaderboard"
            />
            <ShowRow
              clab="The Vault"
              title={<>Every anime <span className="gd">ever made.</span></>}
              body="30,000+ titles, searchable and filterable by era, score, season and length — a neural archive that stays in sync, with AI mood-matching built in."
              chips={["30,161 titles", "Jikan-synced", "AI mood-match"]}
              url="kaiveron.com/bestanimelist"
              img="/landing/vault.webp"
              alt="Kaiveron The Vault"
            />
            <ShowRow
              rev
              clab="Shots"
              title={<>Anime shorts, <span className="gd">endlessly.</span></>}
              body="A vertical reel of edits, clips and moments — human-made, never AI filler. Like, comment, save and share, then swipe to the next."
              chips={["For You", "Following", "Trailers"]}
              url="kaiveron.com/shots"
              img="/landing/shots.webp"
              alt="Kaiveron Shots"
            />
            <ShowRow
              clab="Watch"
              title={<>Watch it the <span className="gd">moment</span> you find it.</>}
              body="Spotlights, trailers and full episodes — sub or dub — with match scores telling you exactly what to play next."
              chips={["Spotlight", "Sub & Dub", "98% match"]}
              url="kaiveron.com/watch"
              img="/landing/watch.webp"
              alt="Kaiveron Watch"
            />
            <ShowRow
              rev
              clab="The Chronicle"
              title={<>Long-form, <span className="gd">by the community.</span></>}
              body="Deep dives, reviews, theories and takes — published by members and ranked by what the room actually reads."
              chips={["Deep Dive", "Review", "Theory"]}
              url="kaiveron.com/blog"
              img="/landing/chronicle.webp"
              alt="Kaiveron The Chronicle"
            />
          </div>
        </section>

        <section className="band" id="app" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="seclabel">
              <span className="idx">03</span>
              <span>And in your pocket</span>
              <span className="ln" />
              <span>iOS · Android</span>
            </div>
            <div className="appshow">
              <div className="scopy">
                <div className="clab">The app</div>
                <h3>
                  The order <span className="gd">travels.</span>
                </h3>
                <p>
                  Feed, shorts, dens and messages — the full community in your pocket, synced with
                  everything on the web. Log an episode the second the credits roll.
                </p>
                <div className="chips">
                  <span>Feed</span>
                  <span>Shorts</span>
                  <span>Dens</span>
                  <span>Messages</span>
                </div>
                <a className="btn btn-primary" href="#gate" style={{ marginTop: 28 }}>
                  Request access
                  <span className="arrow">→</span>
                </a>
              </div>
              <div className="smedia phones">
                <img src="/landing/phones.webp" alt="Kaiveron app on three phones" />
              </div>
            </div>
          </div>
        </section>

        <section className="band" id="chat" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="seclabel">
              <span className="idx">04</span>
              <span>Messages</span>
              <span className="ln" />
              <span>kaiveron.com/chat</span>
            </div>
            <ShowRow
              clab="Direct Messages"
              title={<>Slide into <span className="gd">private</span> DMs.</>}
              body="Start a real-time, encrypted conversation with any member on Kaiveron — trade recs, share lists, plan a watch party. Messages are TLS-encrypted in transit, visible only to the two of you."
              chips={["Private & encrypted", "Real-time", "Anime-native"]}
              url="kaiveron.com/chat"
              img="/landing/messages.webp"
              alt="Kaiveron private messaging"
            />
          </div>
        </section>

        <section className="band statband" style={{ padding: "64px 0" }}>
          <div className="wrap">
            <div className="statgrid">
              <div className="sg">
                <b>12,402</b>
                <span>Members</span>
              </div>
              <div className="sg">
                <b>30,161</b>
                <span>Anime archived</span>
              </div>
              <div className="sg">
                <b>4.2M</b>
                <span>Episodes tracked</span>
              </div>
              <div className="sg">
                <b>96,300+</b>
                <span>Posts & reviews</span>
              </div>
            </div>
          </div>
        </section>

        <section className="band" id="why" style={{ paddingTop: 90 }}>
          <div className="wrap">
            <div className="seclabel">
              <span className="idx">05</span>
              <span>Why Kaiveron</span>
              <span className="ln" />
              <span>The difference</span>
            </div>
            <div className="whygrid" style={{ marginTop: 46 }}>
              <div className="why">
                <div className="wi" />
                <h3>Free, forever.</h3>
                <p>
                  Tracking, discovery, dens and chat — every core feature is free. No paywall on the
                  things that matter.
                </p>
              </div>
              <div className="why">
                <div className="wi" />
                <h3>No ads, no AI slop.</h3>
                <p>
                  No engagement bait, no generated filler. Just real fans and real takes from people
                  who actually watched it.
                </p>
              </div>
              <div className="why">
                <div className="wi" />
                <h3>Everything, one place.</h3>
                <p>
                  Feed, shorts, the archive, leaderboard, blogs and messages — stop juggling five
                  apps for one hobby.
                </p>
              </div>
              <div className="why">
                <div className="wi" />
                <h3>Built by fans.</h3>
                <p>
                  Made by people who finish the season, shaped by the community — not a boardroom.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="band" id="faq" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="seclabel">
              <span className="idx">06</span>
              <span>Questions</span>
              <span className="ln" />
              <span>FAQ</span>
            </div>
            <div className="faqlist" style={{ marginTop: 46 }}>
              <details open>
                <summary>
                  Is Kaiveron really free?
                  <span className="pl" />
                </summary>
                <p>
                  Yes — every tracking, rating, discovery and community feature is free, forever. No
                  ads, no credit card. An optional Pro tier unlocks Creator Studio and the advanced
                  AI Oracle for power users, but nothing important is paywalled.
                </p>
              </details>
              <details>
                <summary>
                  Is it a MyAnimeList or AniList alternative?
                  <span className="pl" />
                </summary>
                <p>
                  Yes. Kaiveron covers the same 30,000+ catalogue with a modern dark-first UI, AI
                  mood-matching, spoiler-safe dens, shorts, blogs and a creator program — all in one
                  place instead of five.
                </p>
              </details>
              <details>
                <summary>
                  What makes the AI different?
                  <span className="pl" />
                </summary>
                <p>
                  Our AI is for discovery, not content. Describe a mood — “a slow-burn psychological
                  thriller with no happy ending” — and it reads 30,000+ titles to find your match.
                  We never publish AI-generated posts, art or filler.
                </p>
              </details>
              <details>
                <summary>
                  What are Dens?
                  <span className="pl" />
                </summary>
                <p>
                  Dens are communities per series, studio and genre — spoiler-aware rooms to drop
                  theories, rankings and recommendations with people who actually care about that
                  show.
                </p>
              </details>
              <details>
                <summary>
                  How do I get in, and is there an app?
                  <span className="pl" />
                </summary>
                <p>
                  Kaiveron is in open beta — request access below to join. It runs in any browser at
                  kaiveron.com, with a free Android app for feed, shorts, dens and messages, synced
                  with the web. iOS is coming soon.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="band" id="gate" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="gate">
              <div className="gglow" />
              <div className="inner">
                <div
                  className="eyebrow"
                  style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}
                >
                  <span className="gtick" />
                  Three ways past the door
                </div>
                <h2>Ask to be let in.</h2>
                <p className="gl">
                  Admission is reviewed by hand and kept deliberately slow. Choose your path —
                  request a review, redeem a code, or get a member to vouch for you.
                </p>
                <div className="paths">
                  <GateRequest />
                  <GateCode router={router} />
                  <div className="path">
                    <div className="pn">
                      <b>03</b> · Referral
                    </div>
                    <h3>Get vouched for.</h3>
                    <p>
                      Know a member? Have them vouch for you from inside. A vouch moves you to the
                      front of every review.
                    </p>
                    <div className="vouch">
                      <span className="d" />
                      Earned, not requested.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <div className="frow">
              <div className="brandcol">
                <img src={WORDMARK} alt="KAIVERON" />
                <p>
                  A private community for true anime &amp; manga fans. Track the canon, keep the
                  canon — by invitation only.
                </p>
              </div>
              <div className="fcol">
                <h4>Inside</h4>
                <Link href="/watchlist">The Chronicle</Link>
                <Link href="/ai-discover">The Oracle</Link>
                <Link href="/leaderboard">The Pantheon</Link>
                <Link href="/community">Dens</Link>
              </div>
              <div className="fcol">
                <h4>Archive</h4>
                <Link href="/bestanimelist">Browse all</Link>
                <Link href="/ai-discover">Mood picker</Link>
                <Link href="/poll">Polls</Link>
                <Link href="/blog">Blog</Link>
              </div>
              <div className="fcol">
                <h4>Elsewhere</h4>
                <a href="#">Discord</a>
                <a href="#">X / Twitter</a>
                <a href="#">Instagram</a>
                <a href="#">YouTube</a>
              </div>
            </div>
            <div className="fbot">
              <span>© MMXXVI · KAIVERON</span>
              <span>kaiveron.com · admission by invitation</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

/* ── Showcase row ──────────────────────────────────────────────────────── */
function ShowRow({
  rev,
  clab,
  title,
  body,
  chips,
  url,
  img,
  alt,
}: {
  rev?: boolean
  clab: string
  title: React.ReactNode
  body: string
  chips: string[]
  url: string
  img: string
  alt: string
}) {
  return (
    <div className={`showrow${rev ? " rev" : ""}`}>
      <div className="scopy">
        <div className="clab">{clab}</div>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="chips">
          {chips.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>
      <div className="smedia">
        <div className="bwin">
          <div className="bbar">
            <span className="bdots">
              <i />
              <i />
              <i />
            </span>
            <span className="url">{url}</span>
          </div>
          <img src={img} alt={alt} loading="lazy" />
        </div>
      </div>
    </div>
  )
}

/* ── Gate: waitlist request ────────────────────────────────────────────── */
function GateRequest() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [member, setMember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || busy) return
    setBusy(true)
    setErr(null)
    try {
      const res = await joinWaitlist(email, "landing-gate")
      setBusy(false)
      if (res?.alreadyMember) setMember(true)
      else setDone(true)
    } catch (ex) {
      // Don't fake success — surface the real outcome so the email isn't lost.
      setBusy(false)
      setErr(
        ex instanceof ApiError && ex.status === 429
          ? "Too many requests from your network — wait a moment and try again."
          : "Couldn't submit that just now. Please try again.",
      )
    }
  }

  return (
    <form className="path" onSubmit={submit}>
      <div className="pn">
        <b>01</b> · Request
      </div>
      <h3>Join the waitlist.</h3>
      <p>Tell us where to reach you. We review every request by hand and reply within 72 hours.</p>
      {!done && !member && (
        <>
          <input
            type="email"
            placeholder="you@domain.com"
            aria-label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-primary pbtn" disabled={busy}>
            {busy ? "Sending…" : "Join the waitlist"}
            <span className="arrow">→</span>
          </button>
        </>
      )}
      <div className="note" style={{ display: done ? "block" : "none" }}>
        You&rsquo;re on the list — watch your inbox.
      </div>
      <div className="note" style={{ display: member ? "block" : "none" }}>
        You&rsquo;re already a member —{" "}
        <a href="/login" style={{ textDecoration: "underline" }}>
          sign in
        </a>
        .
      </div>
      {err && (
        <div className="note" role="alert" style={{ display: "block", color: "#F0A35E" }}>
          {err}
        </div>
      )}
    </form>
  )
}

/* ── Gate: invite code → forwards to /register?invite= ─────────────────── */
function GateCode({ router }: { router: ReturnType<typeof useRouter> }) {
  const [code, setCode] = useState("")
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = code.trim().toUpperCase()
    const good = /^KVRN[-– ]?[A-Z0-9]{3,4}[-– ]?[A-Z0-9]{3,4}$/.test(v) || v === "KAIVERON"
    if (good) {
      setNote({ text: "Sigil accepted. Taking you to registration…", bad: false })
      router.push(`/register?invite=${encodeURIComponent(v)}`)
    } else {
      setNote({ text: "That sigil isn’t recognised. Try the code from your inviter.", bad: true })
    }
  }

  return (
    <form className="path" onSubmit={submit}>
      <div className="pn">
        <b>02</b> · Code
      </div>
      <h3>Enter an invite code.</h3>
      <p>Handed a sigil by a member? Redeem it here and skip the waitlist entirely.</p>
      <input
        id="landing-code-input"
        type="text"
        placeholder="KVRN–XXXX–XXXX"
        aria-label="Invite code"
        autoComplete="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button type="submit" className="btn btn-ghost pbtn">
        Redeem code
      </button>
      {note && (
        <div className="note" style={{ display: "block" }}>
          <span style={{ color: note.bad ? "#FF9C8A" : undefined }}>{note.text}</span>
        </div>
      )}
    </form>
  )
}

/* ── Design CSS (scoped under .kvln) ───────────────────────────────────── */
const CSS = `
.kvln{
  --navy:#08070A; --navy-2:#111016; --navy-3:#0B0A0E; --edge:#040305;
  --paper:#F4F2EC;
  --cyan:#F7C879; --indigo:#E89A33;
  --signal:linear-gradient(120deg,#FFE0A6 0%,#F5A623 100%);
  --dim:rgba(244,242,236,.56); --dim-2:rgba(244,242,236,.38); --dim-3:rgba(244,242,236,.20);
  --rule:rgba(244,242,236,.10); --rule-2:rgba(244,242,236,.06); --panel:rgba(244,242,236,.025);
  --maxw:1240px;
  background:var(--navy); color:var(--paper); font-family:var(--font-sora),system-ui,sans-serif;
  -webkit-font-smoothing:antialiased; overflow-x:hidden; position:relative; min-height:100vh;
}
.kvln *{ box-sizing:border-box; }
.kvln ::selection{ background:rgba(245,166,35,.28); }
.kvln a{ color:inherit; text-decoration:none; }
.kvln h1,.kvln h2,.kvln h3,.kvln p{ margin:0; }
.kvln button{ font-family:inherit; cursor:pointer; }
.kvln input{ font-family:inherit; }

.kvln .atmos{ position:fixed; inset:0; pointer-events:none; z-index:0; }
.kvln .atmos .grid{ position:absolute; inset:0; opacity:.5;
  background:linear-gradient(var(--rule-2) 1px,transparent 1px) 0 0/100% 88px, linear-gradient(90deg,var(--rule-2) 1px,transparent 1px) 0 0/88px 100%;
  -webkit-mask-image:radial-gradient(120% 90% at 50% 30%,#000 35%,transparent 78%); mask-image:radial-gradient(120% 90% at 50% 30%,#000 35%,transparent 78%); }
.kvln .atmos .vig{ position:absolute; inset:0; background:radial-gradient(130% 100% at 50% 18%,transparent 42%,var(--edge) 100%); }
.kvln .atmos .grain{ position:absolute; inset:-50%; opacity:.05; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

.kvln .wrap{ width:100%; max-width:var(--maxw); margin:0 auto; padding:0 40px; }
.kvln .eyebrow{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.42em; text-transform:uppercase; color:var(--dim-2); display:inline-flex; align-items:center; gap:12px; }
.kvln .eyebrow .gtick{ width:22px; height:1px; background:var(--signal); }
.kvln .seclabel{ display:flex; align-items:baseline; gap:14px; margin-bottom:38px; font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.34em; text-transform:uppercase; color:var(--dim-2); }
.kvln .seclabel .idx{ color:var(--paper); }
.kvln .seclabel .ln{ flex:1; height:1px; background:var(--rule); }
.kvln section{ position:relative; z-index:1; }
.kvln .band{ padding:120px 0; }

.kvln .btn{ display:inline-flex; align-items:center; justify-content:center; gap:10px; height:52px; padding:0 26px; border-radius:2px; border:1px solid transparent; font-size:13.5px; font-weight:600; letter-spacing:.04em; white-space:nowrap; transition:transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s, border-color .25s; }
.kvln .btn-primary{ background:var(--signal); color:#0a0805; font-weight:700; }
.kvln .btn-primary:hover{ transform:translateY(-2px); box-shadow:0 14px 36px rgba(245,166,35,.30); }
.kvln .btn-primary:disabled{ opacity:.7; cursor:default; transform:none; box-shadow:none; }
.kvln .btn-ghost{ background:transparent; color:var(--paper); border-color:var(--rule); }
.kvln .btn-ghost:hover{ border-color:var(--dim); }
.kvln .arrow{ transition:transform .25s; }
.kvln .btn:hover .arrow{ transform:translateX(4px); }

.kvln nav.top{ position:fixed; top:0; left:0; right:0; z-index:60; display:flex; align-items:center; justify-content:space-between; padding:20px 40px; background:linear-gradient(180deg,rgba(7,6,9,.86),rgba(7,6,9,0)); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); border-bottom:1px solid transparent; transition:background .3s,border-color .3s; }
.kvln nav.top.scrolled{ background:rgba(7,6,9,.92); border-bottom-color:var(--rule); }
.kvln nav.top .brand{ display:flex; align-items:center; gap:13px; }
.kvln nav.top .brand .markbox{ width:38px; height:38px; border-radius:10px; display:grid; place-items:center; background:linear-gradient(180deg,#16140F,#0C0B08); border:1px solid rgba(245,166,35,.28); }
.kvln nav.top .brand .markbox img{ width:19px; display:block; }
.kvln nav.top .brand .wm{ height:17px; display:block; }
.kvln nav.top .brand .tag{ font-family:var(--font-jb),monospace; font-size:9.5px; letter-spacing:.32em; text-transform:uppercase; color:var(--dim-2); padding-left:14px; border-left:1px solid var(--rule); }
.kvln nav.top .links{ display:flex; align-items:center; gap:34px; }
.kvln nav.top .links a{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--dim); transition:color .2s; }
.kvln nav.top .links a:hover{ color:var(--paper); }
.kvln nav.top .navcta{ height:40px; padding:0 22px; border-radius:7px; background:var(--signal); color:#0a0805; font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; font-weight:500; display:inline-flex; align-items:center; gap:9px; transition:transform .2s,box-shadow .2s; }
.kvln nav.top .navcta:hover{ transform:translateY(-1px); box-shadow:0 10px 26px rgba(245,166,35,.34); }
.kvln nav.top .navcta .dot{ width:6px; height:6px; border-radius:50%; background:#0a0805; }
.kvln nav.top .links > a{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--dim); transition:color .2s; }
.kvln nav.top .links > a:hover{ color:var(--paper); }
.kvln nav.top .navitem{ position:relative; }
.kvln nav.top .navlink{ background:none; border:none; padding:0; color:var(--dim); font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.2em; text-transform:uppercase; display:inline-flex; align-items:center; gap:7px; transition:color .2s; }
.kvln nav.top .navlink:hover,.kvln nav.top .navlink.open{ color:var(--paper); }
.kvln nav.top .navlink .caret{ font-size:9px; transition:transform .2s; }
.kvln nav.top .navlink.open .caret{ transform:rotate(180deg); }
.kvln nav.top .navright{ display:flex; align-items:center; gap:22px; }
.kvln nav.top .navsignin{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--dim); transition:color .2s; }
.kvln nav.top .navsignin:hover{ color:var(--paper); }
@media(max-width:880px){ .kvln nav.top .links{ display:none; } }

.kvln .megamenu{ position:absolute; top:calc(100% + 18px); left:50%; transform:translateX(-50%); width:344px; max-height:min(74vh,640px); overflow-y:auto; padding:10px; background:rgba(12,11,16,.97); border:1px solid var(--rule); border-radius:12px; box-shadow:0 30px 70px rgba(0,0,0,.6); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:grid; gap:2px; z-index:80; }
.kvln .megaitem{ display:flex; align-items:center; gap:14px; padding:11px 12px; border-radius:9px; transition:background .15s; }
.kvln .megaitem:hover{ background:rgba(244,242,236,.05); }
.kvln .mi-ic{ flex:none; width:38px; height:38px; border-radius:9px; display:grid; place-items:center; background:linear-gradient(180deg,#1a160d,#0f0d09); border:1px solid rgba(245,166,35,.30); color:var(--cyan); }
.kvln .mi-ic svg{ width:18px; height:18px; display:block; }
.kvln .mi-tx{ display:flex; flex-direction:column; gap:2px; }
.kvln .mi-l{ font-family:var(--font-jb),monospace; font-size:11.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--paper); }
.kvln .mi-d{ font-size:11.5px; color:var(--dim-2); }

.kvln .hero{ position:relative; min-height:100svh; display:flex; align-items:center; padding:104px 0 150px; overflow:hidden; }
@media(max-height:900px){ .kvln .hero{ align-items:flex-start; padding:100px 0 118px; } }
.kvln .hero .glow{ position:absolute; left:50%; top:46%; transform:translate(-50%,-50%); width:min(1100px,120vw); height:min(720px,90vh); pointer-events:none; z-index:0; background:radial-gradient(ellipse at center,rgba(245,166,35,.16),rgba(247,200,121,.06) 40%,transparent 70%); filter:blur(10px); }
.kvln .hero-pane{ display:none; position:relative; z-index:2; width:100%; }
.kvln .hero-pane.active{ display:block; }
.kvln .hero .anim{ opacity:1; transform:none; }
.kvln .hero h1{ font-weight:700; line-height:.98; letter-spacing:-.02em; }
.kvln .hero .lead{ color:var(--dim); font-size:18px; line-height:1.6; font-weight:300; }
.kvln .ledger{ max-width:880px; }
.kvln .ledger h1{ font-size:clamp(48px,8.4vw,108px); margin:26px 0 0; }
.kvln .ledger h1 .fade{ color:var(--dim-2); }
.kvln .ledger .lead{ margin-top:34px; max-width:540px; }

.kvln .invite{ margin-top:40px; max-width:560px; }
.kvln .invite .row{ display:flex; gap:12px; }
.kvln .invite input{ flex:1; min-width:0; height:52px; padding:0 18px; color:var(--paper); background:rgba(244,242,236,.04); border:1px solid var(--rule); border-radius:2px; font-size:14px; transition:border-color .2s; }
.kvln .invite input::placeholder{ color:var(--dim-2); }
.kvln .invite input:focus{ outline:none; border-color:rgba(245,166,35,.5); }
.kvln .invite .sub{ margin-top:14px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.14em; color:var(--dim-2); }
.kvln .invite .sub a{ color:var(--paper); border-bottom:1px solid var(--rule); padding-bottom:2px; }
.kvln .invite .ok{ display:none; align-items:center; gap:10px; height:52px; font-family:var(--font-jb),monospace; font-size:12.5px; color:var(--paper); }
.kvln .invite .ok .seal{ width:8px; height:8px; border-radius:50%; background:var(--signal); }
.kvln .invite.done .row,.kvln .invite.done .sub{ display:none; }
.kvln .invite.done .ok{ display:flex; }
.kvln .statline{ font-family:var(--font-jb),monospace; font-size:12px; letter-spacing:.16em; color:var(--dim-2); margin-top:30px; }
.kvln .statline b{ color:var(--paper); font-weight:500; }
.kvln .statline .gd{ color:var(--cyan); }

.kvln .seal-pane{ text-align:center; }
.kvln .seal-pane .sealmark{ position:relative; width:188px; height:188px; margin:0 auto 14px; display:grid; place-items:center; }
.kvln .seal-pane .ring{ position:absolute; inset:0; border-radius:50%; border:1px solid var(--rule); }
.kvln .seal-pane .ring.r2{ inset:18px; border-color:var(--rule-2); }
.kvln .seal-pane .ring.glow{ inset:-6px; border:1px solid transparent; background:conic-gradient(from 0deg,rgba(247,200,121,0),rgba(247,200,121,.55),rgba(245,166,35,.55),rgba(247,200,121,0)) border-box; -webkit-mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; animation:kvln-spin 14s linear infinite; }
@keyframes kvln-spin{ to{ transform:rotate(360deg); } }
.kvln .seal-pane .sealmark img{ width:66px; filter:drop-shadow(0 0 18px rgba(245,166,35,.25)); }
.kvln .seal-pane h1{ font-size:clamp(46px,7vw,92px); }
.kvln .seal-pane .lead{ margin:28px auto 0; max-width:480px; }
.kvln .seal-pane .invite{ margin:36px auto 0; }
.kvln .seal-pane .invite .row,.kvln .seal-pane .invite .sub{ justify-content:center; }
@media(max-height:880px){
  .kvln .hero .ledger h1{ font-size:clamp(38px,5.6vw,68px); }
  .kvln .hero .manifest-pane h1{ font-size:clamp(34px,4.8vw,58px); }
  .kvln .hero .lead{ font-size:16px; margin-top:20px; }
  .kvln .hero .invite{ margin-top:26px; }
  .kvln .hero .statline{ margin-top:18px; }
  .kvln .hero .seal-pane .sealmark{ width:116px; height:116px; margin-bottom:4px; }
  .kvln .hero .seal-pane .sealmark img{ width:45px; }
  .kvln .hero .seal-pane h1{ font-size:clamp(36px,4.6vw,54px); }
  .kvln .hero .seal-pane .lead{ margin-top:18px; }
}

.kvln .manifest-pane{ display:grid; grid-template-columns:1.05fr .95fr; gap:64px; align-items:center; }
.kvln .manifest-pane h1{ font-size:clamp(42px,6.4vw,84px); }
.kvln .manifest-pane .lead{ margin-top:30px; max-width:460px; }
.kvln .manifest-pane .invite{ margin-top:36px; max-width:none; }
.kvln .dossier{ border:1px solid var(--rule); border-radius:4px; background:var(--navy-2); box-shadow:0 30px 80px rgba(0,0,0,.5); overflow:hidden; }
.kvln .dossier .dhead{ display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--rule); font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.2em; color:var(--dim); text-transform:uppercase; }
.kvln .dossier .dhead .live{ display:inline-flex; align-items:center; gap:8px; color:var(--paper); }
.kvln .dossier .dhead .live i{ width:6px; height:6px; border-radius:50%; background:var(--signal); animation:kvln-pulse 2s ease-in-out infinite; }
@keyframes kvln-pulse{ 0%,100%{ opacity:1; } 50%{ opacity:.35; } }
.kvln .dossier .drow{ display:flex; align-items:center; gap:16px; padding:15px 20px; border-bottom:1px solid var(--rule-2); font-family:var(--font-jb),monospace; font-size:12.5px; }
.kvln .dossier .drow:last-child{ border-bottom:none; }
.kvln .dossier .drow .no{ color:var(--dim-2); width:26px; }
.kvln .dossier .drow .handle{ flex:1; color:var(--paper); }
.kvln .dossier .drow .red{ background:var(--dim-3); color:transparent; border-radius:2px; padding:0 4px; }
.kvln .dossier .drow .st{ font-size:10.5px; letter-spacing:.16em; color:var(--dim-2); }
.kvln .dossier .drow .st.in{ color:var(--cyan); }
.kvln .dossier .dfoot{ padding:14px 20px; font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.14em; color:var(--dim-2); background:var(--navy-3); }
@media(max-width:900px){ .kvln .manifest-pane{ grid-template-columns:1fr; gap:40px; } }

.kvln .manifesto .big{ font-size:clamp(30px,3.6vw,52px); font-weight:300; line-height:1.28; max-width:920px; }
.kvln .manifesto .big b{ font-weight:600; }
.kvln .manifesto .big .gd{ background:var(--signal); -webkit-background-clip:text; background-clip:text; color:transparent; }
.kvln .creed{ margin-top:72px; display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--rule); border:1px solid var(--rule); border-radius:4px; overflow:hidden; }
.kvln .creed .t{ background:var(--navy); padding:34px 30px; }
.kvln .creed .t .n{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.2em; color:var(--cyan); }
.kvln .creed .t h3{ font-size:19px; font-weight:600; margin:18px 0 10px; }
.kvln .creed .t p{ font-size:14.5px; line-height:1.6; color:var(--dim); font-weight:300; }
@media(max-width:820px){ .kvln .creed{ grid-template-columns:1fr; } }

.kvln .showrow,.kvln .appshow{ display:grid; grid-template-columns:.86fr 1.14fr; gap:54px; align-items:center; padding:44px 0; }
.kvln .showrow.rev{ direction:rtl; }
.kvln .showrow.rev .scopy,.kvln .showrow.rev .smedia{ direction:ltr; }
.kvln .scopy .clab{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--cyan); }
.kvln .scopy h3{ font-size:clamp(26px,3.2vw,42px); font-weight:600; letter-spacing:-.02em; line-height:1.04; margin:14px 0 0; }
.kvln .scopy h3 .gd{ background:var(--signal); -webkit-background-clip:text; background-clip:text; color:transparent; }
.kvln .scopy p{ margin-top:18px; color:var(--dim); font-size:16px; line-height:1.6; font-weight:300; max-width:400px; }
.kvln .scopy .chips{ margin-top:24px; display:flex; gap:9px; flex-wrap:wrap; }
.kvln .scopy .chips span{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.04em; color:var(--dim); border:1px solid var(--rule); border-radius:3px; padding:8px 13px; }
.kvln .smedia{ position:relative; display:flex; justify-content:center; }
.kvln .smedia::before{ content:""; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:120%; height:78%; background:radial-gradient(ellipse,rgba(245,166,35,.14),transparent 64%); filter:blur(16px); pointer-events:none; }
.kvln .smedia.phones img{ position:relative; width:100%; filter:drop-shadow(0 30px 60px rgba(0,0,0,.55)); }
.kvln .bwin{ position:relative; width:100%; border:1px solid var(--rule); border-radius:12px; overflow:hidden; background:var(--navy-2); box-shadow:0 36px 80px rgba(0,0,0,.6); }
.kvln .bwin .bbar{ height:38px; display:flex; align-items:center; gap:14px; padding:0 15px; background:#141315; border-bottom:1px solid var(--rule); }
.kvln .bwin .bdots{ display:flex; gap:7px; } .kvln .bwin .bdots i{ width:10px; height:10px; border-radius:50%; }
.kvln .bwin .bdots i:nth-child(1){ background:#ff5f57; } .kvln .bwin .bdots i:nth-child(2){ background:#febc2e; } .kvln .bwin .bdots i:nth-child(3){ background:#28c840; }
.kvln .bwin .url{ flex:1; max-width:280px; height:23px; margin:0 auto; border-radius:6px; background:var(--navy-3); border:1px solid var(--rule); display:flex; align-items:center; justify-content:center; font-family:var(--font-jb),monospace; font-size:10.5px; color:var(--dim-2); }
.kvln .bwin img{ width:100%; display:block; }
@media(max-width:860px){ .kvln .showrow,.kvln .appshow{ grid-template-columns:1fr; gap:24px; padding:28px 0; } .kvln .showrow.rev{ direction:ltr; } .kvln .scopy{ text-align:center; } .kvln .scopy .chips{ justify-content:center; } .kvln .scopy p{ margin-left:auto; margin-right:auto; } }

.kvln .statband{ border-top:1px solid var(--rule); border-bottom:1px solid var(--rule); }
.kvln .statgrid{ display:grid; grid-template-columns:repeat(4,1fr); }
.kvln .statgrid .sg{ padding:6px 30px; border-left:1px solid var(--rule); }
.kvln .statgrid .sg:first-child{ border-left:none; padding-left:0; }
.kvln .statgrid .sg b{ display:block; font-size:clamp(32px,4.2vw,54px); font-weight:700; letter-spacing:-.02em; background:var(--signal); -webkit-background-clip:text; background-clip:text; color:transparent; }
.kvln .statgrid .sg span{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim-2); margin-top:8px; display:block; }
@media(max-width:760px){ .kvln .statgrid{ grid-template-columns:1fr 1fr; gap:32px 0; } .kvln .statgrid .sg{ border-left:none; padding-left:0; } }

.kvln .whygrid{ display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--rule); border:1px solid var(--rule); border-radius:5px; overflow:hidden; }
.kvln .why{ background:var(--navy); padding:32px 28px; }
.kvln .why .wi{ width:13px; height:13px; background:var(--signal); transform:rotate(45deg); border-radius:2px; box-shadow:0 0 12px 1px rgba(245,166,35,.4); }
.kvln .why h3{ font-size:18px; font-weight:600; margin:22px 0 10px; letter-spacing:-.01em; }
.kvln .why p{ font-size:14px; line-height:1.6; color:var(--dim); font-weight:300; }
@media(max-width:860px){ .kvln .whygrid{ grid-template-columns:1fr 1fr; } }
@media(max-width:520px){ .kvln .whygrid{ grid-template-columns:1fr; } }

.kvln .faqlist{ border-top:1px solid var(--rule); }
.kvln .faqlist details{ border-bottom:1px solid var(--rule); }
.kvln .faqlist summary{ list-style:none; cursor:pointer; padding:26px 0; display:flex; align-items:center; justify-content:space-between; gap:24px; font-size:clamp(17px,2vw,20px); font-weight:500; letter-spacing:-.01em; transition:color .2s; }
.kvln .faqlist summary:hover{ color:var(--cyan); }
.kvln .faqlist summary::-webkit-details-marker{ display:none; }
.kvln .faqlist summary .pl{ flex:none; width:20px; height:20px; position:relative; }
.kvln .faqlist summary .pl::before,.kvln .faqlist summary .pl::after{ content:""; position:absolute; background:var(--cyan); border-radius:2px; transition:transform .25s; }
.kvln .faqlist summary .pl::before{ left:0; top:9px; width:20px; height:2px; }
.kvln .faqlist summary .pl::after{ left:9px; top:0; width:2px; height:20px; }
.kvln .faqlist details[open] summary .pl::after{ transform:scaleY(0); }
.kvln .faqlist details[open] summary{ color:var(--paper); }
.kvln .faqlist details p{ margin:0; padding:0 44px 28px 0; color:var(--dim); font-size:15.5px; line-height:1.65; font-weight:300; max-width:760px; }

.kvln .gate{ position:relative; border:1px solid var(--rule); border-radius:6px; overflow:hidden; background:linear-gradient(180deg,var(--navy-2),var(--navy-3)); }
.kvln .gate .gglow{ position:absolute; left:50%; top:-30%; transform:translateX(-50%); width:760px; height:520px; background:radial-gradient(ellipse,rgba(245,166,35,.18),rgba(247,200,121,.05) 45%,transparent 72%); filter:blur(8px); pointer-events:none; }
.kvln .gate .inner{ position:relative; z-index:1; padding:70px 56px; }
.kvln .gate h2{ font-size:clamp(34px,5vw,64px); font-weight:700; letter-spacing:-.02em; text-align:center; }
.kvln .gate .gl{ text-align:center; color:var(--dim); font-weight:300; font-size:17px; line-height:1.6; margin:26px auto 0; max-width:560px; }
.kvln .paths{ margin-top:54px; display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--rule); border:1px solid var(--rule); border-radius:5px; overflow:hidden; }
.kvln .path{ background:var(--navy); padding:34px 30px; }
.kvln .path .pn{ font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--dim-2); }
.kvln .path .pn b{ color:var(--cyan); }
.kvln .path h3{ font-size:20px; font-weight:600; margin:16px 0 10px; }
.kvln .path p{ font-size:13.5px; line-height:1.6; color:var(--dim); font-weight:300; min-height:62px; }
.kvln .path input{ width:100%; height:48px; padding:0 16px; margin-top:20px; color:var(--paper); border-radius:2px; background:rgba(244,242,236,.04); border:1px solid var(--rule); font-size:13.5px; }
.kvln .path input:focus{ outline:none; border-color:rgba(245,166,35,.5); }
.kvln .path .pbtn{ margin-top:10px; width:100%; height:48px; }
.kvln .path .note{ display:none; margin-top:12px; font-family:var(--font-jb),monospace; font-size:11px; color:var(--cyan); }
.kvln .path .vouch{ display:flex; align-items:center; gap:10px; height:48px; margin-top:20px; font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.12em; color:var(--dim); }
.kvln .path .vouch .d{ width:6px;height:6px;border-radius:50%;background:var(--signal); }
@media(max-width:820px){ .kvln .paths{ grid-template-columns:1fr; } .kvln .gate .inner{ padding:46px 26px; } }

.kvln footer{ position:relative; z-index:1; border-top:1px solid var(--rule); margin-top:120px; padding:70px 0 50px; }
.kvln footer .frow{ display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:40px; }
.kvln footer .brandcol img{ height:20px; display:block; }
.kvln footer .brandcol p{ margin-top:20px; font-size:14px; line-height:1.6; color:var(--dim); font-weight:300; max-width:300px; }
.kvln footer .fcol h4{ font-family:var(--font-jb),monospace; font-size:10.5px; letter-spacing:.22em; text-transform:uppercase; color:var(--dim-2); margin:0 0 18px; }
.kvln footer .fcol a{ display:block; font-size:13.5px; color:var(--dim); margin-bottom:12px; font-weight:300; }
.kvln footer .fcol a:hover{ color:var(--paper); }
.kvln footer .fbot{ margin-top:60px; padding-top:26px; border-top:1px solid var(--rule-2); display:flex; justify-content:space-between; gap:20px; flex-wrap:wrap; font-family:var(--font-jb),monospace; font-size:11px; letter-spacing:.12em; color:var(--dim-2); }
@media(max-width:820px){ .kvln footer .frow{ grid-template-columns:1fr 1fr; } }
`
