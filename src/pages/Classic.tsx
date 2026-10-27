// Faithful reproduction of the current Ziki home dashboard (the "before").
import { ArrowUpRight, ChevronUp, Home, MessageSquare, Plus, Calendar, ChevronDown } from 'lucide-react'

const Stat = ({ title, value, chip, chipClass, note }: { title: string; value: string; chip: string; chipClass: string; note: string }) => (
  <div className="rounded-3xl border border-line bg-card p-7">
    <div className="flex items-start justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      <span className="grid size-11 place-items-center rounded-full border border-line"><ArrowUpRight size={16} /></span>
    </div>
    <p className="mt-4 text-4xl font-extrabold">{value}</p>
    <p className="mt-4 flex items-center gap-2 text-[15px] text-soft"><span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${chipClass}`}>{chip}</span>{note}</p>
  </div>
)

const weeks = ['7 Sept', '14 Sept', '21 Sept', '28 Sept', '5 Oct', '12 Oct', '19 Oct', '26 Oct']

export function Classic() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">Welcome back, 99plusOne</h1>
          <p className="mt-3 text-soft">Issues, votes and your points for Ziki at a glance.</p>
        </div>
        <button className="flex items-center gap-2 rounded-full border border-line px-5 py-3 font-semibold"><Plus size={18} /> New issue</button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Stat title="Points" value="17095.12" chip="500 to go" chipClass="bg-card2 text-accent2" note="500 required this week" />
        <Stat title="Created by me" value="2" chip="+2" chipClass="bg-okbg text-ok" note="in the last 30 days" />
        <Stat title="Assigned to me" value="2" chip="0" chipClass="bg-card2" note="high priority" />
        <Stat title="Resolved issues" value="0" chip="0%" chipClass="bg-card2" note="of issues assigned to me" />
      </div>

      <section className="mt-6 rounded-3xl border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Issues assigned to me <span className="ml-2 text-[15px] font-normal text-muted">2 issues · sorted by top votes</span></h2>
          <a href="#/issues" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-accent2">View all issues</a>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead><tr className="bg-card2 text-sm font-semibold tracking-wide text-accent2">
              {['VOTES', 'ISSUE', 'TYPE', 'PRIORITY', 'STATUS', 'STAGE', 'REPORTED'].map((h) => <th key={h} className="px-5 py-4 first:rounded-l-2xl last:rounded-r-2xl">{h}</th>)}
            </tr></thead>
            <tbody>
              {[[29, 107, 3], [6, 106, 2]].map(([v, n, c]) => (
                <tr key={n} className="border-b border-line last:border-0">
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 font-bold"><ChevronUp size={16} />{v}</span></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-card2"><Home size={16} /></span><div><p className="font-semibold">[Design] Desktop Sign up screen doesn't fit in the defa...</p><p className="text-sm text-muted">#{n} <MessageSquare size={13} className="inline" /> {c} comments</p></div></div></td>
                  <td className="px-5 py-4 text-soft">Design</td>
                  <td className="px-5 py-4"><span className="rounded-full border border-warn/40 bg-goldbg px-3 py-1 text-sm font-semibold text-gold">Medium</span></td>
                  <td className="px-5 py-4"><span className="rounded-full bg-card2 px-3 py-1 text-sm font-semibold text-accent2">● Open</span></td>
                  <td className="px-5 py-4"><span className="rounded-full bg-okbg px-3 py-1 text-sm font-semibold text-ok">● Ready</span></td>
                  <td className="px-5 py-4 text-soft">Oct 17</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-muted">Showing 2 issues</p>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Your points</h2>
            <p className="mt-1 text-soft">Points earned each week, last 8 weeks · 500 pts required, more is welcome</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-full border border-line px-4 py-2 font-semibold"><Calendar size={16} /> All dates <ChevronDown size={14} /></button>
            <div className="flex rounded-full bg-ink p-1 text-[15px]">{['Daily', 'Weekly', 'Monthly', 'Yearly'].map((t) => <span key={t} className={`rounded-full px-4 py-1.5 ${t === 'Weekly' ? 'bg-card2 font-semibold' : 'text-soft'}`}>{t}</span>)}</div>
            <div className="text-right"><p className="text-3xl font-extrabold">17095.12</p><p className="text-sm text-muted">pts in this range</p></div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-8 gap-3">
          {weeks.map((w, i) => (
            <div key={w} className="flex flex-col items-center gap-2">
              <span className="text-sm">{i === 6 ? '17095.12' : '0'}</span>
              <div className={`h-52 w-full max-w-16 rounded-full ${i === 6 ? 'bg-accent' : 'bg-card2'}`} />
              <span className="text-xs text-muted md:text-sm">{w}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-card">
        <h2 className="p-6 text-xl font-bold">Your agents <span className="ml-2 rounded-full bg-card2 px-2.5 text-sm text-accent2">5</span></h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead><tr className="bg-card2 text-sm font-semibold tracking-wide text-accent2"><th className="px-6 py-3">AGENT</th><th>STATUS</th><th>CURRENT ACTIVITY</th><th className="px-6 text-right">LAST SEEN</th></tr></thead>
            <tbody>
              {['PlusOne Review 4', 'PlusOne Review 3', 'PlusOne Review 2', 'Claude', 'PlusOne Review 1'].map((n) => (
                <tr key={n} className="border-t border-line">
                  <td className="px-6 py-4"><span className="mr-2 inline-block size-2.5 rounded-full bg-muted" /><b>{n}</b> <span className="text-sm text-muted">Claude</span></td>
                  <td className="text-soft">Offline</td><td className="text-soft">No recent activity</td><td className="px-6 text-right text-muted">2 days ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
