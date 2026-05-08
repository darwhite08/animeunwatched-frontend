# Conventions

## File naming

- Pages: `app/<route>/page.tsx`
- Layouts: `app/<route>/layout.tsx`
- Route groups: `app/(auth)/`, `app/(main)/`
- Components: PascalCase files: `components/anime/AnimeCard.tsx`
- Hooks: camelCase prefixed `use`: `hooks/useAnime.ts`
- Stores: kebab-case suffix `.store.ts`: `stores/notifications.store.ts`
- Utilities: camelCase: `lib/utils/cn.ts`
- Tests: colocated `*.test.tsx` next to the source, OR under `tests/` for e2e
- Server-only files: end in `.server.ts` (rare; mostly Next infers from App Router)

## Component structure

```tsx
'use client';

import { …named… } from 'react';
import { …named… } from '…libs…';
import { …local… } from '@/…';

type Props = { … };

export function ComponentName({ … }: Props) {
  // 1. hooks
  // 2. derived state
  // 3. effects
  // 4. handlers
  // 5. early returns (loading, empty, error)
  // 6. main render
}
```

Server components don't include `'use client'`. Default to server unless the component needs state, effects, browser APIs, or event handlers.

## Code style

- TypeScript strict mode on. `any` is a code smell.
- Props are explicit: no `React.FC`, no implicit children.
- Prefer named exports over default exports for components.
- Prefer composition over prop drilling; use Zustand only for genuinely cross-cutting state.
- Fetching: server components → `fetch()` directly; client components → TanStack Query hooks.
- Don't `dangerouslySetInnerHTML` outside `lib/utils/markdown.ts`.
- No localStorage/sessionStorage for auth or sensitive state. Ever.

## Imports

- Absolute imports via `@/` alias from project root.
- Order: stdlib (none in browser) → third-party → `@/lib` → `@/components` → `@/hooks` → relative.

## Tailwind

- Use design tokens from `tailwind.config.ts`. Don't sprinkle hex codes.
- `cn()` helper from `lib/utils/cn.ts` for conditional classes.
- Component variants via `class-variance-authority` if a component has more than 2 visual states.

## Forms

- React Hook Form + Zod resolver.
- Schemas live next to the page or component that uses them, named `<feature>.schema.ts`.
- Keep schemas mirroring backend Zod rules — note the backend is still authoritative.

## Commits

Conventional commits, scoped by feature area:

- `feat(auth): add register page`
- `fix(api): single-flight refresh`
- `chore(deps): bump next to 15.0.3`
- `docs(api-client): document refresh interceptor`

## Branching

- `main` always deployable.
- Feature branches: `feat/<short-kebab>`. Squash on merge.
- Hotfix: `hotfix/<short-kebab>`.

## PR checklist

- [ ] Lint green (`npm run lint`)
- [ ] Typecheck green (`npx tsc --noEmit`)
- [ ] Tests added or updated
- [ ] `docs/api-client.md` endpoint inventory updated if a new endpoint is wired
- [ ] `docs/progress.md` ticket moved to Done with commit hash
- [ ] `docs/tests.md` updated if test plan changed
- [ ] No new `console.log` in committed code
- [ ] No new localStorage/sessionStorage usage for auth state
- [ ] Loading + empty + error states handled for new async surfaces

## A11y conventions

- All interactive elements keyboard-reachable (no click-only handlers).
- Images have `alt`. Decorative images get `alt=""`.
- Form fields have associated `<label>`s (or `aria-label` for icon-only buttons).
- Color is never the sole conveyor of meaning.
- Focus visible on every focusable element.

## Loading / empty / error

Every async surface needs all three states. Use:

- Skeleton loaders for the initial fetch (don't show spinners on first paint).
- Empty states with a short instruction or CTA.
- Error states with a retry affordance.
