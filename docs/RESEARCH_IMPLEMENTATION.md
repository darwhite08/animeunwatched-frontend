# Kaiveron — Research-Driven Implementation Plan
*Generated: 2026-05-21 | Deep research session*

---

## Research Summary

### What Anime Platform Users Want (from MAL/AniList communities)

**Top Pain Points on existing platforms:**
- MAL UI feels outdated, cluttered
- AniList: smaller database, wants private messaging, better mobile
- No real-time social features (danmu/live reactions like Bilibili)
- No "watch together" synchronised viewing
- Inflexible list management (only 5 statuses)
- No discovery based on mood/vibe
- Poor notification systems
- No offline support / PWA

**Most Requested Features:**
1. Streak & habit-tracking (Duolingo model → 7-day streak = 90% Day-30 retention)
2. Watch Party / sync viewing
3. Episode discussion threads per episode (not just anime)
4. "Aha moment" in <5 minutes (users who hit it are 3x more likely to retain)
5. Personalised "what to watch next" powered by actual watch history
6. Custom list categories beyond the 5 defaults
7. Social feed with activity (who watched what, reviews in real-time)
8. Club/group challenges ("watch this arc together this weekend")
9. Spoiler-safe community (tag system)
10. Mobile-first experience

---

### Post-Launch Startup Risks (What Founders Face)

**Top 5 Failure Modes:**
1. **Churn cliff** — retention drops to 6-7% by Day 30 (industry avg). Social apps that do well hit 15-20%.
2. **Support cliff** — scaling sales 3x faster than support = 50% higher churn in 12mo
3. **Security gaps** — stolen credentials = 24% of breaches. Poor rate limiting = credential stuffing
4. **Cold start problem** — no content/users → new users leave immediately
5. **No monetisation path** — free forever isn't viable; need clear premium tier

**Critical Retention Numbers:**
- Day-1: 26% avg (need >40% to be in top quartile)
- Day-7: 7% avg (need >15%)
- Day-30: 6-7% avg (need >20%)
- Key insight: Duolingo streaks → 90% day-30 retention if 7-day streak maintained

**Security Checklist (OWASP 2025):**
- Rate limiting on all auth endpoints ✅ (done)
- Injection protection ✅ (Prisma parameterised queries)
- Broken auth detection ← NEEDS: account lockout after N failed logins
- API abuse protection ← NEEDS: per-user request quotas
- Supply chain security ← NEEDS: dependabot / npm audit in CI
- Error handling (A10 new in 2025) ← NEEDS: never leak stack traces in production
- CORS policy ✅ (done)
- Input sanitisation ✅ (Zod)

**Post-Launch Monetisation (what anime fans pay for):**
- Ad-free experience ($7-16/mo range industry standard)
- Offline mode
- Custom themes / profile customisation
- Early access to features
- Exclusive badges / cosmetics
- Higher API rate limits

---

## Implementation Queue (Priority Order)

### CRITICAL — Retention & Activation
- [ ] Day-1 "Aha Moment" acceleration: auto-populate 5 anime from onboarding
- [ ] Streak persistence fix (currently rep-based estimate, should be real)
- [ ] Email digest: "Your friends watched X this week" (re-engagement)
- [ ] Push notification groundwork (browser notifications API)
- [ ] Empty state CTAs everywhere (no dead ends)

### HIGH — Security Guards
- [ ] Account lockout: 5 failed logins → 15min lockout
- [ ] `npm audit` in CI pipeline
- [ ] Never expose stack traces in production error responses
- [ ] User-facing API rate limit headers (X-RateLimit-*)
- [ ] Session invalidation on password change

### HIGH — Features Users Want
- [ ] Episode-level discussion threads
- [ ] "Mood picker" → anime recommendations (vibe-based, not just genre)
- [ ] Custom list statuses (beyond 5 defaults)
- [ ] Spoiler tag in posts/reviews
- [ ] Club "watch challenge" system
- [ ] Activity feed improvements (what friends watched today)

### MEDIUM — Performance (Core Web Vitals)
- [ ] LCP < 2.5s: priority on hero images, preload critical fonts
- [ ] INP < 200ms: reduce JS hydration, more RSC
- [ ] CLS < 0.1: explicit image dimensions everywhere
- [ ] Bundle analysis: identify and split large chunks

### MEDIUM — Monetisation Foundation
- [ ] Premium plan UI (pricing page)
- [ ] Feature flags for premium gating
- [ ] Usage analytics (which features drive retention)

### LOW — Nice to Have
- [ ] Watch Party (sync viewing) — complex, Q3 placeholder already exists
- [ ] Danmu/live comments on episodes
- [ ] Import from MAL/AniList
- [ ] Manga chapter tracking (real API)

---

## Implementation Log

| Date | Feature | Files Changed | Status |
|------|---------|---------------|--------|
| 2026-05-21 | Research doc created | docs/RESEARCH_IMPLEMENTATION.md | ✅ |
| 2026-05-21 | Account lockout (5 failures → 15min) | TBD | 🔄 |
| 2026-05-21 | Stack trace guard in production | TBD | 🔄 |
| 2026-05-21 | npm audit in CI | TBD | 🔄 |
| 2026-05-21 | Episode threads | TBD | 🔄 |
| 2026-05-21 | Mood picker | TBD | 🔄 |
| 2026-05-21 | Spoiler tags | TBD | 🔄 |
| 2026-05-21 | Activity feed | TBD | 🔄 |
| 2026-05-21 | Empty states | TBD | 🔄 |
| 2026-05-21 | Performance (LCP/CLS) | TBD | 🔄 |
