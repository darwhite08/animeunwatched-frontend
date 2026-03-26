"use client";

import Image from "next/image";

const characters = [
  { src: "/assets/png/tanjiro.png", alt: "Tanjiro" },
  { src: "/assets/png/zoro.png", alt: "Zoro" },
  { src: "/assets/png/naruto.png", alt: "Naruto" },
  { src: "/assets/png/goku.png", alt: "Goku" },
  { src: "/assets/png/luffy.png", alt: "Luffy" },
];

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center bg-black text-white pb-20 pt-12 bg-[url(https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-3.svg)] bg-center bg-cover">
      {/* Top Banner */}
      <div className="flex items-center gap-2 border border-white/15 rounded-full px-4 py-2 text-sm mt-20">
        <p className="text-white/80">Discover underrated anime before everyone else.</p>
        <a href="#" className="flex items-center gap-1 font-medium hover:text-white transition">
          Explore now
          <svg className="mt-0.5" width="19" height="19" viewBox="0 0 19 19" fill="none">
            <path d="M3.959 9.5h11.083m0 0L9.501 3.96m5.541 5.54-5.541 5.542" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <h1 className="text-4xl md:text-4xl text-center font-semibold max-w-3xl mt-6 bg-gradient-to-r from-white to-[#748298] text-transparent bg-clip-text">
        Track. Rate. Discover.<br />Anime That Deserves More Hype.
      </h1>

      <p className="text-white/70 md:text-base text-center max-w-2xl mt-4 px-4">
        Build your watchlist, vote in polls, climb the leaderboard, and help hidden anime rise to the top.
      </p>

      <div className="flex gap-4 mt-8 text-sm flex-wrap justify-center">
        <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-full font-medium shadow-lg shadow-indigo-500/20">
          Start Exploring
        </button>
        <button className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-6 py-3 hover:bg-white/15 transition">
          <span>View Leaderboard</span>
        </button>
      </div>

      {/* Optimized Character Grid */}
      <div className="mt-16 flex gap-10 justify-center max-md:overflow-x-auto max-w-6xl w-full px-6 pb-6 items-end">
        {characters.map((character, i) => (
          <div key={i} className="relative w-52 h-72 flex-shrink-0">
            <Image
              src={character.src}
              alt={character.alt}
              fill
              className="object-contain object-bottom translate-y-6"
              sizes="208px"
              // {/* Only the first two images load instantly; others wait until needed */}
              priority={i < 2}
              loading={i < 2 ? undefined : "lazy"}
            />
          </div>
        ))}
      </div>
    </section>
  );
}