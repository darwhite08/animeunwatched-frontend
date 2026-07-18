import type { Metadata } from "next"
import Link from "next/link"

// Founder / about page. Deliberately NOT linked from any nav, footer, or menu
// — users won't stumble on it in the UI — but it IS in sitemap.xml and allowed
// for crawlers, so Google/AI engines can index the founder + brand entity.
// This is the canonical Person/Organization entity page for knowledge-graph
// signal behind "Kaiveron founder", "Priyanshu Chandra", etc.

const SITE = "https://kaiveron.com"
const PATH = "/about/founder"
const NAME = "Priyanshu Chandra"
const PHOTO = "/team/priyanshu-chandra.jpg"

export const metadata: Metadata = {
  title: `${NAME} — Founder of Kaiveron`,
  description:
    `${NAME} is the founder and creator of Kaiveron, an AI-powered anime social platform that blends discovery, tracking, and community — Letterboxd-quality design meets Discord-quality community for anime and manga fans.`,
  keywords: [
    NAME, "Kaiveron founder", "Kaiveron", "anime platform founder",
    "Priyanshu Chandra Kaiveron", "anime social network", "anime tracker founder",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "profile",
    siteName: "Kaiveron",
    title: `${NAME} — Founder of Kaiveron`,
    description: `Meet ${NAME}, founder and creator of Kaiveron — the AI-powered anime & manga social platform.`,
    url: `${SITE}${PATH}`,
    images: [{ url: PHOTO, width: 1169, height: 983, alt: NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — Founder of Kaiveron`,
    description: `Founder & creator of Kaiveron, the AI-powered anime & manga social platform.`,
    images: [PHOTO],
  },
}

const personLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: NAME,
    jobTitle: "Founder & Creator",
    image: `${SITE}${PHOTO}`,
    url: `${SITE}${PATH}`,
    nationality: "Indian",
    worksFor: {
      "@type": "Organization",
      name: "Kaiveron",
      url: SITE,
    },
    knowsAbout: ["Anime", "Manga", "Product design", "Community platforms", "Artificial intelligence"],
  },
}

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kaiveron",
  url: SITE,
  logo: `${SITE}/icons/icon-512.png`,
  description:
    "Kaiveron is an AI-powered anime and manga social platform — discovery, watch/read tracking, reviews, clubs, and long-form journalism, built for the world's most visually literate fandom.",
  founder: { "@type": "Person", name: NAME, url: `${SITE}${PATH}` },
  foundingDate: "2026",
  areaServed: "Worldwide",
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "About", item: `${SITE}/about` },
    { "@type": "ListItem", position: 3, name: NAME, item: `${SITE}${PATH}` },
  ],
}

function Jsonld({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export default function FounderAboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-20">
      <Jsonld data={personLd} />
      <Jsonld data={orgLd} />
      <Jsonld data={breadcrumbLd} />

      {/* HERO */}
      <section className="flex flex-col sm:flex-row items-start gap-8 sm:gap-10">
        <div className="w-40 sm:w-56 shrink-0 mx-auto sm:mx-0">
          <div className="relative aspect-[1169/983] overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO}
              alt={`${NAME}, founder of Kaiveron`}
              width={1169}
              height={983}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-bright/70">Founder</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none text-foreground">
            {NAME}
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Founder &amp; creator of <strong className="text-foreground">Kaiveron</strong> — an AI-powered
            anime &amp; manga social platform built for the most visually literate fandom on the internet.
          </p>
        </div>
      </section>

      {/* BIO */}
      <section className="mt-14 space-y-6 max-w-2xl">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-subtle">About {NAME.split(" ")[0]}</h2>
        <div className="space-y-4 text-[15px] sm:text-base text-muted leading-relaxed">
          <p>
            {NAME} founded Kaiveron to fix what he felt was missing across the anime web: databases
            without a soul, forums without design, and trackers without community. His conviction is
            simple — an anime list is a personality statement, and the tools around it should feel as
            crafted as the shows they celebrate.
          </p>
          <p>
            He leads Kaiveron end to end — product, design, and engineering — shipping across web,
            mobile, and the platform&apos;s AI discovery and community systems. The goal: a single home
            where fans discover what to watch and read next, track their journey, write and read
            long-form criticism, and find their people.
          </p>
          <p>
            Based in India and building for a global audience, {NAME.split(" ")[0]} is focused on making
            Kaiveron the social identity layer for anime and manga — Letterboxd-quality design meeting
            Discord-quality community.
          </p>
        </div>
      </section>

      {/* WHAT HE'S BUILDING */}
      <section className="mt-14 grid sm:grid-cols-3 gap-4">
        {[
          { h: "Discovery", p: "AI-first recommendations, mood and taste-based browsing, and trending signals that actually reflect what fans are watching now." },
          { h: "Tracking", p: "Anime watchlists and manga readlists with streaks, ranks, and gamified progress that celebrate fans rather than exploit them." },
          { h: "Community", p: "Clubs, spoiler-safe feeds, reviews, and The Chronicle — long-form anime journalism written by the community." },
        ].map((c) => (
          <div key={c.h} className="rounded-2xl border border-border bg-surface p-5 space-y-2">
            <p className="text-sm font-black uppercase tracking-wide text-foreground">{c.h}</p>
            <p className="text-[13px] text-subtle leading-relaxed">{c.p}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-3xl border border-border bg-surface p-8 text-center space-y-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Kaiveron</h2>
        <p className="text-muted max-w-xl mx-auto leading-relaxed">
          The AI-powered anime &amp; manga social platform — discovery, tracking, reviews, clubs, and
          long-form journalism, all in one place.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/" className="px-6 min-h-11 inline-flex items-center rounded-2xl bg-accent text-black font-black text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">
            Explore Kaiveron
          </Link>
          <Link href="/about" className="px-6 min-h-11 inline-flex items-center rounded-2xl border border-border text-foreground font-black text-[11px] uppercase tracking-widest hover:border-white/30 active:scale-95 transition-all">
            About the platform
          </Link>
        </div>
      </section>
    </main>
  )
}
