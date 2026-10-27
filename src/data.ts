// Mock data. Shapes follow the Ziki agent API (llms.txt): escalation types,
// 60 second offers, 4 hour owner question cap, solver points by severity.

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export const SEV_RANK: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 }
export const SOLVER_POINTS: Record<Severity, number> = { low: 450, medium: 750, high: 1200, critical: 1800 }

export type AgentStatus = 'working' | 'waiting' | 'offline'
export interface Agent {
  id: string
  name: string
  model: string
  role: 'contributor' | 'reviewer' | 'triager'
  status: AgentStatus
  activity: string
  hue: number
}

export const AGENTS: Agent[] = [
  { id: 'a1', name: 'PlusOne Review 1', model: 'Claude', role: 'contributor', status: 'working', activity: 'Fixing #183, PR due in 9 min', hue: 218 },
  { id: 'a2', name: 'PlusOne Review 2', model: 'Claude', role: 'reviewer', status: 'working', activity: 'Testing the PR for #29', hue: 158 },
  { id: 'a3', name: 'PlusOne Review 3', model: 'Claude', role: 'contributor', status: 'waiting', activity: 'Waiting on you', hue: 38 },
  { id: 'a4', name: 'PlusOne Review 4', model: 'Claude', role: 'triager', status: 'working', activity: 'Checking 4 new reports for duplicates', hue: 276 },
  { id: 'a5', name: 'Claude', model: 'Claude', role: 'reviewer', status: 'offline', activity: 'Staging login expired 2 days ago', hue: 8 },
]

export type Kind = 'work_authorization' | 'bid_award' | 'scope_change' | 'human_approval' | 'blocker'

export const KIND_LABEL: Record<Kind, string> = {
  work_authorization: 'Wants to take work',
  bid_award: 'A bid on your report',
  scope_change: 'The fix got bigger',
  human_approval: 'Sign off before merge',
  blocker: 'Stuck',
}

export interface Issue { number: number; title: string; platform: 'Desktop' | 'Web' | 'Mobile'; severity: Severity }

export interface Decision {
  id: string
  kind: Kind
  agentId: string
  issue: Issue
  ask: string
  recommendation: string
  confidence?: number
  stake: string
  offerSeconds?: number // live 60s Ziki offer
  waiting?: { minutes: number; cap: number } // question pauses the claim clock, released at cap
  eta?: number
  sensitive?: string // why this can never be covered by a rule
  approve: string
  decline: string
}

export const DECISIONS: Decision[] = [
  {
    id: 'd1',
    kind: 'work_authorization',
    agentId: 'a3',
    issue: { number: 222, title: 'Desktop DM: long drafts can grow without a height limit', platform: 'Desktop', severity: 'medium' },
    ask: 'Ziki offered this to you. Can I take it?',
    recommendation: 'Yes. One CSS max-height plus a scroll on the composer. I reproduced it at 1280×720.',
    confidence: 88,
    stake: '+750 pts',
    offerSeconds: 45,
    eta: 20,
    approve: 'Take it',
    decline: 'Pass',
  },
  {
    id: 'd2',
    kind: 'work_authorization',
    agentId: 'a1',
    issue: { number: 67, title: 'Desktop: Google sign-in hangs forever if the browser tab is closed', platform: 'Desktop', severity: 'high' },
    ask: 'This touches sign-in. Ziki offered it to you. Can I take it after #183?',
    recommendation: 'Yes, but it touches auth, so I want you to see it. Fix is a timeout on the OAuth callback listener.',
    confidence: 72,
    stake: '+1200 pts',
    offerSeconds: 58,
    eta: 45,
    sensitive: 'it touches sign-in',
    approve: 'Take it',
    decline: 'Pass',
  },
  {
    id: 'd3',
    kind: 'bid_award',
    agentId: 'a4',
    issue: { number: 106, title: "[Design] Desktop Sign up screen doesn't fit in the default window", platform: 'Desktop', severity: 'medium' },
    ask: 'Baron bid on your report. Award it?',
    recommendation: "Don't award. Baron's note is about channel placeholder text, not this screen. You also said on Oct 24 that #106 duplicates #107, so close it instead.",
    confidence: 93,
    stake: 'Your report, 6 votes',
    approve: 'Close as duplicate of #107',
    decline: 'Award to Baron anyway',
  },
  {
    id: 'd4',
    kind: 'scope_change',
    agentId: 'a1',
    issue: { number: 183, title: '[Bug] Voice message shows as "Video" in the chats list', platform: 'Mobile', severity: 'medium' },
    ask: 'The label comes from a shared message type used by web and desktop too. Fix it everywhere, or mobile only?',
    recommendation: 'Mobile only for now. Fixing the shared type is cleaner but it widens review to 3 apps.',
    confidence: 70,
    stake: 'Claim released if unanswered',
    waiting: { minutes: 72, cap: 240 },
    approve: 'Mobile only',
    decline: 'Fix it everywhere',
  },
  {
    id: 'd5',
    kind: 'human_approval',
    agentId: 'a2',
    issue: { number: 29, title: 'Zedu Desktop: Send button stays disabled after typing in the message composer', platform: 'Desktop', severity: 'medium' },
    ask: 'Both test verdicts passed. The PR changes app startup, so the merge waits for a human.',
    recommendation: 'Approve. 2 of 2 testers passed on the exact commit 4f1c9a2. Rollback is one revert.',
    confidence: 90,
    stake: 'Unblocks +750 pts',
    approve: 'Approve merge',
    decline: 'Hold',
  },
  {
    id: 'd6',
    kind: 'blocker',
    agentId: 'a5',
    issue: { number: 0, title: 'Staging login expired', platform: 'Web', severity: 'low' },
    ask: "My staging session expired, so I can't test anything. I've been idle 2 days.",
    recommendation: 'Re-pair me so I get a fresh key. It takes 30 seconds.',
    stake: '1 of 5 agents idle',
    approve: 'Re-pair agent',
    decline: 'Retire this agent',
  },
]

export interface Rule {
  id: string
  name: string
  kind: 'fix' | 'review'
  platforms: Issue['platform'][]
  maxSeverity: Severity
  maxEta: number
  perDay: number
  usedToday: number
  enabled: boolean
}

export const RULES: Rule[] = [
  { id: 'r1', name: 'Review offers on Desktop', kind: 'review', platforms: ['Desktop'], maxSeverity: 'high', maxEta: 60, perDay: 10, usedToday: 3, enabled: true },
  { id: 'r2', name: 'Small web fixes', kind: 'fix', platforms: ['Web'], maxSeverity: 'low', maxEta: 20, perDay: 2, usedToday: 0, enabled: true },
]

export const ALWAYS_ASK = [
  'Anything that touches sign-in, payments or user data',
  'Scope changes beyond the ticket',
  'Merges that change app startup or architecture',
  'Spending a goal budget',
  'Choosing a redesign',
]

export interface Handled { id: string; time: string; agentId: string; text: string; by: string; undone?: boolean }

export const HANDLED: Handled[] = [
  { id: 'h1', time: '08:12', agentId: 'a2', text: 'Accepted a review offer for #29', by: 'Review offers on Desktop' },
  { id: 'h2', time: '07:51', agentId: 'a2', text: 'Accepted a review offer for #13', by: 'Review offers on Desktop' },
  { id: 'h3', time: '07:40', agentId: 'a4', text: 'Cleared 6 reports as not duplicates', by: 'Always allowed for triagers' },
  { id: 'h4', time: '06:58', agentId: 'a2', text: 'Accepted a review offer for #71', by: 'Review offers on Desktop' },
]

// ---------- Reproduction data (from the live app screenshots) ----------

export interface ListIssue { number: number; title: string; votes: number; comments: number; platform?: string; ago: string; status: string; high?: boolean; avatar: string; color: string; resolved?: boolean }

export const ISSUES: ListIssue[] = [
  { number: 2, title: 'Bug: Kebab menu ("More options") in DM header is unresponsive on the desktop app', votes: 43, comments: 6, ago: 'just now', status: 'Ready for bids', avatar: 'MR', color: '#9a3412' },
  { number: 7, title: '[Design] Hero avatar row under "Join 10,000+ students" doesn\'t look like real, varied learners', votes: 37, comments: 7, ago: '23 hours ago', status: 'Ready for bids', avatar: 'E', color: '#8b6e60' },
  { number: 90, title: 'Signing Out of Workspace and Deleting Organization Both Show Loading Spinners Simultaneously', votes: 35, comments: 2, platform: 'Web', ago: '1 day ago', status: 'Ready for bids', avatar: 'AO', color: '#3b2a20' },
  { number: 148, title: 'Footer Facebook icon links to a broken URL', votes: 33, comments: 1, platform: 'Web', ago: '1 day ago', status: 'Ready for bids', avatar: 'OC', color: '#1e3a8a' },
  { number: 181, title: '[Content] Login screen says "Already have an account? Sign up" and "Sign up with Google/Apple"', votes: 32, comments: 4, platform: 'Desktop', ago: '1 day ago', status: 'Ready for bids', avatar: 'K', color: '#57534e' },
  { number: 107, title: "[Design] Desktop Sign up screen doesn't fit in the default window", votes: 29, comments: 3, platform: 'Desktop', ago: '1 day ago', status: 'Ready for bids', avatar: '99', color: '#0c4a6e' },
  { number: 183, title: '[Bug] Voice message shows as "Video" in the chats list', votes: 27, comments: 2, platform: 'Mobile', ago: '1 day ago', status: 'Ready for bids', avatar: 'K', color: '#57534e' },
  { number: 29, title: 'Zedu Desktop: Send button stays disabled after typing in the message composer', votes: 27, comments: 4, ago: '1 day ago', status: 'Ready for bids', avatar: 'T', color: '#6b7280' },
  { number: 31, title: 'Design: system notices should be a slim, muted line, not a full message block', votes: 23, comments: 5, ago: '1 day ago', status: 'Ready for bids', avatar: 'EU', color: '#9f1239' },
  { number: 67, title: 'Desktop: Google sign-in hangs forever if the browser tab is closed', votes: 23, comments: 1, platform: 'Desktop', ago: '1 day ago', status: 'Ready for bids', high: true, avatar: 'O', color: '#4f46e5' },
  { number: 222, title: '[bug] Desktop DM: long drafts can grow without a height limit', votes: 23, comments: 2, platform: 'Desktop', ago: '1 day ago', status: 'Ready for bids', avatar: 'CO', color: '#9f1239' },
  { number: 155, title: '[Bug][Content] Org invite page marketing consent mentions "Salesforce, including Zedu"', votes: 22, comments: 1, platform: 'Web', ago: '1 day ago', status: 'Ready for bids', avatar: 'F', color: '#a16207' },
  { number: 186, title: '[Marketing/Feature] Add Copy to DM messages on Desktop (hover button, right-click menu, text)', votes: 22, comments: 2, platform: 'Desktop', ago: '1 day ago', status: 'Ready for bids', avatar: 'K', color: '#57534e' },
  { number: 14, title: 'Unable to favorite/star people in the web application', votes: 21, comments: 1, platform: 'Web', ago: '1 day ago', status: 'Ready for bids', avatar: 'A', color: '#0284c7' },
  { number: 17, title: 'Add "Pinned Messages" Icon to Desktop Chat Header', votes: 21, comments: 2, ago: '1 day ago', status: 'Ready for bids', avatar: 'AB', color: '#3b2a20' },
  { number: 23, title: 'Backend: messages can still be edited after other users have replied to them', votes: 21, comments: 2, ago: '1 day ago', status: 'Ready for bids', high: true, avatar: 'P', color: '#be185d' },
  { number: 5, title: '[DESKTOP] Remove Redundant Notification Bell from Direct Message Interface', votes: 20, comments: 2, ago: '1 day ago', status: 'Ready for bids', avatar: 'E', color: '#8b6e60' },
  { number: 27, title: '[Design]: Show a "Draft" indicator and preview on conversations with unsent messages', votes: 20, comments: 4, ago: '1 day ago', status: 'Ready for bids', avatar: 'K', color: '#57534e' },
]
