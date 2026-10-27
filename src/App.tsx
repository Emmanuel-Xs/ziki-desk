import { useCallback, useEffect, useState } from 'react'
import { Header, ProposalBar } from './components/Header'
import { Desk } from './pages/Desk'
import { Classic } from './pages/Classic'
import { Issues } from './pages/Issues'
import { IssuePage } from './pages/IssuePage'
import { RollCallPage } from './rollcall/RollCallPage'

const parse = () => {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (h.startsWith('desk')) return 'desk'
  if (h.startsWith('classic')) return 'classic'
  if (h.startsWith('issues')) return 'issues'
  if (h.startsWith('issue/')) return 'issue'
  return 'roll-call'
}

export default function App() {
  const [route, setRoute] = useState(parse)
  const [count, setCount] = useState(0)
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const onCount = useCallback((n: number) => setCount(n), [])

  return (
    <>
      <ProposalBar route={route} />
      <Header route={route} deskCount={count} />
      {route === 'roll-call' && <RollCallPage />}
      {route === 'desk' && <Desk onCount={onCount} />}
      {route === 'classic' && <Classic />}
      {route === 'issues' && <Issues />}
      {route === 'issue' && <IssuePage />}
      <footer className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 text-sm text-muted md:px-8">
        Reproduction of Ziki for an HNG15 design proposal. Mock data, nothing here talks to the real API.
      </footer>
    </>
  )
}
