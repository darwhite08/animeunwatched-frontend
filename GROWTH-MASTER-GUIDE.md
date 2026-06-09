# Kaiveron Growth Master Guide — Step by Step

> One goal: **maximum traffic + users, zero ad budget.** This is the single ordered
> playbook. Do it top to bottom. Tags: **[YOU]** = you do it · **[ME]** = code I write · **[DONE]** = already shipped.
>
> Companion: `SEO-PLAYBOOK.md` (deep technical reference). This file is the *what-to-do*.

---

## PART A — How winning actually works in 2026 (read once)

Four facts from current research that shape everything below:

1. **Topical authority beats backlinks now.** Google's March 2026 Core Update made E-E-A-T + topical authority the *primary* ranking factor. A focused site with **deep, complete coverage of one topic** can outrank older, bigger sites. New sites can rank *without* backlinks if content is focused and intent-aligned. → **Kaiveron's edge: become the most topically-complete anime site on the web.** Every anime, genre, studio, season, character, watch-order, guide. Depth = authority.

2. **Realistic timeline (be patient, but it's not 2 years).** Impressions in **4–8 weeks**, consistent traffic/rankings in **3–6 months** for a focused site with clean structure + E-E-A-T. Head terms ("best anime") still take 12–24 months — win the **long tail** first.

3. **Video is a traffic multiplier.** Pages/results with video get **157% more organic traffic** and **41% higher CTR**; video shows in 26% of Google thumbnails. TikTok's algorithm still surfaces zero-follower accounts if the **first 3 seconds** hook. → Short-form video is non-optional.

4. **You can't out-backlink the incumbents — don't try.** MyAnimeList: DR 83, **35,500 linking sites**, ~76M visits/mo. AniList: ~15M visits/mo. You beat them on **long-tail pages they underserve + UGC freshness + design + AI**, not head-to-head on "anime."

**The strategy in one sentence:** Be the *most complete, best-designed, freshest* anime site for thousands of specific long-tail searches, turn every user action into indexable content, and let short-form video + shareable artifacts feed the loop.

---

## PART B — The step-by-step plan

### STAGE 0 — Get indexable (foundation) · *mostly done, needs deploy*
The gate. Nothing ranks until this is live.

1. **[DONE]** Server-rendered anime pages, `/genres/[slug]` + `/studios/[slug]` landing pages, 13 unique page titles, expanded sitemap, removed fake rating, AI-crawler allowlist.
2. **[YOU]** **Deploy to production.** ← *Everything is blocked on this.*
3. **[YOU]** Google Search Console → submit `sitemap.xml`.
4. **[YOU]** GSC → **URL Inspection → "Request Indexing"** on ~10 priority pages (home, `/bestanimelist`, `/genres`, `/genres/action`, `/studios`, top 5 anime).
5. **[YOU]** GSC → "Crawled – currently not indexed" → **"Validate Fix"** (re-checks after the server-render deploy).
6. **[YOU]** Verify in **Bing Webmaster Tools** too (Bing feeds ChatGPT search).

### STAGE 1 — Build topical authority (the 2026 ranking lever) · *biggest SEO win*
Deep, complete coverage = authority. Each page must carry **real, unique, visible data**.

7. **[ME]** **Watch-order guides** (top 12 franchises) — hours, filler %, canonicity. High-intent, low-competition, MAL underserves.
8. **[ME]** **Combination / long-tail pages** ("best {genre} anime {year}", "anime like {X}").
9. **[ME]** **"Where to watch {title}"** pages — commercial intent MAL doesn't own.
10. **[ME]** **Character & staff pages** (only with real bios/roles — high volume).
11. **[ME]** **One-sentence direct answer at the top** of every landing page (wins AI Overviews + featured snippets; ~44% of AI citations come from the first 30% of a page).
12. **[ME]** **Internal-linking clusters** — anime ⇄ its genres ⇄ studio ⇄ season. Keep every page ≤3 clicks from home.

### STAGE 2 — UGC engine (freshness + infinite long-tail) · *highest long-term ceiling*
User reviews/lists are fresh, long-tail content a static catalog can't match — and the #1 topical-authority multiplier.

13. **[ME]** Make **user reviews + public lists indexable** (server-rendered, canonical, in the sitemap).
14. **[ME]** Visible **aggregate score + review count** per anime (also unlocks legit rating rich results).
15. **[YOU]** **Seed reviews/lists** before launch so pages aren't empty (you + founding users).

### STAGE 3 — Authority signals (backlinks + listings) · *2–3 weeks, ~20 listings*
Less critical than in 2024 (topical authority does more now), but still accelerates trust for a new domain.

16. **[YOU]** **AlternativeTo + SaaSHub** — list as alternative to **MyAnimeList / AniList / Kitsu** (ranks for "MAL alternative" = switcher traffic). *Highest value.*
17. **[YOU]** **BetaList, Indie Hackers, F6S, FoundrList, Crunchbase, Wellfound** (dofollow backlinks). *(F6S: pick "Not raising" — skip the VC fields.)*
18. **[YOU]** Pitch **5–10 "best MyAnimeList alternatives" bloggers** (Google those queries → email the authors). Digital PR is the #1-rated link tactic for 2026.
19. **[YOU]** **Guest post / comment** genuinely on anime blogs and Reddit threads asking for MAL alternatives.

### STAGE 4 — Launch (one coordinated week)
20. **[YOU]** Product Hunt **"Coming Soon"** page; gather followers 1–2 weeks ahead.
21. **[YOU]** Line up **20–50 founding users** active on launch day (empty social product = dead).
22. **[YOU]** Launch **Tue–Thu, 12:01 AM PST**; same week → **Indie Hackers (Milestones), r/SideProject, WhatLaunched, LaunchVault**.

### STAGE 5 — The viral loop (compounding user acquisition) · *K-factor > 1*
Every user brings the next. This is what makes growth *compound* instead of linear.

23. **[ME]** **Anime Wrapped** — 9:16 vertical share cards, one-tap share to Stories/TikTok, provocative identity stats ("top 3% of Demon Slayer watchers").
24. **[ME]** **OG share cards** on every profile, list, and review (they spread as screenshots on Reddit/X/IG — Letterboxd's #1 growth mechanism).
25. **[YOU]** Seed 5 example Wrappeds/rankings → fans copy the format → each share is branded.

### STAGE 6 — Free distribution (do daily) · *where the users actually are*
26. **[YOU]** **Daily short-form video** (TikTok/Reels/Shorts). Hook in 3 sec, post **3–5×/week for 8+ weeks** minimum, optimize for **Saves/Shares**. Tier lists, "your list says this about you," AI-picks-my-anime. Same clip → all 3 platforms.
27. **[YOU]** **Reddit** — be a real member of r/Animesuggest, r/anime, r/MyAnimeList; answer rec threads genuinely (never spam — anime subs ban fast). Reddit out-performed Product Hunt for early users in 2026.
28. **[YOU]** **Discord** — your own server + join anime/seasonal-watch servers. Community-first brands grow 3–4× faster.
29. **[YOU]** **Anitwitter / X** — build in public; reply into seasonal-anime discourse.
30. **[YOU]** **Email list** — capture emails (waitlist, Wrapped) and send a weekly "what aired / new this season" — underrated repeat-traffic channel.

### STAGE 7 — Editorial content (topical authority + AI citations)
31. **[YOU/ME]** **Seasonal guides** ("Fall 2026: the 15 worth watching"), refreshed each season, with **named author bylines** + "Updated 2026" + FAQ.
32. **[YOU]** **Repurpose** each guide into a short video (#3 fact: video = 157% more traffic) and a Reddit/X post.

### STAGE 8 — Measure & iterate (weekly, 10 min)
33. **[YOU]** GSC weekly: **pages indexed** (climbing), **impressions** (leading indicator), **avg position** on tracked long-tail queries.
34. **[YOU]** GA4: segment **AI referrals** (chatgpt.com, perplexity.ai) + track signups per channel → double down on what works.
35. **[YOU]** Expectation: impressions 4–8 weeks, first long-tail rankings 3–6 months, head terms 12–24 months.

---

## THE CRITICAL PATH (if you do only 7 things)
**2 (deploy) → 4 (request indexing) → 7 (watch-order guides) → 13 (indexable UGC) → 23 (Anime Wrapped) → 26 (daily short-form) → 27 (Reddit).**
Everything else amplifies these seven.

## Who does what
- **[ME] code blocks:** Stages 1, 2, 5, 7 — steps 7–14, 23–24, 31. Say the word and I build them in priority order.
- **[YOU] human work:** deploy, GSC, listings, launch, video, community, email.

## What NOT to waste time on (debunked / low-ROI)
- ❌ `llms.txt` (no AI engine uses it) · ❌ chasing backlinks from 100 junk directories (do ~20 quality, stop) · ❌ word-count/uniqueness "rules" (no such Google thresholds) · ❌ head terms in year one · ❌ fabricated ratings (manual-action risk) · ❌ B2B review sites like G2/Capterra (wrong audience for a consumer app).

---

### Sources (fresh, 2026)
- Topical authority as primary ranking factor: [Two Stones — SEO for new sites](https://twostones.co/Blog/digital-marketing/seo-for-new-websites-how-to-rank-faster-on-google/) · [Productive Blogging — topical authority](https://www.productiveblogging.com/topical-authority/) · [GeoSEO — topical authority 2026](https://geoseo.digital/insights/topical-authority-2026/)
- Organic traffic channels / video stats: [Performance Marketing Advisors](https://www.performancemarketingadvisors.com/insights/best-strategies-to-grow-organic-website-traffic-2026-guide) · [Ten Speed — increase organic traffic](https://www.tenspeed.io/blog/increase-organic-traffic)
- TikTok / community zero-budget growth: [12AM Agency — TikTok organic](https://12amagency.com/blog/what-is-tiktok-organic-marketing/) · [SEM Nexus — app growth playbook](https://semnexus.com/tiktok-organic-and-paid-a-2026-app-growth-playbook)
- Competitor benchmarks: [MyAnimeList traffic (SimilarWeb)](https://www.similarweb.com/website/myanimelist.net/) · [AniList traffic (SimilarWeb)](https://www.similarweb.com/website/anilist.co/) · [MAL backlinks (Ahrefs)](https://ahrefstop.com/websites/myanimelist.net)
- Directories/launch: [FoundrList](https://www.foundrlist.com/blogs/complete-startup-directory-list-2026) · [Indie Hackers — places to launch](https://www.indiehackers.com/post/list-of-75-places-to-launch-your-startup-7d0358e229)

*Compiled June 2026 from an adversarially fact-checked research corpus + live 2026 search. Confidence-graded details in `SEO-PLAYBOOK.md`.*
