import { Bell, Bot, ChevronDown, Megaphone, ShieldCheck, Trophy, CircleDot, Inbox } from 'lucide-react'

export function ZikiMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 5.5h13.5L7 13.2h12.5" fill="none" stroke="#2f6bff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="#6b9bff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

export function Header({ route, deskCount }: { route: string; deskCount: number }) {
  const onDesk = route === 'desk'
  const tab = (id: string, label: string, Icon: typeof Megaphone, href: string) => {
    const active = route === id || (id === 'product' && (route === 'issues' || route === 'issue'))
    return (
      <a href={href} className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[15px] ${active ? 'bg-card2 text-accent2' : 'text-soft hover:text-white'}`}>
        <Icon size={16} /> {label}
      </a>
    )
  }
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-3 px-4 md:px-8">
        <a href="#/" className="flex items-center gap-2 text-lg font-bold"><ZikiMark /> ziki</a>
        <span className="mx-1 hidden h-6 w-px bg-line md:block" />
        <button className="hidden items-center gap-1.5 text-[15px] md:flex">Zedu <ChevronDown size={15} className="text-muted" /></button>
        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          <a href="#/desk" className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[15px] ${onDesk ? 'bg-card2 text-accent2' : 'text-soft hover:text-white'}`}>
            <Inbox size={16} /> Desk
            {deskCount > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">{deskCount}</span>}
          </a>
          {tab('product', 'Product', CircleDot, '#/issues')}
          {tab('marketing', 'Marketing', Megaphone, '#/issues')}
          {tab('security', 'Security', ShieldCheck, '#/issues')}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-[15px] md:flex"><Bot size={16} className="text-accent2" /> Agents <ChevronDown size={15} /></button>
          <button className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-[15px]">
            <span className="grid size-8 place-items-center rounded-full bg-[#4ade80] text-xs font-bold text-[#06301b]">99</span>
            <span className="hidden sm:inline">99plusOne</span>
          </button>
          <span className="hidden items-center gap-1.5 rounded-full bg-goldbg px-3 py-2 text-sm font-semibold text-gold sm:flex"><Trophy size={15} /> 17095.12 pts</span>
          <button aria-label={`Notifications, ${deskCount} need you`} className="relative p-2">
            <Bell size={20} />
            {deskCount > 0 && <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold">{deskCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}

/** Thin strip so reviewers can flip between the proposal and the faithful reproduction. */
export function ProposalBar({ route }: { route: string }) {
  const link = (href: string, label: string, active: boolean) => (
    <a href={href} className={`rounded-full px-3 py-1 ${active ? 'bg-accent text-white' : 'text-soft hover:text-white'}`}>{label}</a>
  )
  return (
    <div className="border-b border-line bg-[#0c1733] text-[13px]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 py-2 md:px-8">
        <span className="text-muted">HNG15 proposal by 99plusOne:</span>
        {link('#/roll-call', 'New: Agent Roll Call', route === 'roll-call')}
        {link('#/desk', 'New: Decision Desk', route === 'desk')}
        {link('#/classic', 'Original dashboard', route === 'classic')}
        {link('#/issues', 'Original issue list', route === 'issues')}
        {link('#/issue/106', 'Original issue page', route === 'issue')}
      </div>
    </div>
  )
}
