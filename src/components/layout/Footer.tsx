import Link from "next/link";

export default function Footer() {
  return (
    <div className="relative overflow-hidden bg-[#0b0b0f] pt-16 px-4">

      {/* Background SVG Layer */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-3.svg')] bg-center bg-cover opacity-30" />

      <footer className="relative mx-auto max-w-[1350px] overflow-hidden rounded-t-[30px] border border-white/5 bg-[#111117]/90 backdrop-blur px-[clamp(20px,5vw,80px)] pt-16 pb-10 text-white">

        {/* MAIN GRID */}
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">

          {/* BRAND */}
          <div>
            <h2 className="text-[clamp(22px,3vw,30px)] font-bold tracking-wide">
              AnimeUnwatched
            </h2>

            <p className="mt-4 max-w-[420px] text-[clamp(13px,1.2vw,15px)] leading-relaxed text-zinc-400">
              Discover anime you haven't watched yet. Track hidden gems,
              explore underrated series, and build your next binge list —
              powered by the community.
            </p>

            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <Link href="#" className="text-zinc-200 transition hover:text-indigo-400 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]">
                Instagram
              </Link>
              <Link href="#" className="text-zinc-200 transition hover:text-indigo-400 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]">
                X (Twitter)
              </Link>
              <Link href="#" className="text-zinc-200 transition hover:text-indigo-400 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]">
                YouTube
              </Link>
            </div>
          </div>

          {/* LINKS */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Explore</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/discover">Discover Anime</Link></li>
                <li><Link href="/leaderboard">Leaderboard</Link></li>
                <li><Link href="/watchlist">My Watchlist</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Genres</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>Shonen</li>
                <li>Seinen</li>
                <li>Romance</li>
                <li>Fantasy</li>
                <li>Isekai</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Support</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>support@animeunwatched.com</li>
                <li>FAQ</li>
                <li>Privacy Policy</li>
                <li>Terms & Conditions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AnimeUnwatched</p>
          <p>All rights reserved.</p>
        </div>

        {/* Big Text */}
        <div className="relative mt-20 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/30 blur-[160px]" />

          <div className="select-none text-[clamp(3rem,10vw,12rem)] font-black tracking-[6px] sm:tracking-[8px] text-transparent [-webkit-text-stroke:1px_#6366f1] leading-[0.85]">
            <span className="block">ANIME</span>
            <span className="block">UNWATCHED</span>
          </div>
        </div>

      </footer>
    </div>
  );
}