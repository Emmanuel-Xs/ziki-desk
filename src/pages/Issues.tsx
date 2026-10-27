// Faithful reproduction of the current Ziki issue list (the "before").
import { ArrowUpDown, Bug, ChevronDown, ChevronUp, CircleDashed, CheckCircle2, Filter, Gavel, Inbox, MessageSquare, Monitor, Plus, Search, Timer } from 'lucide-react'
import { ISSUES } from '../data'

export function Issues() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <div className="rounded-3xl border border-line bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
          <p className="text-[15px] text-soft">Zedu <span className="mx-2">›</span><b className="text-white">Issues</b></p>
          <div className="ml-auto flex items-center gap-2">
            {[Search, Filter, ArrowUpDown, Plus].map((I, i) => <span key={i} className="grid size-9 place-items-center rounded-lg border border-line"><I size={16} /></span>)}
            <span className="hidden items-center gap-2 rounded-lg border border-line px-3 py-1.5 sm:flex"><Monitor size={15} /> Platform: All <span className="rounded bg-card2 px-1.5 text-xs">958</span><ChevronDown size={14} /></span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <span className="flex items-center gap-2 rounded-xl bg-card2 px-4 py-2 font-semibold"><Inbox size={16} /> Inbox <span className="text-xs text-muted">0</span></span>
          <div className="flex flex-wrap gap-1 rounded-xl bg-card2 p-1 text-[15px]">
            <span className="flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 font-semibold"><CircleDashed size={15} /> Open <span className="rounded bg-white/20 px-1.5 text-xs">958</span></span>
            <span className="flex items-center gap-2 px-3 py-1.5 text-soft"><Timer size={15} /> In progress <span className="text-xs">73</span></span>
            <span className="flex items-center gap-2 px-3 py-1.5 text-soft"><CheckCircle2 size={15} className="text-ok" /> Done <span className="text-xs">343</span></span>
            <span className="flex items-center gap-2 px-3 py-1.5 text-soft"><Inbox size={15} /> All <span className="text-xs">1380</span></span>
          </div>
        </div>
        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full min-w-[760px] text-left">
            <thead><tr className="text-[15px] text-soft"><th className="w-20 py-3">Votes</th><th>Issue</th><th className="w-44">Status</th><th className="w-20">Priority</th><th className="w-12" /></tr></thead>
            <tbody>
              {ISSUES.map((i) => (
                <tr key={i.number} className="border-t border-line">
                  <td className="py-3"><a href={`#/issue/${i.number}`} className={`grid h-12 w-12 place-items-center rounded-lg border text-sm font-semibold ${i.high ? 'border-bad/60' : 'border-accent/60'}`}><ChevronUp size={13} />{i.votes}</a></td>
                  <td className="py-3 pr-4"><a href={`#/issue/${i.number}`} className="font-medium hover:underline">{i.title}</a><p className="mt-1 flex items-center gap-2 text-sm text-muted">#{i.number} <Bug size={13} /> <MessageSquare size={13} />{i.comments} {i.platform && <span>{i.platform}</span>} {i.ago}</p></td>
                  <td className="text-sm text-ok"><Gavel size={14} className="mr-1 inline" />{i.status}</td>
                  <td><span className="flex items-end gap-0.5">{[6, 10, 14].map((h, k) => <span key={k} style={{ height: h }} className={`w-1 rounded-sm ${i.high ? 'bg-bad' : k === 2 ? 'bg-line' : 'bg-soft'}`} />)}</span></td>
                  <td><span className="grid size-8 place-items-center rounded-full text-[11px] font-bold" style={{ background: i.color }}>{i.avatar}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-muted">Showing <b className="text-white">1-18</b> of <b className="text-white">958</b> issues</p>
        </div>
      </div>
    </main>
  )
}
