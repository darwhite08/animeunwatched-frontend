import type { Icon as PhosphorIcon } from "@phosphor-icons/react"

/**
 * Shots nav glyph — matches the mobile app's `icon-shots.png` (a portrait
 * "play-card": rounded vertical card with a play triangle knocked out).
 * Rendered with currentColor + evenodd so it tints to gold when the nav item is
 * active, exactly like the surrounding Phosphor icons. `weight` is accepted for
 * API parity with Phosphor but ignored — the mobile mark is always solid.
 */
export const ShotsGlyph = (({ size = 24, className }: { size?: number; weight?: string; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 2.25h6A3.75 3.75 0 0 1 18.75 6v12A3.75 3.75 0 0 1 15 21.75H9A3.75 3.75 0 0 1 5.25 18V6A3.75 3.75 0 0 1 9 2.25ZM9.8 8.6 9.8 15.4 14.6 12Z"
    />
  </svg>
)) as unknown as PhosphorIcon
