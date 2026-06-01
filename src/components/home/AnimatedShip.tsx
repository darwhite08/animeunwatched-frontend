"use client"
import { motion, useTransform, MotionValue, useMotionValue } from "framer-motion"

interface AnimatedShipProps {
  mouseX?: MotionValue<number>
  mouseY?: MotionValue<number>
  scrollY?: MotionValue<number>
}

export default function AnimatedShip({ mouseX, mouseY, scrollY }: AnimatedShipProps) {
  const fallbackX = useMotionValue(0)
  const fallbackY = useMotionValue(0)
  const fallbackS = useMotionValue(0)

  const shipX = useTransform(mouseX ?? fallbackX, v => v * 18)
  const shipY = useTransform(mouseY ?? fallbackY, v => v * 10)
  const scrollShift = useTransform(scrollY ?? fallbackS, [0, 1], [0, 120])

  return (
    <motion.div className="relative select-none" style={{ x: shipX, y: shipY }}>
      <motion.div
        style={{ y: scrollShift }}
        animate={{ y: [0, -14, 0], rotate: [-1.2, 1.2, -1.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="absolute inset-0 -bottom-8 blur-[60px] rounded-full bg-indigo-700/25 pointer-events-none" />
        <div className="absolute inset-x-12 bottom-0 h-16 blur-[40px] bg-blue-500/15 pointer-events-none" />

        <svg viewBox="0 0 480 540" className="w-[300px] md:w-[380px] lg:w-[460px]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sg-hull" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d1f0e" />
              <stop offset="60%" stopColor="var(--app-bg)" />
              <stop offset="100%" stopColor="var(--app-bg)" />
            </linearGradient>
            <linearGradient id="sg-sail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8dfc8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#b8a888" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="sg-sailshad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6b5a3a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6b5a3a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sg-water" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0a1929" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="sg-lantern" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffa940" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#ff6b1a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff6b1a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sg-lantern2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <filter id="sg-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="sg-sglow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          <motion.g animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "240px 28px" }}>
            <rect x="239" y="28" width="1.5" height="52" fill="#4a3520" />
            <path d="M241 30 L282 40 L241 52 Z" fill="var(--app-bg)" opacity="0.9" />
            <circle cx="259" cy="41" r="7" fill="none" stroke="#c8a020" strokeWidth="1.5" />
            <circle cx="259" cy="41" r="3" fill="#c8a020" opacity="0.8" />
          </motion.g>

          <rect x="190" y="45" width="4" height="260" fill="#3d2a14" rx="2" />
          <rect x="237" y="28" width="5" height="300" fill="#4a3520" rx="2" />
          <rect x="228" y="88" width="24" height="14" rx="4" fill="#3d2a14" />
          <rect x="225" y="85" width="30" height="4" rx="2" fill="#4a3520" />

          <path d="M193 55 Q228 90 215 290 L193 290 Z" fill="url(#sg-sail)" opacity="0.75" />
          <path d="M193 55 Q228 90 215 290 L193 290 Z" fill="url(#sg-sailshad)" opacity="0.5" />

          <path d="M242 35 Q310 130 295 310 L242 310 Z" fill="url(#sg-sail)" />
          <circle cx="268" cy="170" r="22" fill="none" stroke="#8a7550" strokeWidth="1.5" opacity="0.6" />
          <path d="M252 170 Q260 160 268 170 Q276 180 284 170" fill="none" stroke="#6b5a3a" strokeWidth="2" opacity="0.7" />
          <path d="M252 170 Q260 180 268 170 Q276 160 284 170" fill="none" stroke="#6b5a3a" strokeWidth="2" opacity="0.7" />
          <circle cx="268" cy="170" r="4" fill="#8a7550" opacity="0.8" />
          <path d="M242 35 Q310 130 295 310 L242 310 Z" fill="url(#sg-sailshad)" opacity="0.3" />

          <path d="M195 290 Q170 310 150 340 L195 330 Z" fill="url(#sg-sail)" opacity="0.65" />

          <line x1="242" y1="35" x2="190" y2="55" stroke="#6b5a3a" strokeWidth="1" opacity="0.5" />
          <line x1="242" y1="35" x2="380" y2="340" stroke="#6b5a3a" strokeWidth="0.8" opacity="0.35" />
          <line x1="180" y1="320" x2="90" y2="380" stroke="#4a3520" strokeWidth="4" strokeLinecap="round" />
          <line x1="90" y1="380" x2="242" y2="35" stroke="#6b5a3a" strokeWidth="0.8" opacity="0.35" />

          <path d="M120 330 Q100 360 100 390 Q100 420 130 440 Q200 460 240 462 Q280 464 350 448 Q380 434 380 408 Q380 380 360 355 Q320 330 240 326 Z" fill="url(#sg-hull)" />
          <path d="M120 345 Q240 335 360 345" fill="none" stroke="#3d2a14" strokeWidth="0.8" opacity="0.5" />
          <path d="M112 365 Q240 352 368 362" fill="none" stroke="#3d2a14" strokeWidth="0.8" opacity="0.4" />
          <path d="M108 385 Q240 370 372 382" fill="none" stroke="#3d2a14" strokeWidth="0.7" opacity="0.35" />
          <path d="M118 330 Q240 320 362 330" fill="none" stroke="#c8a020" strokeWidth="1.5" opacity="0.5" />

          <path d="M100 390 Q88 395 82 408 Q78 420 90 432 Q105 440 125 440" fill="url(#sg-hull)" />
          <circle cx="80" cy="415" r="8" fill="#c8a020" opacity="0.7" />
          <circle cx="80" cy="415" r="5" fill="#ffd700" opacity="0.5" />

          <rect x="310" y="290" width="80" height="50" rx="6" fill="#2d1f0e" />
          <rect x="315" y="282" width="70" height="15" rx="4" fill="#3d2a14" />
          <rect x="322" y="298" width="14" height="10" rx="2" fill="#1a2a3a" opacity="0.8" />
          <rect x="342" y="298" width="14" height="10" rx="2" fill="#1a2a3a" opacity="0.8" />
          <rect x="362" y="298" width="14" height="10" rx="2" fill="#1a2a3a" opacity="0.8" />

          <rect x="140" y="318" width="220" height="18" rx="4" fill="#3d2a14" />
          {[180, 220, 260, 300].map(x => (
            <line key={x} x1={x} y1="318" x2={x} y2="336" stroke="#2d1f0e" strokeWidth="1" opacity="0.4" />
          ))}

          {[148, 178, 208, 300, 330].map((cx, i) => (
            <circle key={i} cx={cx} cy={390 - i * 0.5} r="7" fill="var(--app-bg)" stroke="#4a3520" strokeWidth="1.5" />
          ))}

          <path d="M98 420 Q240 430 382 420 Q400 445 380 460 Q280 475 240 476 Q200 477 100 462 Q82 447 98 420 Z" fill="url(#sg-water)" />

          <motion.g animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
            <ellipse cx="152" cy="300" rx="24" ry="24" fill="url(#sg-lantern)" opacity="0.6" filter="url(#sg-sglow)" />
            <rect x="148" y="292" width="8" height="12" rx="2" fill="#ffa940" opacity="0.9" filter="url(#sg-glow)" />
            <circle cx="152" cy="298" r="3" fill="#fff5e0" filter="url(#sg-glow)" />
          </motion.g>

          <motion.g animate={{ opacity: [0.6, 0.95, 0.6] }} transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
            <ellipse cx="365" cy="275" rx="22" ry="22" fill="url(#sg-lantern)" opacity="0.55" filter="url(#sg-sglow)" />
            <rect x="361" y="268" width="8" height="11" rx="2" fill="#ffa940" opacity="0.9" filter="url(#sg-glow)" />
            <circle cx="365" cy="274" r="3" fill="#fff5e0" filter="url(#sg-glow)" />
          </motion.g>

          <motion.g animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
            <ellipse cx="240" cy="80" rx="18" ry="18" fill="url(#sg-lantern2)" opacity="0.5" filter="url(#sg-sglow)" />
            <circle cx="240" cy="80" r="4" fill="#93c5fd" filter="url(#sg-glow)" />
          </motion.g>

          <motion.g animate={{ opacity: [0.65, 1, 0.65] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
            <ellipse cx="192" cy="50" rx="14" ry="14" fill="url(#sg-lantern)" opacity="0.5" filter="url(#sg-sglow)" />
            <circle cx="192" cy="50" r="3" fill="#ffd47a" filter="url(#sg-glow)" />
          </motion.g>

          <motion.g animate={{ opacity: [0, 0.6, 0], y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
            <circle cx="108" cy="442" r="3" fill="#a8d4f0" opacity="0.4" />
            <circle cx="118" cy="448" r="2" fill="#c8e8f8" opacity="0.35" />
            <circle cx="96"  cy="445" r="2" fill="#a8d4f0" opacity="0.3" />
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  )
}
