import { useState } from 'react'
import { SUBJECTS, slotLabel } from '../data/content.js'
import { act } from '../utils/store.js'
import AvailabilityGrid from '../components/AvailabilityGrid.jsx'
import Tabs, { Chip } from '../components/Tabs.jsx'

export default function TutorPanel({ me, db }) {
  const [tab, setTab] = useState('Mi agenda')
  const [d, setD] = useState({ subjects: me.subjects, cupo: me.cupo, slots: me.slots })
  const [msg, setMsg] = useState('')
  const mine = db.reqs.filter((r) => r.tutorId === me.id && r.status !== 'cancelada')
  const stu = (id) => db.users.find((u) => u.id === id)
  return (
    <>
      <Tabs tabs={['Mi agenda', 'Disponibilidad y materias']} value={tab} onChange={(t) => { setTab(t); setMsg('') }} />
      {msg && <p role="status" className="mb-4 text-cian">{msg}</p>}
      {tab === 'Mi agenda' && (
        <ul className="space-y-3">
          {!mine.length && <li className="panel text-bone/70">Aún no tienes sesiones asignadas. Completa tu disponibilidad para recibirlas.</li>}
          {mine.map((r) => (
            <li key={r.id} className="panel flex flex-wrap items-center justify-between gap-3">
              <div>
                <b className="font-display text-xl">{r.subject}</b> <Chip s={r.status} />
                <p className="text-bone/70">{stu(r.studentId)?.name} · {stu(r.studentId)?.career} · {slotLabel(r.slot)}</p>
              </div>
              {r.status === 'asignada' && <button className="btn btn-primary !py-2" onClick={() => act.setReq(r.id, { status: 'completada' })}>Marcar realizada</button>}
            </li>
          ))}
        </ul>
      )}
      {tab === 'Disponibilidad y materias' && (
        <div className="panel space-y-5">
          <div><p className="mb-2">Materias que puedes enseñar</p>
            <div className="flex flex-wrap gap-2">{SUBJECTS.map((s) => {
              const on = d.subjects.includes(s)
              return <button key={s} aria-pressed={on} className={`chip ${on ? '!border-cian text-cian' : ''}`} onClick={() => setD({ ...d, subjects: on ? d.subjects.filter((x) => x !== s) : [...d.subjects, s] })}>{s}</button>
            })}</div>
          </div>
          <label className="block">Cupo máximo de estudiantes<input type="number" min="1" max="10" className="input mt-1 max-w-[8rem]" value={d.cupo} onChange={(e) => setD({ ...d, cupo: +e.target.value })} /></label>
          <div><p className="mb-2">Franjas en las que puedes tutorar</p><AvailabilityGrid value={d.slots} onChange={(slots) => setD({ ...d, slots })} /></div>
          <button className="btn btn-primary" onClick={() => { act.saveProfile(me.id, d); setMsg('Disponibilidad guardada.') }}>Guardar</button>
        </div>
      )}
    </>
  )
}
