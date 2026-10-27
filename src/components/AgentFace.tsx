import { useEffect, useRef, useState } from 'react'

export type FaceMood = 'awake' | 'waiting' | 'asleep' | 'content'

/**
 * A tiny agent face. Eyes follow the pointer while the agent is awake,
 * it blinks now and then, it hops when it is waiting on you, and it
 * dozes when it is offline or when nothing needs you.
 * Respects prefers-reduced-motion: no tracking, no blinking.
 */
export function AgentFace({ hue, mood, size = 40, label }: { hue: number; mood: FaceMood; size?: number; label: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [delay] = useState(() => `${(Math.random() * 4).toFixed(2)}s`)
  const tracking = mood === 'awake' || mood === 'waiting'

  useEffect(() => {
    if (!tracking) { setLook({ x: 0, y: 0 }); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let last: { x: number; y: number } | null = null
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el || !last) return
      const r = el.getBoundingClientRect()
      const dx = last.x - (r.left + r.width / 2)
      const dy = last.y - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      const m = Math.min(1, d / 140) * 2.2
      setLook({ x: (dx / d) * m, y: (dy / d) * m })
    }
    const onMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY }
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      cancelAnimationFrame(raf)
    }
  }, [tracking])

  const stroke = `hsl(${hue} 80% 66%)`
  const fill = `hsl(${hue} 70% 55% / .16)`

  return (
    <svg
      ref={ref}
      viewBox="0 0 40 44"
      width={size}
      height={size * 1.1}
      role="img"
      aria-label={label}
      className={mood === 'waiting' ? 'face-hop' : undefined}
      style={{ overflow: 'visible', flex: 'none' }}
    >
      {mood === 'waiting' && <circle className="face-ping" cx="20" cy="24" r="17" fill="none" stroke={stroke} strokeWidth="1.5" />}
      {/* antenna */}
      <line x1="20" y1="7" x2="20" y2="3" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="2.6" r="1.9" fill={mood === 'asleep' ? 'var(--color-line)' : stroke} />
      {/* head */}
      <rect x="4" y="7" width="32" height="32" rx="12" fill={fill} stroke={stroke} strokeWidth="1.5" />

      {tracking && (
        <g className="face-eyes" style={{ animationDelay: delay }}>
          <ellipse cx="14" cy="22" rx="3.6" ry="4.2" fill="#eef3ff" />
          <ellipse cx="26" cy="22" rx="3.6" ry="4.2" fill="#eef3ff" />
          <g className="face-pupil" style={{ transform: `translate(${look.x}px, ${look.y}px)` }}>
            <circle cx="14" cy="22" r="1.9" fill="#0b1226" />
            <circle cx="26" cy="22" r="1.9" fill="#0b1226" />
          </g>
        </g>
      )}

      {mood === 'asleep' && (
        <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M10.5 22.5 q3.5 2.6 7 0" />
          <path d="M22.5 22.5 q3.5 2.6 7 0" />
        </g>
      )}

      {mood === 'content' && (
        <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M10.5 23 q3.5 -3.4 7 0" />
          <path d="M22.5 23 q3.5 -3.4 7 0" />
        </g>
      )}

      {/* mouth */}
      {mood === 'content' ? (
        <path d="M16 30 q4 3 8 0" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      ) : mood === 'waiting' ? (
        <circle cx="20" cy="31" r="1.6" fill={stroke} />
      ) : (
        <line x1="17" y1="31" x2="23" y2="31" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      )}

      {(mood === 'asleep' || mood === 'content') && (
        <g fill={stroke} fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif">
          <text className="face-z" x="33" y="9">z</text>
          <text className="face-z b" x="36" y="5">z</text>
        </g>
      )}
    </svg>
  )
}
