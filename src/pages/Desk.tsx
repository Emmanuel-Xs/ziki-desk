// The proposal: a Decision Desk.
// One idea: your agents only ask when they need a yes or no.
// Say "always" once, and they stop asking for that kind of thing.
import { useEffect, useMemo, useState } from 'react'
import { Check, Lock, RotateCcw, Sparkles, Undo2, X } from 'lucide-react'
import { AgentFace, type FaceMood } from '../components/AgentFace'
import {
  AGENTS, ALWAYS_ASK, DECISIONS, HANDLED, KIND_LABEL, RULES, SEV_RANK,
  type Agent, type Decision, type Handled, type Issue, type Rule, type Severity,
} from '../data'

type Live = Decision & { expiresAt?: number; expired?: boolean }

const agentById = (id: string) => AGENTS.find((a) => a.id === id) as Agent
const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
const fresh = (): Live[] => DECISIONS.map((d) => ({ ...d, expiresAt: d.offerSeconds ? Date.now() + d.offerSeconds * 1000 : undefined }))

const covers = (r: Rule, d: Decision) =>
  r.enabled && !d.sensitive && d.kind === 'work_authorization' && r.kind === 'fix' &&
  r.platforms.includes(d.issue.platform) && SEV_RANK[d.issue.severity] <= SEV_RANK[r.maxSeverity] &&
  (d.eta ?? 999) <= r.maxEta && r.usedToday < r.perDay

export const ruleSentence = (r: Rule) =>
  `${r.kind === 'review' ? 'Review and test' : 'Fix'} ${r.platforms.join(' or ')} issues up to ${r.maxSeverity}, under ${r.maxEta} min, at most ${r.perDay} a day`

function useNow() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  return now
}

export function Desk({ onCount }: { onCount: (n: number) => void }) {
  const now = useNow()
  const [items, setItems] = useState<Live[]>(fresh)
  const [rules, setRules] = useState<Rule[]>(RULES)
  const [handled, setHandled] = useState<Handled[]>(HANDLED)
  const [ruleFrom, setRuleFrom] = useState<Live | null>(null)
  const [toast, setToast] = useState('')
  const [repaired, setRepaired] = useState(false)
  const [flashId, setFlashId] = useState('')

  // Offers expire for real, which is the whole problem.
  useEffect(() => {
    setItems((xs) => xs.some((d) => d.expiresAt && !d.expired && d.expiresAt <= now)
      ? xs.map((d) => (d.expiresAt && !d.expired && d.expiresAt <= now ? { ...d, expired: true } : d))
      : xs)
  }, [now])

  const open = items.filter((d) => !d.expired)
  useEffect(() => onCount(open.length), [open.length, onCount])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 4000); return () => clearTimeout(t) }, [toast])

  const log = (d: Decision, text: string, by: string) =>
    setHandled((h) => [{ id: `${d.id}-${Date.now()}`, time: clock(), agentId: d.agentId, text, by }, ...h])

  const answer = (d: Live, yes: boolean) => {
    setItems((xs) => xs.filter((x) => x.id !== d.id))
    if (d.kind === 'blocker' && yes) setRepaired(true)
    log(d, `${yes ? d.approve : d.decline}${d.issue.number ? ` · #${d.issue.number}` : ''}`, 'You')
  }
  const dismiss = (d: Live) => setItems((xs) => xs.filter((x) => x.id !== d.id))

  const saveRule = (r: Rule, source: Live) => {
    let next = [...rules, r]
    const caught: Live[] = []
    for (const d of items) {
      if (d.expired) continue
      const idx = next.findIndex((x) => covers(x, d))
      if (idx === -1) continue
      next = next.map((x, i) => (i === idx ? { ...x, usedToday: x.usedToday + 1 } : x))
      caught.push(d)
    }
    setRules(next)
    setItems((xs) => xs.filter((x) => !caught.includes(x) && x.id !== source.id))
    for (const d of caught) log(d, `Took #${d.issue.number} ${d.issue.title}`, r.name)
    setRuleFrom(null)
    const extra = caught.filter((d) => d.id !== source.id).length
    setToast(`Rule saved. Your agents won't ask about this again${extra ? `, and it already handled ${extra} more` : ''}.`)
  }

  const undo = (h: Handled) => {
    setHandled((xs) => xs.map((x) => (x.id === h.id ? { ...x, undone: true } : x)))
    setToast(`Undone. ${agentById(h.agentId).name} will give it back.`)
  }

  const reset = () => { setItems(fresh()); setRules(RULES); setHandled(HANDLED); setRepaired(false); setToast('Demo reset.') }

  const waitingOn = new Set(open.map((d) => d.agentId))
  useEffect(() => { if (!flashId) return; const t = setTimeout(() => setFlashId(''), 1600); return () => clearTimeout(t) }, [flashId])
  const mood = (a: Agent): FaceMood => {
    if (a.status === 'offline' && !(a.id === 'a5' && repaired)) return 'asleep'
    if (open.length === 0) return 'content'
    return waitingOn.has(a.id) ? 'waiting' : 'awake'
  }
  const activity = (a: Agent) => {
    if (a.id === 'a5' && repaired) return 'Back online, testing #181'
    if (a.status === 'waiting') return waitingOn.has(a.id) ? 'Idle until you answer' : 'Looking for work'
    return a.activity
  }

  const sorted = useMemo(() => [...items].sort((a, b) => {
    const ka = a.expired ? 2 : a.expiresAt ? 0 : 1
    const kb = b.expired ? 2 : b.expiresAt ? 0 : 1
    return ka - kb || (a.expiresAt ?? 0) - (b.expiresAt ?? 0)
  }), [items])

  // Tapping an agent takes you to the question it is waiting on.
  const goTo = (a: Agent) => {
    const d = sorted.find((x) => !x.expired && x.agentId === a.id)
    if (!d) { setToast(`${a.name}: ${activity(a)}`); return }
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`decision-${d.id}`)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
    setFlashId(d.id)
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      {/* 1. The one line */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-widest text-accent2">YOUR DESK</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl" aria-live="polite">
            {open.length === 0 ? 'Nothing needs you right now.' : `${open.length} ${open.length === 1 ? 'thing needs' : 'things need'} you`}
          </h1>
          <p className="mt-2 text-soft">
            {open.length === 0 ? 'Your agents have it. Go do something else.' : 'Your agents are handling everything else. These need a yes or no.'}
          </p>
        </div>
        <button onClick={reset} className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-soft hover:text-white"><RotateCcw size={14} /> Replay demo</button>
      </div>

      {/* How it works, in three plain steps */}
      <ol className="mt-6 grid gap-3 text-[15px] md:grid-cols-3">
        {[
          ['Agents ask only when they need you', 'Work, merges, money and anything risky. Nothing else.'],
          ['Answer once, or say "always"', 'An "always" becomes a rule, so they stop asking about that kind of thing.'],
          ['See what they did without you', 'Everything a rule allowed is listed, with undo.'],
        ].map(([t, s], i) => (
          <li key={t} className="flex gap-3 rounded-2xl border border-line bg-card p-4">
            <span className="grid size-7 flex-none place-items-center rounded-full bg-card2 text-sm font-bold text-accent2">{i + 1}</span>
            <span><b>{t}</b><br /><span className="text-sm text-soft">{s}</span></span>
          </li>
        ))}
      </ol>

      {/* 2. The factory, at a glance */}
      <section aria-label="Your agents" className="mt-6 rounded-3xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Your agents</h2>
          <p className="text-sm text-soft">1 of 2 claims in use · 1 PR waiting on testers · <span className="text-gold">0 of 500 pts this week</span>, 2,250 more if today's work lands</p>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {AGENTS.map((a) => {
            const m = mood(a)
            return (
              <li key={a.id}>
                <button
                  onClick={() => goTo(a)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-[filter] hover:brightness-125 active:brightness-150 ${m === 'waiting' ? 'bg-card2 ring-1 ring-warn/50' : 'bg-ink/40'}`}
                >
                  <AgentFace hue={a.hue} mood={m} label={`${a.name}: ${activity(a)}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{a.name}</p>
                    <p className={`truncate text-xs ${m === 'asleep' ? 'text-muted' : 'text-soft'}`}>{activity(a)}</p>
                    {waitingOn.has(a.id) && <p className="text-xs font-semibold text-warn">Asked you something</p>}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* 3. The queue */}
        <section aria-label="Needs you" className="space-y-4">
          {sorted.length === 0 && (
            <div className="rise rounded-3xl border border-dashed border-line p-10 text-center">
              <div className="flex justify-center gap-2">{AGENTS.map((a) => <AgentFace key={a.id} hue={a.hue} mood={mood(a)} label={a.name} size={34} />)}</div>
              <p className="mt-4 text-lg font-semibold">All clear.</p>
              <p className="text-soft">Your agents will tap you when something needs a human.</p>
            </div>
          )}
          {sorted.map((d) => (
            <Card key={d.id} d={d} now={now} flash={flashId === d.id} onAnswer={answer} onAlways={setRuleFrom} onDismiss={dismiss} />
          ))}
        </section>

        {/* 4. The boundary, in plain sentences */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-line bg-card p-5">
            <h2 className="font-bold">Handled without you today</h2>
            <ul className="mt-3 space-y-3">
              {handled.slice(0, 7).map((h) => {
                const a = agentById(h.agentId)
                return (
                  <li key={h.id} className={`flex items-start gap-3 text-sm ${h.undone ? 'opacity-50' : ''}`}>
                    <span className="mt-0.5 size-2.5 flex-none rounded-full" style={{ background: `hsl(${a.hue} 80% 66%)` }} />
                    <div className="min-w-0 flex-1">
                      <p className={h.undone ? 'line-through' : ''}>{h.text}</p>
                      <p className="text-xs text-muted">{h.time} · {a.name} · {h.by === 'You' ? 'you said yes' : `rule: ${h.by}`}</p>
                    </div>
                    {h.by !== 'You' && !h.undone && <button onClick={() => undo(h)} className="flex items-center gap-1 text-xs text-accent2 hover:underline"><Undo2 size={12} />Undo</button>}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="rounded-3xl border border-line bg-card p-5">
            <h2 className="font-bold">My agents can, without asking</h2>
            <ul className="mt-3 space-y-3">
              {rules.map((r) => (
                <li key={r.id} className="flex items-start gap-3 text-sm">
                  <button
                    role="switch" aria-checked={r.enabled} aria-label={`Rule: ${r.name}`}
                    onClick={() => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)))}
                    className={`mt-0.5 h-5 w-9 flex-none rounded-full p-0.5 transition ${r.enabled ? 'bg-accent' : 'bg-line'}`}
                  ><span className={`block size-4 rounded-full bg-white transition ${r.enabled ? 'translate-x-4' : ''}`} /></button>
                  <div className={r.enabled ? '' : 'text-muted'}>
                    <p>{ruleSentence(r)}</p>
                    <p className="text-xs text-muted">Used {r.usedToday} of {r.perDay} today</p>
                  </div>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 flex items-center gap-2 text-sm font-bold"><Lock size={14} /> Always asks me, no matter what</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-soft">{ALWAYS_ASK.map((x) => <li key={x}>· {x}</li>)}</ul>
          </section>
        </aside>
      </div>

      {ruleFrom && <RuleSheet from={ruleFrom} onClose={() => setRuleFrom(null)} onSave={saveRule} />}
      {toast && <div role="status" className="rise fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-xl">{toast}</div>}
    </main>
  )
}

const SEV_STYLE: Record<Severity, string> = {
  low: 'bg-card2 text-soft',
  medium: 'bg-goldbg text-gold',
  high: 'bg-badbg text-bad',
  critical: 'bg-badbg text-bad',
}

function Countdown({ left, total }: { left: number; total: number }) {
  const r = 15, c = 2 * Math.PI * r
  const urgent = left <= 15
  return (
    <span className="flex items-center gap-2 text-sm" aria-label={`Offer ends in ${left} seconds`}>
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" className="ring-track" />
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" strokeLinecap="round" className="ring-bar"
          stroke={urgent ? 'var(--color-bad)' : 'var(--color-accent2)'} strokeDasharray={c} strokeDashoffset={c * (1 - left / total)} transform="rotate(-90 18 18)" />
      </svg>
      <span className={urgent ? 'font-semibold text-bad' : 'text-soft'}>Offer ends in 0:{String(left).padStart(2, '0')}</span>
    </span>
  )
}

function Card({ d, now, flash, onAnswer, onAlways, onDismiss }: {
  d: Live; now: number; flash: boolean
  onAnswer: (d: Live, yes: boolean) => void
  onAlways: (d: Live) => void
  onDismiss: (d: Live) => void
}) {
  const a = agentById(d.agentId)
  const left = d.expiresAt ? Math.max(0, Math.ceil((d.expiresAt - now) / 1000)) : 0
  const canRule = d.kind === 'work_authorization' && !d.sensitive

  if (d.expired) {
    return (
      <article id={`decision-${d.id}`} className="rise scroll-mt-24 rounded-3xl border border-bad/40 bg-badbg/40 p-5">
        <p className="text-sm font-semibold text-bad">Missed · #{d.issue.number} {d.issue.title}</p>
        <p className="mt-2 text-lg font-semibold">Too late. Ziki gave this to the next person.</p>
        <p className="mt-1 text-soft">Offers last 60 seconds. {a.name} was ready, but it had to wait for you. A rule lets it say yes on your behalf next time.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {canRule && <button onClick={() => onAlways(d)} className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-semibold"><Sparkles size={16} /> Always allow this kind</button>}
          <button onClick={() => onDismiss(d)} className="rounded-full border border-line px-4 py-2 font-semibold text-soft">Dismiss</button>
        </div>
      </article>
    )
  }

  return (
    <article id={`decision-${d.id}`} className={`rise scroll-mt-24 rounded-3xl border bg-card p-5 ${flash ? 'flash border-accent2' : 'border-line'}`}>
      <header className="flex flex-wrap items-center gap-3">
        <AgentFace hue={a.hue} mood="waiting" size={34} label={a.name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm"><b>{a.name}</b> <span className="text-muted">· {KIND_LABEL[d.kind]}</span></p>
          {d.issue.number > 0 && <p className="truncate text-sm text-soft">#{d.issue.number} {d.issue.title}</p>}
        </div>
        {d.expiresAt ? <Countdown left={left} total={60} /> : d.waiting ? (
          <span className="text-sm text-warn">Waiting {Math.floor(d.waiting.minutes / 60)}h {d.waiting.minutes % 60}m · released after 4h</span>
        ) : null}
      </header>

      <p className="mt-4 text-lg font-semibold leading-snug">{d.ask}</p>
      <div className="mt-3 rounded-2xl bg-card2 p-4 text-[15px]">
        <span className="text-xs font-bold tracking-widest text-accent2">MY SUGGESTION</span>
        <p className="mt-1">{d.recommendation}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {d.issue.number > 0 && <span className={`rounded-full px-2.5 py-1 font-semibold capitalize ${SEV_STYLE[d.issue.severity]}`}>{d.issue.severity}</span>}
        {d.issue.number > 0 && <span className="rounded-full bg-card2 px-2.5 py-1 text-soft">{d.issue.platform}</span>}
        {d.eta && <span className="rounded-full bg-card2 px-2.5 py-1 text-soft">~{d.eta} min</span>}
        <span className="rounded-full bg-card2 px-2.5 py-1 text-gold">{d.stake}</span>
        {d.confidence && <span className="rounded-full bg-card2 px-2.5 py-1 text-soft">{d.confidence}% sure</span>}
        {d.sensitive && <span className="flex items-center gap-1 rounded-full bg-card2 px-2.5 py-1 text-soft"><Lock size={11} /> Always asks you: {d.sensitive}</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={() => onAnswer(d, true)} className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold hover:brightness-110"><Check size={17} /> {d.approve}</button>
        <button onClick={() => onAnswer(d, false)} className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-semibold text-soft hover:text-white"><X size={17} /> {d.decline}</button>
        {canRule && <button onClick={() => onAlways(d)} className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-accent2 hover:underline"><Sparkles size={15} /> Always allow this kind</button>}
      </div>
    </article>
  )
}

function RuleSheet({ from, onClose, onSave }: { from: Live; onClose: () => void; onSave: (r: Rule, from: Live) => void }) {
  const [platform, setPlatform] = useState<Issue['platform']>(from.issue.platform)
  const [sev, setSev] = useState<Severity>(from.issue.severity)
  const [eta, setEta] = useState(from.eta && from.eta <= 15 ? 15 : from.eta && from.eta <= 30 ? 30 : 60)
  const [perDay, setPerDay] = useState(2)

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const sel = 'mx-1 rounded-lg border border-accent/50 bg-card2 px-2 py-1 font-semibold text-accent2'
  const rule: Rule = { id: `r${Date.now()}`, name: `${sev[0].toUpperCase()}${sev.slice(1)} ${platform} fixes under ${eta} min`, kind: 'fix', platforms: [platform], maxSeverity: sev, maxEta: eta, perDay, usedToday: 0, enabled: true }

  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-ink/70 p-4 sm:place-items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="rule-title" className="rise w-full max-w-lg rounded-3xl border border-line bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <h2 id="rule-title" className="text-xl font-bold">Always allow this kind?</h2>
        <p className="mt-1 text-sm text-soft">Your agents will take work like this the moment it's offered, without asking. You can turn it off or undo anything it did.</p>
        <p className="mt-5 text-lg leading-loose">
          Let my agents take
          <select aria-label="Platform" className={sel} value={platform} onChange={(e) => setPlatform(e.target.value as Issue['platform'])}>{['Desktop', 'Web', 'Mobile'].map((p) => <option key={p}>{p}</option>)}</select>
          fixes up to
          <select aria-label="Severity" className={sel} value={sev} onChange={(e) => setSev(e.target.value as Severity)}>{['low', 'medium', 'high'].map((p) => <option key={p}>{p}</option>)}</select>
          that take under
          <select aria-label="Time" className={sel} value={eta} onChange={(e) => setEta(+e.target.value)}>{[15, 30, 60].map((p) => <option key={p} value={p}>{p} min</option>)}</select>
          , at most
          <select aria-label="Per day" className={sel} value={perDay} onChange={(e) => setPerDay(+e.target.value)}>{[1, 2, 3, 5].map((p) => <option key={p}>{p}</option>)}</select>
          a day.
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Lock size={13} /> Sign-in, payments, scope changes and merges still ask you.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => onSave(rule, from)} className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold"><Check size={17} /> Save rule{from.expired ? '' : ' and take this one'}</button>
          <button onClick={onClose} className="rounded-full border border-line px-5 py-2.5 font-semibold text-soft">Cancel</button>
        </div>
      </div>
    </div>
  )
}
