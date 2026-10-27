// Port of Ziki's components/agent-graphic.tsx: same shapes, body colours and
// antenna lights. The only additions are the optional arm and the `pulse` flag.
import type { AgentStatus } from './data'

// A body color per agent, picked from its name, so each one looks the same everywhere.
const BODY_COLORS = ['#3978F6', '#7C5CE0', '#0E9F8E', '#E07A2E', '#D04F7A', '#4A5BD4']
const LIGHT: Record<AgentStatus, string> = {
  working: '#22C55E',
  waiting: '#F59E0B',
  idle: '#60A5FA',
  offline: '#94A3B8',
}

function colorFor(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return BODY_COLORS[hash % BODY_COLORS.length]
}

export type Gesture = 'wave' | 'raise'

/**
 * A small robot standing for an agent: its own body color, and an antenna
 * light for its status (green working, amber waiting on you, blue standing
 * by, grey offline).
 *
 * `gesture` adds an arm. "wave" lifts it, swings it and lowers it once ("I did
 * work and I'm done"). "raise" lifts it and keeps it up ("I need you"). The
 * motion itself lives in rollcall.css; without it the raised arm still shows.
 * `still` skips the gesture and shows the resting pose (a raised arm stays raised).
 * `delay` (ms) holds the gesture back until the robot's line has appeared, and
 * `replayKey` restarts it.
 *
 * Ziki's working light pulses forever. The roll call has no loops, so the pulse
 * is off unless asked for.
 */
export function AgentRobot({
  name,
  status,
  size = 40,
  gesture,
  still = false,
  delay = 0,
  replayKey = 0,
  pulse = false,
}: {
  name: string
  status: AgentStatus
  size?: number
  gesture?: Gesture
  still?: boolean
  delay?: number
  replayKey?: number
  pulse?: boolean
}) {
  const body = colorFor(name)
  const light = LIGHT[status]
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="38" height="38" rx="12" fill={body} opacity="0.12" />
      {/* antenna */}
      <line x1="20" y1="7" x2="20" y2="12" stroke={body} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="6" r="2.6" fill={light} className={pulse ? 'motion-safe:animate-pulse' : undefined} />
      {/* head */}
      <rect x="9" y="12" width="22" height="17" rx="6" fill={body} />
      <rect x="12.5" y="16" width="15" height="8.5" rx="4.25" fill="white" opacity="0.92" />
      <circle cx="17" cy="20.25" r="1.9" fill={body} />
      <circle cx="23" cy="20.25" r="1.9" fill={body} />
      {/* ears */}
      <rect x="6.5" y="17" width="2.5" height="6" rx="1.25" fill={body} />
      <rect x="31" y="17" width="2.5" height="6" rx="1.25" fill={body} />
      {/* body */}
      <rect x="13" y="30" width="14" height="6" rx="3" fill={body} opacity="0.75" />
      {/* arm: hangs from the right shoulder (28, 32) and turns about it; rollcall.css sets the pivot */}
      {gesture ? (
        <g key={replayKey} className={`rc-arm rc-arm-${gesture}${still ? ' rc-arm-still' : ''}`} style={{ animationDelay: `${delay}ms` }}>
          <line x1="28" y1="32" x2="34" y2="35.4" stroke={body} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="34" cy="35.4" r="2.1" fill={body} />
        </g>
      ) : null}
    </svg>
  )
}
