import { useEffect, useState } from 'react'
import { act } from '../utils/store.js'
import StudentPanel from './StudentPanel.jsx'
import TutorPanel from './TutorPanel.jsx'
import CoordPanel from './CoordPanel.jsx'

export default function AppShell({ me, db }) {
  const [on, setOn] = useState(navigator.onLine)
  useEffect(() => {
    const u = () => setOn(true), d = () => setOn(false)
    window.addEventListener('online', u); window.addEventListener('offline', d)
    return () => { window.removeEventListener('online', u); window.removeEventListener('offline', d) }
  }, [])
  const Panel = { estudiante: StudentPanel, tutor: TutorPanel, coordinador: CoordPanel }[me.role]
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-bone/10 bg-ink/90 backdrop-blur">
        <div className="wrap flex min-h-16 flex-wrap items-center justify-between gap-2 py-2">
          <span className="font-display text-xl font-extrabold">Tutor<span className="text-cian">Match</span></span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip"><i className={`dot-live mr-2 inline-block h-2 w-2 rounded-full ${on ? 'bg-cian' : 'bg-ambar'}`} />{on ? 'En línea' : 'Sin conexión'}</span>
            <span className="chip">{me.name} · {me.role}</span>
            <button className="btn btn-ghost !px-4 !py-1.5" onClick={act.logout}>Salir</button>
          </div>
        </div>
      </header>
      <main className="wrap py-8"><Panel me={me} db={db} /></main>
    </>
  )
}
