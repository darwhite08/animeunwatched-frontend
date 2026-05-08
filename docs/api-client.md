# API client conventions

How the frontend talks to the backend. Source of truth for the **shape** of every endpoint is `docs/peer/backend-api-contract.md` (a mirror of the backend's `api-contract.md`). When that mirror changes, this file may need updates too.

## Layout

```
lib/api/
├── client.ts        # fetch wrapper + refresh interceptor
├── endpoints.ts     # one typed function per backend endpoint
└── types.ts         # DTOs — defined here by hand (or codegen'd)
```

DTO types are **never** imported from the backend repo. See `architecture.md` → "Type strategy".

## `client.ts`

A thin wrapper around `fetch` that:

1. Prepends `${env.NEXT_PUBLIC_API_BASE}/api/v1` to the path.
2. Attaches `Authorization: Bearer <accessToken>` from the Zustand auth store if present.
3. Sets `credentials: 'include'` so the refresh cookie travels.
4. Parses JSON, throws an `ApiError` on non-2xx with `{ status, code, message }`.
5. On 401: calls `POST /auth/refresh` once, then retries the original request once. If refresh fails, clears auth state and throws.

Skeleton:

```ts
type ApiOptions = RequestInit & { skipRefresh?: boolean };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { skipRefresh, ...init } = opts;
  const token = useAuth.getState().accessToken;
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (res.status === 401 && !skipRefresh) {
    await refreshTokenOnce();
    return api<T>(path, { ...opts, skipRefresh: true });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error?.code ?? 'INTERNAL', body?.error?.message ?? res.statusText);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

async function refreshTokenOnce() {
  // single-flight: if a refresh is in progress, wait for it
  if (isRefreshing) return new Promise<void>((resolve) => refreshQueue.push(resolve));
  isRefreshing = true;
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      useAuth.getState().clear();
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      throw new ApiError(res.status, 'UNAUTHORIZED', 'refresh failed');
    }
    const { accessToken } = await res.json();
    useAuth.getState().setAccess(accessToken);
  } finally {
    isRefreshing = false;
    refreshQueue.forEach((resolve) => resolve());
    refreshQueue = [];
  }
}
```

Single-flight refresh: if 5 requests fire 401 simultaneously, only one `/auth/refresh` is sent; the other 4 wait, then retry.

## `endpoints.ts`

Group endpoints by domain. One function per backend route. Function name mirrors the route's intent.

```ts
import { api } from './client';
import type { Anime, ListEntry, Post, User } from './types';

// Auth
export const register = (body: { email: string; username: string; displayName: string; password: string }) =>
  api<{ user: User; accessToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) });

export const login = (body: { email: string; password: string }) =>
  api<{ user: User; accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const me = () => api<{ user: User }>('/auth/me');

// Anime
export const getAnime = (id: string) =>
  api<{ anime: Anime; listEntry: ListEntry | null }>(`/anime/${id}`);

export const browseAnime = (q: { q?: string; year?: number; season?: string; genre?: string; page?: number }) =>
  api<{ data: Anime[]; meta: { total: number; page: number; limit: number; pages: number } }>(
    `/anime?${new URLSearchParams(q as Record<string, string>)}`,
  );

// Lists
export const upsertListEntry = (animeId: string, body: Partial<ListEntry>) =>
  api<{ entry: ListEntry }>(`/lists/me/${animeId}`, { method: 'PUT', body: JSON.stringify(body) });

export const removeListEntry = (animeId: string) =>
  api<void>(`/lists/me/${animeId}`, { method: 'DELETE' });

// Posts
export const getFeed = (cursor?: string) =>
  api<{ data: Post[]; meta: { nextCursor: string | null } }>(
    `/posts/feed${cursor ? `?cursor=${cursor}` : ''}`,
  );

export const createPost = (body: { content: string; animeId?: string }) =>
  api<{ post: Post }>('/posts', { method: 'POST', body: JSON.stringify(body) });
```

Pattern: one named export per endpoint, fully typed.

## TanStack Query hooks (in `hooks/`)

Each domain module has its own hook file. Hooks wrap the endpoint functions with a stable query key.

```ts
// hooks/useAnime.ts
import { useQuery } from '@tanstack/react-query';
import { getAnime } from '@/lib/api/endpoints';

export const animeQueryKey = (id: string) => ['anime', id] as const;

export function useAnime(id: string) {
  return useQuery({
    queryKey: animeQueryKey(id),
    queryFn: () => getAnime(id),
    staleTime: 60_000,
  });
}
```

Mutations use `useMutation` with optimistic updates where the requirements call for it (list status, like, follow).

```ts
// hooks/useLists.ts (excerpt)
export function useUpsertListEntry(animeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ListEntry>) => upsertListEntry(animeId, body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: animeQueryKey(animeId) });
      const prev = qc.getQueryData(animeQueryKey(animeId));
      qc.setQueryData(animeQueryKey(animeId), (old: any) =>
        old ? { ...old, listEntry: { ...(old.listEntry ?? {}), ...body } } : old,
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(animeQueryKey(animeId), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: animeQueryKey(animeId) }),
  });
}
```

## DTO types (`types.ts`)

Either hand-maintained from `docs/peer/backend-api-contract.md`, or codegen'd from `/api/v1/openapi.json` via:

```bash
npx openapi-typescript http://localhost:4000/api/v1/openapi.json -o lib/api/types.gen.ts
```

If you go with codegen, re-export the named types from `types.ts` so application code never touches `.gen.ts` directly. Keep one path of truth for application code.

## Error handling in UI

`ApiError` reaches the UI through TanStack Query's error state.

- `VALIDATION` → show field errors (or generic toast if not field-level)
- `UNAUTHORIZED` → silent (interceptor already redirected)
- `FORBIDDEN` → toast "You don't have access to do that"
- `NOT_FOUND` → page-level 404 component for route-level errors; toast for action errors
- `CONFLICT` → toast with the message
- `RATE_LIMITED` → toast "Slow down, try again in a moment"
- `INTERNAL` → toast "Something went wrong" + Sentry capture

## Server components

Server components call `fetch()` directly without going through `client.ts`, because:

- They run on the Next.js server, not the browser
- They have no auth store; they read the access token from the request cookies via `next/headers` if needed
- They can't trigger a refresh (refresh requires the browser cookie context)

Pattern for personalized SSR:

```ts
// app/(main)/anime/[id]/page.tsx
import { cookies, headers } from 'next/headers';

async function getAnimeSSR(id: string) {
  const cookieStore = cookies();
  const res = await fetch(`${process.env.API_BASE}/api/v1/anime/${id}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}
```

If the SSR fetch is 401, render the page in unauthenticated mode rather than try to refresh server-side.

## Endpoint inventory

Mirrors the backend's contract. Keep it short — full details live in `docs/peer/backend-api-contract.md`.

| Domain        | Endpoints (frontend functions)                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| auth          | `register`, `login`, `logout`, `logoutAll`, `me`                                                                                              |
| users         | `getUser`, `updateMe`, `follow`, `unfollow`, `getFollowers`, `getFollowing`                                                                   |
| anime         | `getAnime`, `browseAnime`, `getSeason`, `getAnimeThreads`, `getAnimeReviews`                                                                  |
| lists         | `getList`, `upsertListEntry`, `removeListEntry`                                                                                               |
| posts         | `getFeed`, `getDiscover`, `getPost`, `createPost`, `deletePost`, `likePost`, `unlikePost`, `getComments`, `createComment`                     |
| clubs         | `listClubs`, `createClub`, `getClub`, `joinClub`, `leaveClub`, `setMemberRole`                                                                |
| threads       | `getThread`, `createClubThread`, `createAnimeThread`, `patchThread`, `deleteThread`, `getReplies`, `createReply`                              |
| reviews       | `createReview`, `patchReview`, `deleteReview`, `likeReview`, `unlikeReview`                                                                   |
| blogs         | `listBlogs`, `createBlog`, `getBlog`, `patchBlog`, `deleteBlog`                                                                               |
| notifications | `listNotifications`, `getUnreadCount`, `markRead`, `markAllRead`                                                                              |
| search        | `search`                                                                                                                                      |
| moderation    | `createReport`, `listReports`, `resolveReport`, `createAction`, `listActions`                                                                 |
