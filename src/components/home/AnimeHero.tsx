"use client"

import { useState } from "react"
import Link from "next/link"
import { HeroShip } from "./HeroShip"

/* ── Sub-components (exactly from Hero Section.html) ─────────────────────── */

function SkullMark({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <g stroke="#0e1a30" strokeWidth="2.5" strokeLinecap="round">
        <line x1="10" y1="54" x2="54" y2="10" stroke="#f6f3ea" strokeWidth="6" />
        <line x1="54" y1="54" x2="10" y2="10" stroke="#f6f3ea" strokeWidth="6" />
        <line x1="10" y1="54" x2="54" y2="10" stroke="#0e1a30" strokeWidth="2" />
        <line x1="54" y1="54" x2="10" y2="10" stroke="#0e1a30" strokeWidth="2" />
      </g>
      <g fill="#f6f3ea" stroke="#0e1a30" strokeWidth="2">
        <circle cx="10" cy="54" r="4" /><circle cx="54" cy="54" r="4" />
        <circle cx="10" cy="10" r="4" /><circle cx="54" cy="10" r="4" />
      </g>
      <g transform="translate(32,30)">
        <ellipse cx="0" cy="-2" rx="14" ry="13" fill="#f6f3ea" stroke="#0e1a30" strokeWidth="2.5" />
        <rect x="-9" y="8" width="18" height="6" rx="1.5" fill="#f6f3ea" stroke="#0e1a30" strokeWidth="2.5" />
        <circle cx="-5" cy="-2" r="3" fill="#0e1a30" />
        <circle cx="5" cy="-2" r="3" fill="#0e1a30" />
        <line x1="-5" y1="9" x2="-5" y2="14" stroke="#0e1a30" strokeWidth="1.5" />
        <line x1="0" y1="9" x2="0" y2="14" stroke="#0e1a30" strokeWidth="1.5" />
        <line x1="5" y1="9" x2="5" y2="14" stroke="#0e1a30" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

function AnchorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#2a1608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="20" />
      <line x1="7" y1="11" x2="17" y2="11" />
      <path d="M5 15 a 7 7 0 0 0 14 0" />
    </svg>
  )
}

function SocialRail() {
  const icons = [
    { k:"tw", d:"M19 5.5c-.6.3-1.3.5-2 .6.7-.4 1.3-1.1 1.6-1.9-.7.4-1.5.7-2.3.9C15.6 4.4 14.7 4 13.7 4c-1.9 0-3.5 1.6-3.5 3.5 0 .3 0 .5.1.8C7.3 8.1 4.7 6.7 3 4.7c-.3.5-.5 1.1-.5 1.8 0 1.2.6 2.3 1.6 2.9-.6 0-1.1-.2-1.6-.4 0 1.7 1.2 3.1 2.8 3.4-.3.1-.6.1-.9.1-.2 0-.5 0-.7-.1.5 1.4 1.8 2.4 3.3 2.4-1.2 1-2.8 1.5-4.5 1.5H2c1.5 1 3.4 1.6 5.3 1.6 6.4 0 9.9-5.3 9.9-9.9v-.5c.7-.5 1.3-1.1 1.8-1.8z" },
    { k:"ig", children: true },
    { k:"yt", children: true },
  ]
  return (
    <div className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-5 fade-in-left" style={{ animationDelay:"0.6s" }}>
      <span className="w-px h-12 bg-white/40" />
      {icons.map(({ k }) => (
        <a key={k} href="#" className="group w-9 h-9 rounded-full bg-white/0 hover:bg-white/15 transition flex items-center justify-center text-white/85 hover:text-white">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            {k==="tw" && <path d="M19 5.5c-.6.3-1.3.5-2 .6.7-.4 1.3-1.1 1.6-1.9-.7.4-1.5.7-2.3.9C15.6 4.4 14.7 4 13.7 4c-1.9 0-3.5 1.6-3.5 3.5 0 .3 0 .5.1.8C7.3 8.1 4.7 6.7 3 4.7c-.3.5-.5 1.1-.5 1.8 0 1.2.6 2.3 1.6 2.9-.6 0-1.1-.2-1.6-.4 0 1.7 1.2 3.1 2.8 3.4-.3.1-.6.1-.9.1-.2 0-.5 0-.7-.1.5 1.4 1.8 2.4 3.3 2.4-1.2 1-2.8 1.5-4.5 1.5H2c1.5 1 3.4 1.6 5.3 1.6 6.4 0 9.9-5.3 9.9-9.9v-.5c.7-.5 1.3-1.1 1.8-1.8z"/>}
            {k==="ig" && <><rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2"/></>}
            {k==="yt" && <><rect x="2" y="6" width="20" height="12" rx="3" ry="3"/><polygon points="10,9 16,12 10,15" fill="#0e1a30"/></>}
          </svg>
        </a>
      ))}
      <span className="w-px h-12 bg-white/40" />
    </div>
  )
}

function ScrollIndicator() {
  return (
    <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 text-white/80">
      <span className="font-type text-[10px] tracking-[0.3em] uppercase rotate-90 mb-12 origin-center">explore</span>
      <span className="w-px h-12 bg-white/40" />
      <span className="w-2 h-2 rounded-full bg-white/40" />
      <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_0_3px_rgba(247,195,61,.25)]" style={{ background:"#f7c33d" }} />
      <span className="w-2 h-2 rounded-full bg-white/40" />
      <span className="w-2 h-2 rounded-full bg-white/40" />
      <span className="w-px h-12 bg-white/40" />
    </div>
  )
}

function Cloud({ className, delay=0, duration=80, scale=1, opacity=0.85 }: { className:string; delay?:number; duration?:number; scale?:number; opacity?:number }) {
  return (
    <div className={"absolute pointer-events-none pan-right " + className}
      style={{ opacity, animationDuration:duration+"s", animationDelay:delay+"s" }}>
      <svg viewBox="0 0 280 110" width={220*scale} height={86*scale}>
        <g fill="#ffffff" opacity=".95">
          <ellipse cx="64"  cy="60" rx="56" ry="24" />
          <ellipse cx="124" cy="44" rx="50" ry="30" />
          <ellipse cx="188" cy="58" rx="54" ry="24" />
          <ellipse cx="234" cy="68" rx="36" ry="16" />
        </g>
        <g fill="#9ed4f5" opacity=".55">
          <ellipse cx="76"  cy="80" rx="56" ry="10" />
          <ellipse cx="186" cy="80" rx="62" ry="10" />
        </g>
      </svg>
    </div>
  )
}

function Seagull({ className, delay=0, duration=42, scale=1 }: { className:string; delay?:number; duration?:number; scale?:number }) {
  return (
    <div className={"absolute pointer-events-none pan-right " + className}
      style={{ animationDuration:duration+"s", animationDelay:delay+"s" }}>
      <svg className="flap" viewBox="0 0 44 22" width={32*scale} height={16*scale}>
        <path d="M2 16 Q 11 2 22 13 Q 33 2 42 16" stroke="#0e1a30" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function TopNav() {
  const [active, setActive] = useState("HOME")
  const links = ["HOME","ABOUT","CREW","ADVENTURES","STORE","CONTACT"]
  return (
    <nav className="relative z-30 w-full px-6 lg:px-12 pt-6 flex items-center justify-between gap-6">
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <span className="bob-slow"><SkullMark size={48} /></span>
        <span className="hidden sm:block leading-none">
          <span className="block font-display text-white text-base tracking-wider">animeunwatched</span>
          <span className="block font-type text-white/70 text-[10px] tracking-[0.3em] uppercase mt-1">ship&apos;s log</span>
        </span>
      </Link>

      <ul className="hidden lg:flex items-center gap-9 font-ui font-bold text-white text-[13px] tracking-[0.18em]">
        {links.map((l) => (
          <li key={l}>
            <button onClick={() => setActive(l)} className="relative py-2 transition hover:text-[#f7c33d]">
              <span style={{ color: active===l ? "#f7c33d" : undefined }}>{l}</span>
              {active===l && <span className="absolute left-0 right-0 -bottom-0.5 h-[3px] rounded-full" style={{ background:"#f7c33d" }} />}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Link href="/register"
          className="parchment torn-edges px-5 py-2.5 font-display text-[13px] tracking-widest flex items-center gap-2 shadow-[0_8px_18px_rgba(8,20,42,.45)] border-2 border-[#6a4014]/40 transition hover:-translate-y-0.5 hover:-rotate-1 active:translate-y-0">
          <span>JOIN THE CREW</span>
          <AnchorIcon size={14} />
        </Link>
        <button className="w-10 h-10 rounded-md hover:bg-white/10 flex flex-col items-center justify-center gap-1.5">
          <span className="w-6 h-0.5 bg-white" /><span className="w-6 h-0.5 bg-white" /><span className="w-6 h-0.5 bg-white" />
        </button>
      </div>
    </nav>
  )
}

/* ── Main Hero ────────────────────────────────────────────────────────────── */
export default function AnimeHero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden grain bg-[#0e1a30]">

      {/* Sky gradient */}
      <div className="hero-bg absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 cloud-banks pointer-events-none" />

      {/* Sun shimmer over horizon */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[55%] w-[60vh] h-[60vh] rounded-full pointer-events-none mix-blend-screen"
        style={{ background:"radial-gradient(circle,rgba(255,255,255,.45),rgba(255,255,255,0) 60%)" }} />

      {/* Distant island town */}
      <div className="absolute left-0 right-0 bottom-[28%] sm:bottom-[34%] h-[80px] sm:h-[110px] pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-full island opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-full island-windows" />
        {/* Lighthouse */}
        <div className="absolute left-[12%] bottom-[40px] sm:bottom-[60px] w-2 h-12 sm:h-16 rounded-t shadow-[0_2px_3px_rgba(0,0,0,.4)]"
          style={{ background:"linear-gradient(180deg,#f6f3ea,#caa766)" }}>
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-full shadow-[0_0_6px_2px_rgba(247,195,61,.6)]"
            style={{ background:"#f7c33d" }} />
        </div>
      </div>

      {/* Parallax clouds */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Cloud className="top-[8%]"  delay={0}   duration={100} scale={1.5} opacity={0.95} />
        <Cloud className="top-[22%]" delay={-30} duration={140} scale={1.0} opacity={0.85} />
        <Cloud className="top-[4%]"  delay={-60} duration={120} scale={0.85} opacity={0.75} />
        <Cloud className="top-[34%]" delay={-15} duration={160} scale={0.65} opacity={0.60} />
      </div>

      {/* Seagulls */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Seagull className="top-[20%]" delay={0}   duration={50} scale={1.2} />
        <Seagull className="top-[30%]" delay={-12} duration={64} scale={0.8} />
        <Seagull className="top-[14%]" delay={-25} duration={56} scale={0.95} />
        <Seagull className="top-[26%]" delay={-40} duration={72} scale={0.6} />
      </div>

      {/* Top Nav */}
      <TopNav />

      {/* 3D Ship */}
      <HeroShip
        className="absolute right-[-6%] sm:right-[-3%] lg:right-[-2%] bottom-[14%] sm:bottom-[16%] lg:bottom-[18%] w-[82%] sm:w-[64%] lg:w-[60%] max-w-[900px] z-[18] pointer-events-none"
        style={{ height:"44vh" }}
      />

      {/* Social rail */}
      <SocialRail />
      <ScrollIndicator />

      {/* Hero copy — bobbing container */}
      <div className="relative z-20 hero-bob">
        <div className="mx-auto w-full max-w-[1380px] px-8 sm:px-14 lg:px-24 pt-12 sm:pt-16 lg:pt-20 pb-44">
          <div className="max-w-[640px]">

            {/* Kicker */}
            <div className="inline-flex items-center gap-3 mb-5 fade-in-up" style={{ animationDelay:"0.3s" }}>
              <span className="h-[2px] w-8" style={{ background:"#f7c33d" }} />
              <span className="font-type text-[11px] tracking-[0.4em] uppercase" style={{ color:"#f7c33d" }}>
                animeunwatched · ep. 01
              </span>
            </div>

            {/* Headline */}
            <h1 className="brush-headline text-[14vw] sm:text-[10vw] lg:text-[7.2rem] xl:text-[8.2rem] fade-in-up"
              style={{ animationDelay:"0.45s" }}>
              <span className="block">SET SAIL</span>
              <span className="block">FOR <span className="accent">ADVENTURE!</span></span>
            </h1>

            {/* Sub-copy */}
            <p className="mt-12 sm:mt-14 text-white/95 text-base sm:text-lg leading-relaxed font-ui font-medium max-w-[460px] drop-shadow-[0_2px_8px_rgba(8,20,42,.6)] fade-in-up"
              style={{ animationDelay:"0.7s" }}>
              Track every anime, log every chapter, and chart your own voyage through every world
              you&apos;ve ever sworn you&apos;d finish.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-7 fade-in-up" style={{ animationDelay:"0.95s" }}>
              <Link href="/register"
                className="cta-yellow font-display text-[#2a1608] text-[15px] tracking-[0.2em] px-7 py-4 rounded-[10px] flex items-center gap-4 group transition hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.97]">
                <span>START YOUR JOURNEY</span>
                <span className="inline-flex items-center justify-center arrow-nudge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a1608" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <polyline points="14,6 20,12 14,18" />
                  </svg>
                </span>
              </Link>

              <button className="group flex items-center gap-3 text-white transition hover:translate-x-0.5">
                <span className="relative w-12 h-12 rounded-full border-2 border-white/85 flex items-center justify-center group-hover:border-[#f7c33d] group-hover:bg-white/10 transition">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="white" className="ml-0.5">
                    <polygon points="0,0 14,8 0,16" />
                  </svg>
                </span>
                <span className="font-display text-[13px] tracking-[0.32em] border-b-2 border-white/70 pb-0.5 group-hover:text-[#f7c33d] group-hover:border-[#f7c33d] transition">
                  WATCH TRAILER
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Ocean strip */}
      <div className="absolute left-0 right-0 bottom-0 h-[22%] sm:h-[24%] ocean z-[15] pointer-events-none" />

      {/* Scroll down */}
      <button className="absolute left-1/2 -translate-x-1/2 bottom-5 z-30 flex flex-col items-center gap-1.5 text-white fade-in-up" style={{ animationDelay:"1.3s" }}>
        <span className="font-display text-[12px] tracking-[0.45em]">SCROLL DOWN</span>
        <span className="scroll-bounce">
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,2 11,11 20,2" />
            <polyline points="2,7 11,13 20,7" opacity="0.5" />
          </svg>
        </span>
      </button>

      {/* Bottom vignette */}
      <div className="absolute inset-0 pointer-events-none z-[22]"
        style={{ background:"radial-gradient(120% 85% at 50% 40%, transparent 60%, rgba(8,20,42,.55) 100%)" }} />
    </section>
  )
}
