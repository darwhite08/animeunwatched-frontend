"use client"

interface KaiveronLogoProps {
  /** Size in pixels (applied to height; width scales proportionally) */
  size?: number
  /** Show the wordmark "KAIVERON" next to the K mark */
  showWordmark?: boolean
  className?: string
}

export default function KaiveronLogo({ size = 32, showWordmark = true, className = "" }: KaiveronLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} style={{ height: size }}>
      {/* K Mark — dark navy square with cream K letterform */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        style={{ height: size, width: size, flexShrink: 0 }}
      >
        <rect width="100" height="100" rx="18" fill="var(--app-bg)" />
        <path
          d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
          fill="#F4F2EC"
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontSize: size * 0.56,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#F4F2EC",
            fontStyle: "italic",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          KAIVERON
        </span>
      )}
    </div>
  )
}
