# Kaiveron SEO & Organic-Growth Playbook

> Goal: maximum organic user acquisition in 0–6 months, **no paid ads** — SEO + viral only.
> Audience: engineering + growth. Every recommendation is tied to the actual Next.js 16 codebase.

**How to read this doc.** Each claim is tagged with a confidence level from an
adversarially fact-checked research pass (claims were voted on by 3 independent
verifiers; "refuted" claims were dropped). Where a popular SEO "rule" failed
verification, it's called out explicitly under **Myths we are NOT acting on** so we
don't waste effort on debunked tactics.

- 🟢 **Verified** — corroborated by primary sources (Google Search Central, Next.js docs, schema.org, sitemaps.org) and survived 3-0 verification.
- 🟡 **Directional** — the direction is sound but the specific numbers are blog-quality / unverified. Use as guidance, not gospel.
- 🔴 **Needs validation** — flagged open question; verify against live docs before building.

---

## 0. TL;DR — the four pillars + one reality check

1. **Programmatic catalog pages with genuine value-per-page.** 🟢 Google penalizes *value deficiency at scale* (doorway/scaled/thin/index-bloat), **not raw page count**. 50k indexed pages is fine *if each carries real, unique, visible data*.
2. **Get the Next.js technical foundation right for 50k+ pages.** 🟢 Split sitemaps into 50,000-URL chunks behind a sitemap index; ship server-rendered HTML; valid structured data on *visible* content only; prune low-value URLs (the #1 crawl-budget lever).
3. **A Letterboxd-style UGC loop is the long-tail + freshness engine.** 🟢 User reviews/lists/ratings generate continuously-fresh, long-tail-rich, indexable content per title that a static catalog template cannot — and they spread as screenshots off-platform.
4. **Win AI citations through traditional SEO, not gimmicks.** 🟢 Skip `llms.txt` (no major AI engine uses it). Structured, front-loaded, schema-marked content is what gets cited in AI Overviews / ChatGPT / Perplexity.

**Reality check (🟢 set expectations now):** New domains face a real age disadvantage. The median top-10-ranking page is **>2 years old**; Ahrefs' 1M-page study found the average #1 page is **~5 years old** and **72.9% of top-10 pages are >3 years old**; only **~5.7% of new pages reach the top 10 within 12 months**. → Target **indexing velocity and long-tail/UGC wins**, not head terms like "anime" or "watch anime," in the first 6 months.

---

## 1. Where Kaiveron is today (baseline)

Already shipped (this repo):
- ✅ `robots.ts` with an explicit **AI-crawler allowlist** (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended, Bingbot, CCBot…).
- ✅ Site-wide JSON-LD: `Organization` + `WebSite` (SearchAction) + `WebApplication` in the root layout.
- ✅ Anime detail pages: `generateMetadata` + `TVSeries` + `AggregateRating` + `BreadcrumbList` JSON-LD, canonical, OG, Twitter cards.
- ✅ **Programmatic landing pages** `/genres/[slug]` (25) and `/studios/[slug]` (20), SSG-prerendered, with `ItemList` + `BreadcrumbList` + `FAQPage` JSON-LD and crawlable internal links.
- ✅ Unique metadata on ~13 high-keyword listing pages (was a duplicate-title leak).
- ✅ Sitemap pulls top-500 anime from the API + the new genre/studio/season URLs.

This playbook is the roadmap from that baseline to a 50k-page, UGC-fed organic growth machine.

---

## 2. Pillar 1 — Programmatic SEO (pSEO) at scale

### 2.1 The core principle 🟢
> Google does **not** penalize a site for having many pages. It penalizes **value deficiency at scale** — doorway pages, scaled/auto-generated content, thin content, and index bloat (Google Search Essentials → Spam Policies; enforced both by manual actions and algorithmically, e.g. the Aug 2025 SpamBrain scaled-content update).

**Implication for Kaiveron:** genre/studio/season/anime pages are safe to scale to tens of thousands *as long as each page renders unique, visible, useful data* — not just a re-skinned template. Our landing pages already do this (ranked real anime, scores, episode counts, FAQ from live data). Keep that bar for every new page type.

### 2.2 Page types to build, in priority order (anime-specific)
Ranked by intent volume × how poorly MAL/AniList serve them:

| Priority | Page type | URL pattern | Target query examples | Status |
|---|---|---|---|---|
| P0 | Anime detail | `/anime/[id]` | "{title}", "{title} episodes/rating" | ✅ live |
| P0 | Genre "best of" | `/genres/[slug]` | "best action anime", "best isekai" | ✅ live |
| P1 | Studio catalog | `/studios/[slug]` | "mappa anime", "ufotable anime list" | ✅ live |
| P1 | Season hub | `/anime/season/[year]/[season]` | "fall 2026 anime", "summer 2025 anime" | exists, add SSR copy |
| P1 | **Watch-order guides** | `/guides/[franchise]-watch-order` | "naruto watch order", "how to watch {franchise} in order" | 🔴 build |
| P2 | **Combination / long-tail** | `/genres/[a]/[b]` or `/best/[genre]-[year]` | "best romance anime 2026", "action + fantasy anime" | 🔴 build |
| P2 | "Where to watch" | `/anime/[id]/where-to-watch` | "where to watch {title}", "is {title} on crunchyroll" | 🔴 build |
| P3 | Character pages | `/characters/[id]` | "{character} from {anime}" | 🔴 build (high volume, thin-risk) |
| P3 | Staff/VA pages | `/people/[id]` | "{VA} roles", "{director} anime" | 🔴 build |

**Watch-order guides** are the standout near-term opportunity (🟡): a single dated pillar page can target 12+ franchises ("anime watch order," "how to watch X in order"), bundling data MAL/AniList don't surface in one place — **total hours per franchise** (~28h Demon Slayer → ~470h One Piece), **filler %** (Naruto ~44%), canonicity of movies, and release-vs-chronological order. We already have the episode/franchise data to generate these semi-programmatically. Add an opinionated editorial stance ("release order first — the creators designed the reveals for it") to differentiate from raw catalog data.

### 2.3 Internal-linking architecture 🟢/🟡
- **3-click rule (🟢):** every important page must be reachable within **3 clicks of the homepage**. Pages 4+ clicks deep are crawled less and rank worse. Our genre/studio chips on the index pages help; extend this to seasons and guides.
- **Pillar–cluster with bi-directional links (🟡):** clustered, cross-linked content shows ~30% more organic traffic and rankings that persist ~2.5× longer than standalone pages. Structure: genre hub ⇄ each anime in it ⇄ studio of that anime ⇄ season it aired. Our landing pages already cross-link siblings; make the *anime detail page* link back up to its genres/studio/season.
- **Contextual links in body copy** carry more weight than nav/footer links — embed links inside the editorial intros, not just chip rows.
- Breadcrumbs on every catalog page (✅ already emitting `BreadcrumbList`).

### 2.4 Avoiding thin-content / index-bloat 🟢 (numbers 🟡)
The *principle* is verified; the oft-quoted exact thresholds (300/500-word minimums, "40% unique," "60% indexation ratio") **failed verification — do not treat them as rules.** Instead, operate on signals Google actually documents:
- Each page must render **unique data that matches its JSON-LD** (visible content only — see §3.3).
- Don't index pages with **zero results** — our landing pages already `notFound()` when the API returns an empty list. Keep that guard on every new page type.
- Watch **Search Console → Pages → "Discovered/Crawled – currently not indexed."** A rising share there is the real signal of bloat, regardless of any ratio rule.
- Roll out new page types in **waves** (🟡 pilot → expand) and watch indexation before generating the next 10k.

---

## 3. Pillar 2 — Technical SEO for Next.js App Router

### 3.1 Rendering: SSR/ISR, not CSR 🟢
- Public, indexable pages must ship **server-rendered HTML** (the content is in the initial response, not hydrated client-side). Our landing pages are pure Server Components — correct. Convert the remaining client-only listing pages (`/trending`, `/seasonal`, `/best`, `/rankings`, etc.) to render at least a **server-rendered first screen** of real content; keep interactivity as client islands.
- Use **ISR (`export const revalidate`)** so pages are static-fast but refresh (we use 1h on landing pages). 🟢 Moving logic into Server Components also **shrinks the client JS bundle, which improves INP**.

### 3.2 Core Web Vitals targets (Google's official "good" thresholds)
> Note: the research pass did not independently re-verify these numbers (🔴 flagged as an open question), but they are Google's **documented** thresholds and are stable:

| Metric | "Good" (75th percentile) | How to hit it in Next.js |
|---|---|---|
| **LCP** (Largest Contentful Paint) | **< 2.5 s** | Server-render; `next/image` with explicit `width`/`height` + `priority` on the hero; preconnect to image CDN; avoid client-fetch-then-render for above-fold content. |
| **INP** (Interaction to Next Paint) | **< 200 ms** | Move work to Server Components (🟢 reduces client JS); a minimal App Router page already ships ~87 KB JS before your code — keep client islands small. |
| **CLS** (Cumulative Layout Shift) | **< 0.1** | 🟢 Always set `width`/`height` (or `aspect-ratio`) on images; use `placeholder="blur"` to reserve space; reserve space for async UI. |

Operational: 🟢 wrap third-party scripts (analytics, etc.) in Next.js `<Script strategy="lazyOnload">` so they don't block LCP/INP. Note our `SeoAnimeGrid` uses plain `<img>` with explicit aspect ratio — fine for CLS; consider `next/image` for poster optimization later.

### 3.3 Structured data — what earns rich results 🟢
**The rules that survived verification (build to these):**
- **`AggregateRating` / review snippets** require: `ratingValue` **plus at least one of** `ratingCount` **or** `reviewCount`, **plus** a named `itemReviewed`. (`bestRating` defaults to 5, `worstRating` to 1 — a 1–10 anime scale should set them explicitly.)
- 🟢 **Only mark up content visible on the page.** Marking up data the user can't see makes the page **ineligible** for rich results or risks **spam classification**. → Our anime pages must *render* the visible score + rating count next to the JSON-LD that declares them.
- 🟢 **Ratings must be from genuine users.** Fabricated/aggregated-from-elsewhere ratings can trigger a **manual action**. → **Action item:** the site-wide `WebApplication` JSON-LD currently hard-codes `aggregateRating: { ratingValue: "4.7", ratingCount: "1" }` — that's a placeholder fabricated rating. **Remove it or replace with a real, visible, user-generated count.** This is the single riskiest item in the current setup.
- 🟢 **Self-serving reviews are ineligible** — a page can't show star rich results for reviews of itself that it controls. (Affects how we mark up Kaiveron's own rating vs. third-party anime ratings.)
- Don't block JSON-LD resources via `robots.txt`/`noindex`, or Google can't process them.

**Which schema type for series-level star ratings — 🔴 VALIDATE.** The research claim that **`TVSeries` is *not* eligible** for star rich results (only `Movie`, `CreativeWorkSeason`, `CreativeWorkSeries`, `Episode` are) **was refuted**, so the supported-type list is unsettled. **Before relying on stars in SERP for anime pages, check the live [Google review-snippet docs](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) for the current supported `itemReviewed` types** and pick the one that's both eligible and accurate (we currently use `TVSeries`). Consider `Movie` for films, and test in Rich Results Test.

Schema types we already use well: `Organization`, `WebSite`+`SearchAction`, `WebApplication`, `TVSeries`, `BreadcrumbList`, `ItemList`, `FAQPage`. ✅

### 3.4 Sitemaps for 50k+ pages 🟢
- A single sitemap is capped at **50,000 URLs / 50 MB** (sitemaps.org + Google). At scale you **must** paginate.
- 🟢 Use Next.js **`generateSitemaps()`** to emit numbered chunks served at `/.../sitemap/[id].xml`, referenced from a **sitemap index**. Slice `start = id * 50000, end = start + 50000`.
- 🟢 Sitemaps must list **only canonical, indexable URLs** with **accurate `lastmod`** — Google uses `lastmod` to schedule recrawls. A sitemap that dumps every known URL (including non-canonical/filtered) becomes a **crawl-budget liability**.
- **Action item:** our current single `sitemap.ts` will outgrow 50k once anime + characters + guides are added — migrate to `generateSitemaps()` with an index before then. Split by type: `sitemap/anime/[id]`, `sitemap/genres`, `sitemap/studios`, `sitemap/seasons`, `sitemap/guides`.

### 3.5 Crawl-budget management 🟢
- 🟢 Crawl budget is only a real constraint at **scale**: roughly **>1M pages changing weekly or >10k pages changing daily.** Sites under ~1,000 pages generally don't need to think about it. Kaiveron will cross into "matters" territory as the catalog grows — plan for it, don't over-optimize early.
- 🟢 **The #1 lever is shrinking the universe of low-value URLs** (faceted/filter combinations, duplicates, thin pages), **not** trying to raise crawl rate. Google's own crawl-budget guidance lists "manage your URL inventory" first and warns that crawling junk makes crawlers **abandon the rest of the site**.
- **Faceted navigation** (genre × year × studio × status filters) can explode into millions of URL combinations. 🟢 Google prefers **blocking parameter URLs in `robots.txt`** over `noindex` (because `noindex` still has to be crawled to be seen). → Decide which filter combinations are *valuable landing pages* (e.g. `best romance anime 2026`) and make those clean, indexable, statically-linked routes; block the rest of the combinatorial filter URLs.
- Canonicalize aggressively: every page self-references its canonical (✅ we do); filtered/sorted variants canonicalize to the base page.

---

## 4. Pillar 3 — AI Search / GEO (Generative Engine Optimization)

### 4.1 Skip `llms.txt` 🟢
> Multiple 2025–2026 server-log studies + Google and OpenAI statements: **no major AI engine meaningfully uses `llms.txt`.** In one analysis only **84 of 62,100 AI-bot requests (0.1%)** hit it; GPTBot fetches it only occasionally; ClaudeBot/Google-Extended/PerplexityBot effectively never. OpenAI's crawler docs recommend **`robots.txt`** and never mention `llms.txt`. Only ~10% of domains even have one, and an XGBoost analysis found it gives **no measurable citation benefit**.

→ **Don't spend time on `llms.txt`.** Our `robots.ts` AI-crawler allowlist is the correct mechanism, and it's already done. ✅

### 4.2 What actually wins AI citations 🟢 (some 🟡)
AI search is now a major surface — AI Overviews appear on a large and growing share of queries and can cite **new domains before they reach the organic top 10**, which is a genuine fast-lane for a young site. To get cited:
- 🟢 **Structured formats (lists, tables, schema-marked content) get ~3× more AI citations** than paragraph-only content. → Our `ItemList` + `FAQPage` ranked lists are already the right shape. Add comparison **tables** (e.g. watch-order hours/filler tables).
- 🟢 **~44% of LLM citations come from the first 30% of a page's text.** → **Front-load a direct, quotable answer** at the top of every landing page ("The best action anime right now is X (score 9.1), followed by Y and Z…"). Our genre pages put the ranked grid high but should add a 1–2 sentence direct answer above it.
- 🟢 **Pages with proper schema markup are 30–40% more likely to be cited** in AI answers — reinforces the structured-data work in §3.3.
- 🟡 Being listed on third-party review/aggregator sites correlates with higher ChatGPT citation probability — i.e. off-platform brand presence (Reddit, wikis, "best anime tracker" listicles) feeds AI answers.

### 4.3 Measuring AI referral traffic 🔴
Flagged open question — no verified method surfaced. Practical approach: in GA4, segment referrals from `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, and watch GSC for impressions on question-shaped queries. Build a simple dashboard; treat as experimental.

---

## 5. Pillar 4 — Content, E-E-A-T & User-Generated Content

### 5.1 UGC is the moat 🟢
> Letterboxd is the proof: a track/rate/review/follow loop that turns **every user action into fresh, long-tail, indexable content per title.** Reviews on Letterboxd grew from **<300,000 (2012) to ~100 million (2024)** — a compounding freshness signal a static catalog can't match. The same loop is Kaiveron's product thesis.

Why UGC wins SEO (🟢/🟡):
- **Freshness:** review sections update constantly → crawlers see pages as fresh vs. stale static catalog data.
- **Long-tail:** users naturally write the phrases people search ("anime like X but sadder").
- **E-E-A-T "Experience":** first-hand user reviews are exactly the first-hand experience Google's Quality Rater Guidelines reward — and that brand copy can't fake.

**Action items:**
- Make **user reviews and lists indexable** (server-rendered, canonical, in the sitemap) — they're currently behind client/auth surfaces. This is the highest-ceiling SEO investment we have.
- Surface a **visible aggregate score + review count** on each anime page (also unlocks legitimate `AggregateRating` rich results per §3.3).
- 🟡 Letterboxd **de-emphasizes user identity in favor of the work**, lowering the ego-cost of posting and raising contribution rates — design review UI accordingly.

### 5.2 Editorial content that ranks 🟡
Formats MAL/AniList under-serve (low competition, high intent):
- **Seasonal guides** ("Fall 2026 anime: the 15 worth watching") — recurring, evergreen-refreshed.
- **Watch-order / filler guides** (see §2.2) — bundle hours, filler %, canonicity.
- **"Where to watch {title}"** — high commercial intent, MAL doesn't own it.
- **Recommendation lists** ("anime like {X}", "best anime for beginners").
- 🟡 Use **named/expert bylines** (not just "Kaiveron") — competitors like PrimeTime Anime use org-only attribution; a named author is a stronger personal-authority E-E-A-T signal we can beat them on.
- 🟡 Add **"Updated for 2026" freshness callouts**, FAQs, and internal links to related guides (we already do dated H1s on landing pages).

---

## 6. Pillar 5 — Off-page & viral loops

> ⚠️ **Confidence caveat:** the specific backlink-correlation stats (e.g. "96.3% of top-10 had >1,000 referring domains", "#1 has 3.2× more referring domains") and "brand mentions are the #1 AI ranking factor" **were refuted 0-3** in verification. The *direction* — more quality referring domains and brand mentions help — is mainstream consensus, but treat the magnitudes skeptically. This pillar has the **weakest evidentiary support** and is flagged for dedicated follow-up research (🔴).

Tactics, framed as experiments:
- **Shareable "Wrapped" / Year-in-Review pages** 🟢 (mechanics verified via Spotify/Letterboxd): generate a per-user **anime wrapped** as a **9:16 vertical asset** sized for Instagram Stories/TikTok, with a **prominent one-tap share button**. Spotify Wrapped drove a measurable **21% app-download lift (2020)**; Letterboxd ships a "Year in Review." Frame stats as **identity markers** ("your anime year," "your top studio"), not raw numbers. Each shared card is a backlink/brand-impression vector and a signup driver.
- **Shareable profile / list / review cards** — Letterboxd's reviews spread as **screenshots and quote cards on Reddit, Instagram, and X** 🟢, creating off-platform reach that loops back as branded search + direct traffic. Give every list/review an OG image + share affordance.
- **Embeddable widgets** — "my top 10 anime" embed for blogs/Discord → backlinks.
- **Community seeding** — Reddit (r/anime), Discord, anime forums. Seed genuinely useful pages (watch-order guides, seasonal lists), not spam.
- **Digital PR / data angles** 🟡 — original data ("most-dropped anime of the season," "average score by studio") is link-bait; monitor `#journorequest`/HARO. Reclaim **unlinked brand mentions** via `-site:kaiveron.com "kaiveron"` search and request links.
- 🟡 **Sequencing:** don't start link outreach until **10–15 quality pages are indexed**; prospect sites that already link to 2+ competitors but not us ("link intersect").

---

## 7. Measurement & KPIs

**Setup (Day 1):**
- Google Search Console (verify domain), submit the sitemap index.
- GA4 + the existing self-hosted pageview pinger.
- Bing Webmaster Tools (Bing index feeds ChatGPT search).

**KPIs to track (new-domain-appropriate — leading, not vanity):**
| KPI | Why | Target trajectory |
|---|---|---|
| **Pages indexed** (GSC Coverage) | Indexing velocity is the #1 early signal | Steady weekly growth; watch "Discovered – not indexed" |
| **Impressions** (GSC) | Leading indicator before clicks | Rises weeks 3–6 as pages enter at positions 30–80 |
| **Avg position** for tracked long-tail queries | Movement before page-1 | Climbing from 30–80 → 10–20 |
| **Indexed UGC pages** (reviews/lists) | The compounding moat | Grows with active users |
| **Referring domains** | Off-page (track direction, not magnitude) | Any growth from a credible base |
| **AI referrals** (GA4 segment) | Emerging channel | Experimental |

**Realistic ramp (🟢 expectation-setting):**
- Weeks 1–2: pages discovered/crawled.
- Weeks 3–6: initial rankings appear at **positions ~30–80**; impressions start.
- Months 3–6: first long-tail pages crack page 1; real organic traffic emerges.
- Months 6–12: more first-page long-tail; **head terms ("anime," "best anime") take 12–24 months** and are not a 6-month goal.
- Only **~5.7% of new pages reach top-10 within a year** — win on **breadth of long-tail + UGC freshness**, not a few head terms.

---

## 8. Prioritized 30/60/90-day action plan

### Days 1–30 — Technical foundation + fix risks (effort: low–med, impact: high)
- [ ] **Remove/replace the fabricated `aggregateRating` placeholder** in `WebApplication` JSON-LD (`src/components/seo/JsonLd.tsx`) — manual-action risk. 🟢
- [ ] Verify the site in **GSC + Bing**, submit sitemap, request indexing on the 25 genre + 20 studio pages.
- [ ] Re-check the **supported `itemReviewed` schema type** for star results; fix `TVSeries` if needed. 🔴
- [ ] Server-render the **first screen** of `/trending`, `/seasonal`, `/best`, `/rankings` (currently client-only).
- [ ] **Front-load a direct one-sentence answer** at the top of each genre/studio landing page (AI-citation + featured-snippet play).
- [ ] Audit **Core Web Vitals** in PageSpeed Insights; fix any LCP image not using `priority`/explicit dims.
- [ ] Decide the **faceted-URL policy**; `robots.txt`-block junk filter combinations.

### Days 31–60 — Content + pSEO expansion (effort: med, impact: high)
- [ ] Ship **watch-order guides** for the top 12 franchises (semi-programmatic from episode data). 🟡 highest near-term ROI.
- [ ] Add SSR editorial intros + FAQ to **season hubs**; build **combination pages** ("best {genre} anime {year}").
- [ ] Make **user reviews + public lists indexable** (server-rendered, canonical, sitemapped) — the UGC moat.
- [ ] Migrate sitemap to **`generateSitemaps()` + index** ahead of the 50k cap.
- [ ] Strengthen **internal linking**: anime detail → its genres/studio/season (bi-directional clusters).

### Days 61–90 — Authority, UGC virality, AI visibility (effort: med, impact: compounding)
- [ ] Ship **Anime Wrapped / Year-in-Review** with 9:16 share cards + one-tap share. 🟢 viral loop.
- [ ] Add **OG share cards** to every profile/list/review.
- [ ] Begin **community seeding** (Reddit/Discord) with the guides, not spam.
- [ ] Start **link outreach** now that 10–15+ pages are indexed (link-intersect prospecting).
- [ ] Stand up the **measurement dashboard** (indexed pages, impressions, long-tail positions, AI referrals).
- [ ] Build **character/staff pages** *only* if they clear the value-per-page bar (real bio + roles + links), else defer (thin-content risk).

---

## 9. Myths we are NOT acting on (refuted in verification)

These popular "rules" **failed 0-3 verification** — do not build process around them:
- ❌ Fixed **word-count minimums** for programmatic pages (300/500 words). No such Google threshold.
- ❌ Specific **uniqueness percentages** ("40% unique content," "30% unique elements") and **indexation-ratio bands** ("keep above 60%/80%"). Invented precision.
- ❌ Specific **traffic-timeline promises** ("1,000+ visitors in 3–6 months," "rank in 30–60 days with backlinks"). Unsupported.
- ❌ Exact **backlink-correlation stats** ("96.3% of top-10 had >1,000 referring domains," "#1 has 3.2× more"). Magnitudes unverified.
- ❌ "**Brand mentions are the single most important AI ranking factor**." Refuted.
- ❌ The Letterboxd "**1.3M → 9M users**" figure (a different growth stat). Use only the verified directional fact: Letterboxd and its review volume grew massively via UGC.
- ❌ `llms.txt` does anything for AI ranking/citation. It doesn't.

---

## 10. Open questions to validate (🔴)

1. **Which schema type earns star rich results for anime series today?** (`TVSeries` eligibility was contested.) Check live Google docs + Rich Results Test before relying on stars.
2. **Off-page tactics that actually move a new anime domain** — the backlink/AI-citation magnitudes were refuted; needs a dedicated, evidence-based pass.
3. **Exact CWV tradeoffs** for our specific SSR/ISR mix — measure on real pages, don't assume.
4. **Realistic indexing velocity** for *our* domain + best **AI-referral tracking** method — establish empirically in the first 60 days.

---

## Appendix — Primary sources

- Google Search Central — Spam policies, Crawl budget, Review snippet, Structured-data policies, Faceted navigation: `developers.google.com/search`, `developers.google.com/crawling/docs/crawl-budget`
- Next.js — `generateSitemaps`, App Router rendering: `nextjs.org/docs/app/api-reference/functions/generate-sitemaps`
- Sitemaps protocol (50k/50MB cap): `sitemaps.org/protocol.html`
- OpenAI crawler docs (robots.txt, no llms.txt): `developers.openai.com/api/docs/bots`
- llms.txt non-adoption studies: `seranking.com/blog/llms-txt/`
- Ranking-timeline / page-age benchmarks (Ahrefs, SE Ranking): `ahrefs.com/blog/how-long-does-it-take-to-rank-in-google`, `resources.averi.ai/benchmarks/seo-ranking-timeline`
- Letterboxd UGC/virality benchmarks: `nogood.io/2024/12/02/letterboxd-marketing/`, `globaldatinginsights.com/.../letterboxd-and-goodreads-...`
- Spotify Wrapped virality mechanics: `newsroom.spotify.com`
- Watch-order content pattern: `primetimeanime.com/blog/ultimate-anime-watch-order-guide-2025`

---

*Generated from an adversarially fact-checked research pass (107 agents, ~1.5M tokens; claims voted 3× each, refuted claims dropped). Confidence tags reflect verification outcomes, not author opinion. Last compiled: June 2026.*
