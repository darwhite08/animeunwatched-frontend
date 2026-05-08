# Frontend architecture

## Stack

- Next.js 15 (App Router)
- TypeScript 5.x strict
- Tailwind CSS 4
- shadcn/ui (Radix primitives)
- TanStack Query (server state)
- Zustand (client-only UI state)
- React Hook Form + Zod (forms)
- Socket.io client (realtime)
- Lucide icons
- next-intl (i18n)
- Vitest + React Testing Library (unit), Playwright (e2e)

## Folder layout

```
animeunwatchedfrontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # home feed
│   │   ├── discover/page.tsx
│   │   ├── anime/
│   │   │   ├── [id]/page.tsx
│   │   │   └── season/[year]/[season]/page.tsx
│   │   ├── u/[username]/
│   │   │   ├── page.tsx
│   │   │   ├── list/page.tsx
│   │   │   └── blog/page.tsx
│   │   ├── clubs/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── threads/[id]/page.tsx
│   │   ├── posts/[id]/page.tsx
│   │   ├── reviews/[id]/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── search/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── settings/page.tsx
│   │   └── admin/moderation/page.tsx
│   ├── api/                                  # only proxies/health if needed
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── ui/                                   # shadcn primitives
│   ├── anime/
│   │   ├── AnimeCard.tsx
│   │   ├── AnimeHero.tsx
│   │   ├── ListStatusWidget.tsx
│   │   └── SeasonFilter.tsx
│   ├── post/
│   │   ├── PostCard.tsx
│   │   ├── PostComposer.tsx
│   │   └── PostFeed.tsx
│   ├── thread/
│   │   ├── ThreadView.tsx
│   │   ├── ThreadComposer.tsx
│   │   └── ReplyTree.tsx
│   ├── club/
│   │   ├── ClubCard.tsx
│   │   └── ClubHeader.tsx
│   ├── review/
│   │   ├── ReviewCard.tsx
│   │   └── ReviewComposer.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   └── BlogEditor.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   └── FollowButton.tsx
│   ├── notification/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationList.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                         # fetch wrapper, refresh interceptor
│   │   ├── endpoints.ts                      # one fn per endpoint
│   │   └── types.ts                          # DTO types — defined here, NOT imported from backend
│   ├── auth/
│   │   ├── store.ts                          # Zustand: access token in memory
│   │   └── useSession.ts
│   ├── socket.ts                             # Socket.io singleton
│   ├── hooks/
│   │   ├── useDebouncedValue.ts
│   │   └── useIntersection.ts
│   └── utils/
│       ├── cn.ts
│       ├── markdown.ts                       # sanitized markdown rendering
│       └── time.ts
├── stores/
│   ├── ui.store.ts                           # modals, drawers
│   └── notifications.store.ts                # unread count, recent items
├── hooks/                                    # TanStack Query hooks per domain
│   ├── useAnime.ts
│   ├── useLists.ts
│   ├── usePosts.ts
│   ├── useClubs.ts
│   ├── useThreads.ts
│   ├── useReviews.ts
│   ├── useBlogs.ts
│   └── useNotifications.ts
├── public/
├── styles/
├── tests/
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

## Server vs Client components

| Surface                          | Mode                                      | Why                       |
| -------------------------------- | ----------------------------------------- | ------------------------- |
| `/anime/:id`                     | RSC for shell, Client for list widget     | SEO + interactivity       |
| `/u/:username`                   | RSC for shell, Client for follow button   | SEO                       |
| `/blog/:slug`                    | RSC                                       | SEO                       |
| `/` (home feed)                  | Client                                    | Auth-gated, interactive   |
| `/discover`                      | Client (RSC for top-of-page cards if SSR) | Interactive               |
| `/search`                        | Client                                    | Debounced typing          |
| `/clubs/:slug`                   | RSC for shell, Client for thread list     | SEO + pagination          |
| `/notifications`                 | Client                                    | Auth-gated                |
| `/settings`                      | Client                                    | Auth-gated, form-heavy    |

Hydration: SSR'd data is passed into TanStack Query via `dehydrate`/`hydrate` so the same hooks work on both sides.

## Data fetching

- Server components fetch via `fetch()` directly to backend with `cache: 'no-store'` for personalized pages, default cache for public pages.
- Client components use TanStack Query hooks from `hooks/` which call functions in `lib/api/endpoints.ts`.
- Mutations use `useMutation` with optimistic updates for: list status change, like, follow, unfollow.

## Auth

- Access token: kept in `lib/auth/store.ts` (Zustand, memory only).
- Refresh cookie: httpOnly, set by the backend, never read on the frontend.
- Interceptor in `lib/api/client.ts`:
  1. On any 401, call `POST /auth/refresh` (sends cookie automatically).
  2. If 200 → store new access token, retry original request once.
  3. If refresh fails → clear store, redirect to `/login?next=<path>`.
- After login, the home page mounts the socket connection.

## Socket

- `lib/socket.ts` exports a singleton.
- Connects with `auth: { token: <access> }` after login.
- Subscribes to `notification.new`; pushes into `stores/notifications.store.ts`.
- Reconnects automatically; re-emits the access token after refresh.

## Type strategy

DTOs live in `lib/api/types.ts`, defined by hand from `docs/peer/backend-api-contract.md`. Optionally generated from the backend's `/api/v1/openapi.json` into `lib/api/types.gen.ts`. Either way, **types are never imported from the backend repo**.

## Forms

- React Hook Form for state.
- Zod schemas mirror backend rules (duplicated, kept in sync via `api-contract.md`).
- Server is still authoritative; frontend validation is UX, not security.

## Markdown + spoilers

- `lib/utils/markdown.ts` renders markdown to sanitized HTML via DOMPurify + a markdown parser.
- Spoiler syntax `>!hidden!<` renders as a click-to-reveal block.
- Never use `dangerouslySetInnerHTML` outside this helper.

## Theming

- Tailwind tokens in `tailwind.config.ts` map to CSS variables.
- Dark mode default; light mode toggle.
- shadcn/ui tokens follow the Tailwind config.

## Performance budgets

| Surface             | Metric          | Budget |
| ------------------- | --------------- | ------ |
| Anime detail (SSR)  | TTFB            | 400 ms |
| Anime detail (SSR)  | LCP on 4G       | 2.5 s  |
| Home feed (CSR)     | TTI             | 3.0 s  |
| First-load JS       | gzip            | 200 kB |

Use Next.js dynamic imports for heavy editors (markdown, blog), `next/image` everywhere, font subsetting.

## Accessibility

- All interactive elements reachable via keyboard.
- Visible focus rings.
- `aria-` attributes on custom controls; shadcn/Radix handles most.
- Color contrast tested in CI via axe-core.
