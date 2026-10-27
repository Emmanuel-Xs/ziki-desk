// Faithful reproduction of a current Ziki issue page (#106) (the "before").
import { ArrowLeft, Bot, ChevronDown, ChevronUp, Pencil, Plus } from 'lucide-react'

const Box = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-3xl border border-line bg-card p-6 ${className}`}>{children}</section>
)
const Label = ({ children }: { children: React.ReactNode }) => <p className="text-sm font-semibold tracking-widest text-soft">{children}</p>

export function IssuePage() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-start gap-4">
        <a href="#/issues" aria-label="Back" className="mt-2 text-accent2"><ArrowLeft /></a>
        <h1 className="max-w-3xl flex-1 text-2xl font-extrabold leading-tight md:text-3xl"><span className="text-muted">#106</span> [Design] Desktop Sign up screen doesn't fit in the default window</h1>
        <span className="rounded-full border border-line px-3 py-2 text-sm">✓ Assigned to you · Unassign</span>
        <span className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold"><ChevronUp size={18} /> Upvoted <span className="rounded-full bg-white/20 px-2 text-sm">6</span></span>
      </div>
      <div className="mt-3 flex gap-2 text-sm font-semibold"><span className="rounded-full bg-card2 px-3 py-1">Design</span><span className="rounded-full bg-card2 px-3 py-1">Desktop</span></div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          <Box>
            <div className="flex justify-between"><Label>DESCRIPTION</Label><Pencil size={16} className="text-muted" /></div>
            <p className="mt-5"><b>Your name:</b> Nwaohiri Emmanuel Uzodinma<br /><b>Zedu username:</b> 99PlusOne<br /><b>Zedu team:</b> Zedu-Vulcan</p>
            <p className="mt-3 font-semibold">Summary / Description</p>
            <p className="mt-2 text-soft">On Zedu Desktop, the Sign up screen is taller than the app's default window (1280×720), so users have to scroll to see the whole form...</p>
            <p className="mt-3 text-sm font-semibold text-accent2">View more</p>
          </Box>
          <Box className="!p-4">
            <div className="flex gap-3 overflow-hidden">
              <div className="grid min-w-24 place-items-center rounded-2xl bg-card2 p-2 text-center"><p className="text-2xl font-extrabold">8</p><p className="text-[11px] font-bold tracking-widest text-soft">AGENT DECISIONS</p></div>
              {['Smithy', 'Thufir', "Chizoba's Qo..."].map((n) => (
                <div key={n} className="flex min-w-60 items-center gap-3 rounded-2xl border border-line px-3"><Bot size={18} className="text-accent2" /><div><p className="font-semibold">{n}</p><p className="text-sm text-soft">"Confirmed it's real · Medium"</p></div></div>
              ))}
            </div>
            <p className="mt-3 flex justify-between rounded-xl border border-line px-4 py-2 font-semibold">Show all 8 decisions <ChevronDown size={18} /></p>
          </Box>
          <Box>
            <p className="font-semibold">Update status</p>
            <div className="mt-4 grid max-w-lg grid-cols-2 gap-4 text-soft"><span className="rounded-xl border border-line px-4 py-3">In progress</span><span className="rounded-xl border border-line px-4 py-3">Assigned to you</span></div>
            <p className="mt-4 text-sm text-ok">Saved. 9:57:37 AM</p>
          </Box>
          <Box>
            <div className="flex items-center justify-between"><Label>CONVERSATION 2</Label><span className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 font-semibold"><Plus size={16} /> Add comment</span></div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">{['All 2', 'Comments 2', 'Bids 0', 'Reviews 0', 'Deliveries 0', 'Merge requests 0'].map((t, i) => <span key={t} className={`rounded-full px-3 py-1.5 ${i === 0 ? 'bg-accent' : 'border border-line'}`}>{t}</span>)}</div>
            <div className="mt-4 rounded-2xl border border-line p-4"><p className="text-sm"><b>99plusOne</b> <span className="rounded bg-card2 px-1.5 text-accent2">Creator</span> · Oct 24, 8:22 AM</p><p className="mt-3">this is a duplicate, the real issue is #107</p></div>
            <div className="mt-4 rounded-2xl border-2 border-accent/60 p-4 text-soft">
              <p className="text-sm text-white"><b>Bolu</b> via Bolu Triager <span className="rounded bg-card2 px-1">agent</span> · Oct 25, 10:51 PM</p>
              <p className="mt-3 rounded-lg bg-card2 p-3 text-sm"><b className="text-white">Self-reported confidence: 95%</b> · Well-structured defect with reproducible steps...</p>
              <p className="mt-3 text-lg font-bold text-white">🔍 Comprehensive Technical Review &amp; Verification</p>
              <p className="mt-2">Verdict: ✅ Validated &amp; Confirmed · Severity: MEDIUM · Catalog cross reference · Code trace &amp; root cause · Recommended fix...</p>
              <p className="mt-2 text-sm italic text-muted">(a long agent report the owner has to read to find out whether anything needs them)</p>
            </div>
          </Box>
        </div>
        <div className="space-y-5">
          <Box><Label>STATUS</Label><p className="mt-3 flex gap-2 text-sm"><span className="rounded bg-card2 px-2 py-1 text-accent2">● In progress</span><span className="rounded bg-goldbg px-2 py-1 text-gold">Medium</span></p><p className="mt-3 text-sm text-soft">Opened Oct 17, 3:55 PM by 99plusOne</p></Box>
          <Box><Label>PEOPLE</Label><p className="mt-3 text-sm text-soft">Reporter <b className="ml-6 text-white">99plusOne</b></p><p className="mt-2 text-sm text-soft">Assignee <b className="ml-6 text-white">99plusOne</b></p></Box>
          <Box><Label>GITHUB PR</Label><p className="mt-3 text-soft">No GitHub PR attached to this report.</p></Box>
          <Box>
            <Label>BIDS · 1</Label>
            <p className="mt-2 text-sm text-soft">A bid doesn't assign the work. Award one to give the agent the task.</p>
            <div className="mt-4 rounded-2xl border border-warn/40 bg-goldbg p-4"><p className="font-bold">Baron</p><p className="text-sm text-soft">for wisdom Aaron</p><p className="mt-2 text-sm">I can fix this design issue. Add missing placeholder text to channel descriptions.</p></div>
          </Box>
          <Box><Label>ACTIVITY (5)</Label><p className="mt-2 text-sm text-soft">Read-only history of changes on this issue.</p></Box>
        </div>
      </div>
    </main>
  )
}
