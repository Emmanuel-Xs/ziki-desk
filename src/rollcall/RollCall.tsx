import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AgentRobot, type Gesture } from './AgentRobot'
import type { RollRow } from './summarize'

// Motion timing, in ms. Keep in step with rollcall.css.
const ROW_START = 160
const ROW_STAGGER = 60
const GESTURE_AFTER_ROW = 200
const LEAVE_MS = 180
const WAVE_MS = 900
const RAISE_MS = 300

type Leaving = 'gotit' | 'disable'

// Returns whose entrance has already played. A card that mounts again for the
// same return (say, after following "Answer") shows still: once per return.
const entrancePlayed = new Set<number>()

const gestureFor = (row: RollRow): Gesture | undefined =>
  row.tier === 'needs' ? 'raise' : row.tier === 'did' ? 'wave' : undefined

/**
 * "While you were away": one inline card at the top of the dashboard. Robots
 * step in one after another, in order of importance; one that needs you raises
 * a hand, one that did work waves once. Every line is real text.
 */
export function RollCall({
  rows,
  returnId,
  awayLabel,
  points,
  reduceMotion,
  answerHref,
  onGotIt,
  onDisable,
}: {
  rows: RollRow[]
  /** Identifies this return, so the entrance plays once per return. */
  returnId: number
  awayLabel: string
  points: number
  /** The demo's "Preview reduced motion" control. The OS setting is read directly. */
  reduceMotion: boolean
  answerHref: string
  onGotIt: () => void
  onDisable: () => void
}) {
  const [leaving, setLeaving] = useState<Leaving | null>(null)
  // Hover, focus or tap on a robot replays its gesture: delight the user asked for.
  const [replays, setReplays] = useState<Record<string, number>>({})
  const [still] = useState(() => entrancePlayed.has(returnId))
  const [mountedAt] = useState(() => performance.now())
  const busyUntil = useRef<Record<string, number>>({})

  useEffect(() => {
    entrancePlayed.add(returnId)
  }, [returnId])

  const act = (what: Leaving) => (what === 'gotit' ? onGotIt() : onDisable())

  // Fold away, then hand over. A timer rather than animationend, so the card
  // can never get stuck if the animation does not run.
  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(() => act(leaving), LEAVE_MS + 20)
    return () => window.clearTimeout(t)
  }, [leaving])

  const leave = (what: Leaving) => {
    if (leaving) return
    const reduced = reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) act(what)
    else setLeaving(what)
  }

  // A gesture that is still playing is left alone: restarting it would snap the
  // arm back to rest. `firstEnds` is when the entrance's own gesture finishes.
  const replay = (id: string, firstEnds: number, ms: number) => {
    const now = performance.now()
    if (now < (busyUntil.current[id] ?? (still ? 0 : mountedAt + firstEnds))) return
    busyUntil.current[id] = now + ms
    setReplays((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }))
  }

  return (
    <section
      className="rc-card rounded-[20px] border border-rc-border bg-rc-surface p-4 sm:p-6"
      data-leaving={leaving ? 'true' : undefined}
      data-still={still ? 'true' : undefined}
      aria-labelledby="roll-call-title"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="roll-call-title" className="m-0 text-base font-bold text-rc-text sm:text-lg">
          While you were away <span className="whitespace-nowrap font-semibold text-rc-muted">· {awayLabel}</span>
        </h2>
        <button
          type="button"
          onClick={() => leave('gotit')}
          className="rc-primary inline-flex min-h-10 shrink-0 items-center rounded-full bg-rc-strong px-5 text-sm font-bold text-white"
        >
          Got it
        </button>
      </div>

      <ul className="m-0 mt-2 list-none p-0">
        {rows.map((row, i) => {
          const rowDelay = ROW_START + i * ROW_STAGGER
          const gesture = gestureFor(row)
          const again = replays[row.id] ?? 0
          const gestureMs = gesture === 'raise' ? RAISE_MS : WAVE_MS
          const firstEnds = rowDelay + GESTURE_AFTER_ROW + gestureMs
          const play = () => replay(row.id, firstEnds, gestureMs)
          const robot = (
            <AgentRobot
              name={row.agent.name}
              status={row.agent.status}
              size={44}
              gesture={gesture}
              still={still && !again}
              delay={again ? 0 : rowDelay + GESTURE_AFTER_ROW}
              replayKey={again}
            />
          )
          return (
            <li
              key={row.id}
              className="rc-row flex gap-3.5 border-t border-rc-divider py-3.5 first:border-t-0"
              style={{ '--rc-row-delay': `${rowDelay}ms` } as CSSProperties}
            >
              {gesture ? (
                <button
                  type="button"
                  aria-label={`${row.names}: ${gesture === 'raise' ? 'raise hand' : 'wave'} again`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && play()}
                  onPointerDown={(e) => e.pointerType !== 'mouse' && play()}
                  onFocus={(e) => e.currentTarget.matches(':focus-visible') && play()}
                  className="h-11 w-11 shrink-0 cursor-default rounded-xl border-0 bg-transparent p-0"
                >
                  {robot}
                </button>
              ) : (
                <span className="h-11 w-11 shrink-0">{robot}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[13px] font-bold text-rc-text">{row.names}</p>
                <p className="m-0 mt-0.5 text-sm leading-snug text-rc-text2">
                  {row.tier === 'needs' ? (
                    <>
                      <strong className="font-bold text-rc-warn-fg">Needs you:</strong>
                      {row.sentence.replace(/^Needs you:/, '')}
                    </>
                  ) : (
                    row.sentence
                  )}
                </p>
                {row.tier === 'needs' ? (
                  <a
                    href={answerHref}
                    className="mt-1 inline-flex min-h-8 items-center text-sm font-bold text-rc-accent hover:underline"
                  >
                    Answer <span aria-hidden="true">&nbsp;→</span>
                  </a>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-rc-divider pt-3.5">
        <p className="m-0 text-[13px] text-rc-muted">You earned {points.toLocaleString('en-US')} pts while away.</p>
        <button
          type="button"
          onClick={() => leave('disable')}
          className="rc-press -mr-2 inline-flex min-h-8 items-center rounded-full px-2 text-[13px] font-semibold text-rc-muted underline-offset-2 hover:text-rc-text hover:underline"
        >
          Don&apos;t show this
        </button>
      </div>
    </section>
  )
}
