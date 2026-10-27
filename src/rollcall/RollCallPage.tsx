// Demo page for Agent Roll Call: the card on a Ziki-style dashboard, the
// Settings switch, and reviewer controls. Mock data only.
import { useRef, useState } from 'react'
import { POINTS_EARNED } from './data'
import { RollCall } from './RollCall'
import { useRollCall } from './store'
import { buildRollCall, formatAway } from './summarize'

const STATS = [
  { label: 'Points', value: '17,095.12', note: '500 required this week' },
  { label: 'Created by me', value: '2', note: 'in the last 30 days' },
  { label: 'Assigned to me', value: '2', note: 'high priority' },
  { label: 'Resolved issues', value: '0', note: 'of issues assigned to me' },
]

const demoButton =
  'rc-press inline-flex min-h-10 items-center rounded-full border border-rc-border px-4 text-sm font-semibold text-rc-text'

/** Settings → Preferences: the same switch Ziki uses for Keyboard shortcuts. */
function RollCallSetting({ enabled, onChange }: { enabled: boolean; onChange: (next: boolean) => void }) {
  const [message, setMessage] = useState('')
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="m-0 text-base font-bold text-rc-text">Agent roll call</h3>
          <p id="roll-call-help" className="m-0 text-[13px] text-rc-muted">
            When you come back, your agents line up and say in one line what they did. Shown once per return, only when
            there is news.
          </p>
        </div>
        <button
          type="button"
          id="roll-call-switch"
          role="switch"
          aria-checked={enabled}
          aria-label="Show the agent roll call"
          aria-describedby="roll-call-help"
          onClick={() => {
            onChange(!enabled)
            setMessage(enabled ? 'Agent roll call turned off.' : 'Agent roll call turned on.')
          }}
          className={`relative h-7 w-[46px] shrink-0 rounded-full border-0 p-0 ${enabled ? 'bg-rc-strong' : 'bg-rc-chip'}`}
        >
          <span
            className="rc-knob pointer-events-none absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
            style={{ transform: enabled ? 'translateX(18px)' : 'none' }}
          />
        </button>
      </div>
      <p role="status" aria-live="polite" className="m-0 text-sm text-rc-ok-fg empty:hidden">
        {message}
      </p>
    </div>
  )
}

export function RollCallPage() {
  const rc = useRollCall()
  const [reduce, setReduce] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const rows = buildRollCall(rc.agents)

  // The card is gone after Got it / Don't show this; keep keyboard focus on the page.
  const backToPage = () => heading.current?.focus()

  const status = !rc.saved.enabled ? 'Off in Settings' : rc.hasNews ? 'Showing' : 'Dismissed, waiting for news'

  return (
    <div className="rc-theme rc-motion min-h-[calc(100vh-110px)]" data-reduce={reduce}>
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
        <section aria-labelledby="demo-controls-title" className="rounded-[20px] border border-dashed border-rc-border p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h2 id="demo-controls-title" className="m-0 text-xs font-bold uppercase tracking-wider text-rc-accent">
              Demo controls
            </h2>
            <p className="m-0 text-[13px] text-rc-muted">
              Card: <strong className="font-semibold text-rc-text2">{status}</strong>
            </p>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <button type="button" className={demoButton} onClick={rc.simulate}>
                Simulate coming back
              </button>
              <button
                type="button"
                className={`${demoButton} ${reduce ? 'bg-rc-tint' : ''}`}
                aria-pressed={reduce}
                onClick={() => setReduce((r) => !r)}
              >
                Preview reduced motion
              </button>
              <button type="button" className={demoButton} onClick={rc.reset}>
                Reset
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main>
            <h1 ref={heading} tabIndex={-1} className="m-0 text-2xl font-extrabold outline-none md:text-3xl">
              Welcome back, 99plusOne
            </h1>
            <p className="m-0 mt-2 text-rc-text2">Issues, votes and your points for Ziki at a glance.</p>

            {rc.hasNews ? (
              <div className="mt-6">
                <RollCall
                  key={rc.visit}
                  rows={rows}
                  awayLabel={formatAway(rc.awayMs)}
                  points={POINTS_EARNED}
                  reduceMotion={reduce}
                  answerHref="#/desk"
                  onGotIt={() => {
                    rc.gotIt()
                    backToPage()
                  }}
                  onDisable={() => {
                    rc.setEnabled(false)
                    backToPage()
                  }}
                />
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-[20px] border border-rc-border bg-rc-surface p-4">
                  <p className="m-0 text-[13px] font-semibold text-rc-muted">{s.label}</p>
                  <p className="m-0 mt-2 text-2xl font-extrabold text-rc-text">{s.value}</p>
                  <p className="m-0 mt-1 text-xs text-rc-muted">{s.note}</p>
                </div>
              ))}
            </div>
          </main>

          <aside aria-labelledby="settings-title" className="rounded-[20px] border border-rc-border bg-rc-surface p-5">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-rc-accent">Settings</p>
            <h2 id="settings-title" className="m-0 mb-4 mt-1 text-lg font-bold">
              Preferences
            </h2>
            <RollCallSetting enabled={rc.saved.enabled} onChange={rc.setEnabled} />
          </aside>
        </div>
      </div>
    </div>
  )
}
