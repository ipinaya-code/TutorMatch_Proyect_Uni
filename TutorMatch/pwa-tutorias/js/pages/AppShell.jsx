import { useEffect, useState } from 'react'
import { act } from '../store/store.js'
import { Brand } from '../components/Brand.jsx'
import StudentPanel from './student/StudentPanel.jsx'
import TutorPanel from './tutor/TutorPanel.jsx'
import CoordinatorPanel from './coordinator/CoordinatorPanel.jsx'

export default function AppShell({ me, db }) {
  const [on, setOn] = useState(navigator.onLine)
  useEffect(() => {
    const u = () => setOn(true), d = () => setOn(false)
    window.addEventListener('online', u); window.addEventListener('offline', d)
    return () => { window.removeEventListener('online', u); window.removeEventListener('offline', d) }
  }, [])
  const Panel = { estudiante: StudentPanel, tutor: TutorPanel, coordinador: CoordinatorPanel }[me.role]
  return (
    <>
      <header className="sticky top-0 z-50 bg-white text-ink shadow-lg shadow-black/25">
        <div className="wrap flex min-h-[4.5rem] flex-wrap items-center justify-between gap-2 py-2">
          <Brand />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {db.pending > 0 && <span className="rounded-full border border-emi/25 px-3 py-1 font-medium text-emi">{db.pending} cambios por sincronizar</span>}
            <span className="rounded-full border border-emi/25 px-3 py-1 text-emi"><i className={`dot-live mr-2 inline-block h-2 w-2 rounded-full ${on ? 'bg-emi' : 'bg-oro'}`} />{on ? 'En línea' : 'Sin conexión'}</span>
            <span className="rounded-full border border-emi/25 px-3 py-1 text-emi">{me.name} · {me.role}</span>
            <button className="rounded-full border border-emi/30 px-4 py-1.5 font-bold text-emi hover:bg-emi hover:text-white" onClick={act.logout}>Salir</button>
          </div>
        </div>
      </header>
      <main className="wrap py-8"><Panel me={me} db={db} /></main>
    </>
  )
}
