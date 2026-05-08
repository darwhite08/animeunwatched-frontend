# AnimeUnwatched — Frontend CLAUDE.md

Repo: `animeunwatched-frontend` | Peer: `animeunwatched-backend`
Stack: Next.js 16 (App Router) · TypeScript strict · Tailwind CSS · shadcn/ui · TanStack Query · Zustand · Socket.io · Vitest · Playwright

**Read order on a fresh start:**
1. This file → `docs/architecture.md` → `docs/api-client.md` → `docs/peer/backend-api-contract.md` → `docs/progress.md`

---

## What this project is

AnimeUnwatched is an anime social platform: catalog browsing, watch-list tracking, posts/threads/clubs, creator tools (blogs, polls, feed), and a leaderboard/streak system. The frontend talks to the backend exclusively over `POST /api/v1` REST + `/socket/v1` WebSocket. No shared code between repos.

---

## Folder layout (source of truth: `docs/architecture.md`)

```
src/
├── app/
│   ├── (public)/          # landing, login, discover, poll, rate, bestanimelist, ai-discover
│   ├── (dashboard)/       # dashboard, profile, watchlist, readlist, streak, leaderboard
│   ├── (creator)/         # creator hub: overview, feed, blog, polls, create/*
│   └── layout.tsx
├── components/
│   ├── layout/            # Navbar, Sidebar, Footer, HeroSection, SearchModal, …
│   ├── dashboard/         # DashboardGrid, DashboardHeader, Sidebar, cards/*
│   ├── creator/creator/   # CreatorSidebar, CreatorDashboard, CreatorLevelCard, BlogCard, ReaderSection
│   ├── ai-discover/       # AIDiscoverHero, AIPromptInput, AIResultsGrid
│   ├── bestanimelist/     # AnimeCard, AnimeModal, FilterDrawer, CategoryTabs, …
│   ├── streak/            # MainStreakCard, StreakHeatmap, ProgressCard, AchievementGrid, …
│   ├── watchlist/         # WatchCard, WatchlistTabs
│   ├── leaderboard/       # TopThree, RankingTable
│   ├── notifications/     # NotificationBell, NotificationDropdown, useNotifications
│   └── poll/              # PollCard
├── features/creator/data/ # feedData.ts (mock feed)
├── lib/
│   ├── api/client.ts      # fetch wrapper + single-flight refresh interceptor
│   ├── api/endpoints.ts   # one fn per backend endpoint
│   ├── api/types.ts       # DTOs — hand-written from peer/backend-api-contract.md
│   ├── auth/store.ts      # Zustand: accessToken in memory only
│   ├── auth/useSession.ts
│   ├── socket.ts          # Socket.io singleton
│   ├── mockAuth.ts        # dev/test mock auth helper
│   └── utils/cn.ts | markdown.ts | time.ts
├── hooks/                 # TanStack Query hooks per domain (useAnime, useLists, …)
└── stores/                # ui.store.ts, notifications.store.ts
```

---

## Architecture quick-ref (`docs/architecture.md`)

| Surface | Render mode | Why |
|---|---|---|
| `/anime/:id` | RSC shell + client widgets | SEO + interactivity |
| `/u/:username` | RSC shell + client follow button | SEO |
| `/blog/:slug` | RSC | SEO |
| `/` home feed | Client | Auth-gated, interactive |
| `/discover` | Client | Interactive |
| `/search` | Client | Debounced typing |
| `/notifications` | Client | Auth-gated |
| `/settings` | Client | Form-heavy |

**Auth flow:** Access token → Zustand memory only. Refresh cookie → httpOnly, backend-managed. `lib/api/client.ts` intercepts 401 → single-flight `POST /auth/refresh` → retry. Fail → redirect `/login?next=`.

**Socket:** `lib/socket.ts` singleton. Connects after login with `auth: { token }`. Listens to `notification.new` → `stores/notifications.store.ts`. Re-emits token after refresh.

**Types:** DTOs live in `lib/api/types.ts` only. Never import from backend repo. Optionally codegen: `npx openapi-typescript http://localhost:4000/api/v1/openapi.json -o lib/api/types.gen.ts`

---

## API client (`docs/api-client.md`)

`lib/api/client.ts` — thin fetch wrapper:
- Prepends `NEXT_PUBLIC_API_BASE/api/v1`
- Attaches `Authorization: Bearer <token>`
- Sets `credentials: 'include'`
- On 401: single-flight refresh, retry once; fail → clear + redirect
- Throws `ApiError { status, code, message }`

Error handling by code: `VALIDATION` → field errors | `UNAUTHORIZED` → silent (interceptor) | `FORBIDDEN` → toast | `NOT_FOUND` → 404 | `CONFLICT` → toast | `RATE_LIMITED` → toast | `INTERNAL` → toast + Sentry

**Endpoint inventory** (full details in `docs/peer/backend-api-contract.md`):

| Domain | Frontend functions |
|---|---|
| auth | `register`, `login`, `logout`, `logoutAll`, `me` |
| users | `getUser`, `updateMe`, `follow`, `unfollow`, `getFollowers`, `getFollowing` |
| anime | `getAnime`, `browseAnime`, `getSeason`, `getAnimeThreads`, `getAnimeReviews` |
| lists | `getList`, `upsertListEntry`, `removeListEntry` |
| posts | `getFeed`, `getDiscover`, `getPost`, `createPost`, `deletePost`, `likePost`, `unlikePost`, `getComments`, `createComment` |
| clubs | `listClubs`, `createClub`, `getClub`, `joinClub`, `leaveClub`, `setMemberRole` |
| threads | `getThread`, `createClubThread`, `createAnimeThread`, `patchThread`, `deleteThread`, `getReplies`, `createReply` |
| reviews | `createReview`, `patchReview`, `deleteReview`, `likeReview`, `unlikeReview` |
| blogs | `listBlogs`, `createBlog`, `getBlog`, `patchBlog`, `deleteBlog` |
| notifications | `listNotifications`, `getUnreadCount`, `markRead`, `markAllRead` |
| search | `search` |
| moderation | `createReport`, `listReports`, `resolveReport`, `createAction`, `listActions` |

---

## Backend catalog / mock data (`docs/peer/backend-architecture.md`, backend `docs/mock.md`)

The backend mirrors Jikan anime data into its own Postgres. Provider is swappable via `CATALOG_PROVIDER` env (`jikan` | `mal` | `anilist`). Swap is done backend-side via `./scripts/swap.sh <provider>` — the frontend sees no difference; it always calls `/api/v1/anime/*`.

Frontend mock: `lib/mockAuth.ts` + `features/creator/data/feedData.ts` for dev/test.

---

## Progress (`docs/progress.md`) — current state

All phases are **Todo** — this is a greenfield project. Implementation order:

- **Phase 0** Bootstrap (Next.js, Tailwind, shadcn, TanStack Query, Zustand, CI)
- **Phase 1** Identity (auth pages, refresh interceptor, settings, profile)
- **Phase 2** Catalog (anime detail, season browse, search autocomplete)
- **Phase 3** Tracking (list widget, optimistic updates, user list page)
- **Phase 4** Social v1 (posts, home feed, discover, notifications, socket)
- **Phase 5** Community (clubs, threads, reply tree, spoiler tags)
- **Phase 6** Long-form (reviews, blog editor, search results)
- **Phase 7** Moderation (report modal, admin queue)
- **Phase 8** Polish (PWA, a11y CI, Sentry, i18n, skeleton loaders)

When moving a ticket to Done, append the short commit hash: `- [x] ticket name (abc1234)`. Update `docs/api-client.md` if a new endpoint is wired; update `docs/tests.md` if test plan changes.

---

## Conventions (`docs/conventions.md`)

- **Naming:** Pages → `app/<route>/page.tsx`; Components → PascalCase; Hooks → `useX.ts`; Stores → `x.store.ts`
- **Structure:** hooks → derived → effects → handlers → early returns → render
- **TypeScript:** strict, no `any`, named exports preferred over default for components
- **Imports:** `@/` alias; order: third-party → `@/lib` → `@/components` → `@/hooks` → relative
- **Tailwind:** design tokens only (no hex), `cn()` from `lib/utils/cn.ts`, CVA for 2+ visual states
- **Forms:** React Hook Form + Zod resolver; schemas live next to the component
- **Auth state:** Never localStorage/sessionStorage. Access token in Zustand memory only.
- **Markdown:** Only via `lib/utils/markdown.ts` with DOMPurify. Never raw `dangerouslySetInnerHTML`.
- **Commits:** Conventional commits scoped by feature: `feat(auth):`, `fix(api):`, `docs(progress):`

**PR checklist:** lint green → typecheck green → tests added → `docs/api-client.md` updated → `docs/progress.md` ticket moved → no new console.log → loading/empty/error states handled.

---

## Flows quick-ref (`docs/flows.md`)

1. **Register** → RHF form → `useMutation(register)` → setAccess → socket connect → home feed
2. **Browse → track** → season page (SSR) → anime detail → `<ListStatusWidget>` → `useUpsertListEntry` (optimistic)
3. **Post + notification** → `<PostComposer>` → createPost (optimistic) || socket `notification.new` → bell badge → toast
4. **Club thread** → club detail → join/leave (optimistic) → `<ThreadComposer>` → createClubThread
5. **Review** → anime page → `<ReviewComposer>` modal → createReview
6. **Search** → header debounce 250ms → `/search?q=` tabs
7. **Refresh rotation** → 401 → single-flight refresh → retry; fail → redirect login

---

## Setup (`docs/setup.md`)

```bash
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE=http://localhost:4000
# NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
# API_BASE=http://localhost:4000
npm run dev   # http://localhost:3000
```

Backend must be running first. After pulling: `npm install`. Tests: `npm test` / `npm run test:e2e`.

Sync peer docs when backend updates:
```bash
curl -fsSL https://raw.githubusercontent.com/darwhite08/animeunwatched-backendnew/main/docs/architecture.md -o docs/peer/backend-architecture.md
curl -fsSL https://raw.githubusercontent.com/darwhite08/animeunwatched-backendnew/main/docs/api-contract.md -o docs/peer/backend-api-contract.md
```

---

## Working with Claude Code

**Fresh start:**
> "Read CLAUDE.md, then docs/progress.md. Tell me what's next."

**Add a page:**
> "Implement [page]. Update docs/api-client.md if a new endpoint is consumed. Move the ticket in docs/progress.md."

**Backend ships new endpoint:**
> "Re-sync docs/peer/backend-api-contract.md, then add the function to lib/api/endpoints.ts and a hook in hooks/."

**Mark ticket done:**
> "Move '[ticket]' to Done in docs/progress.md with commit hash $(git rev-parse --short HEAD). Update docs/tests.md if tests changed."

---

## Key constraints

- No shared code with backend repo. Types defined in `lib/api/types.ts` only.
- No localStorage/sessionStorage for auth state. Ever.
- No `dangerouslySetInnerHTML` outside `lib/utils/markdown.ts`.
- Every async surface: skeleton loader (not spinner on first paint) + empty state with CTA + error state with retry.
- Performance budgets: TTFB on anime detail < 400ms, LCP on 4G < 2.5s, first-load JS gzip < 200kB.
