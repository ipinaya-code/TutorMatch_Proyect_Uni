import { useState } from 'react'
import { SUBJECTS, slotLabel } from '../data/content.js'
import { act } from '../utils/store.js'
import AvailabilityGrid from '../components/AvailabilityGrid.jsx'
import Tabs, { Chip } from '../components/Tabs.jsx'

export default function StudentPanel({ me, db }) {
  const [tab, setTab] = useState('Pedir tutoría')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [slots, setSlots] = useState(me.slots)
  const [p, setP] = useState({ career: me.career, semester: me.semester, subjects: me.subjects })
  const [msg, setMsg] = useState('')
  const mine = db.reqs.filter((r) => r.studentId === me.id)
  const send = () => {
    if (!slots.length) return setMsg('Marca al menos una franja en la que puedas asistir.')
    act.saveProfile(me.id, { slots }); act.request(me.id, subject)
    setMsg('Solicitud enviada. La coordinación generará tu asignación.'); setTab('Mi agenda')
  }
  const tutorName = (id) => db.users.find((u) => u.id === id)?.name
  return (
    <>
      <Tabs tabs={['Pedir tutoría', 'Mi agenda', 'Mi perfil']} value={tab} onChange={(t) => { setTab(t); setMsg('') }} />
      {msg && <p role="status" className="mb-4 text-cian">{msg}</p>}
      {tab === 'Pedir tutoría' && (
        <div className="panel space-y-5">
          <label className="block">¿En qué materia necesitas apoyo?
            <select className="input mt-1 max-w-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <div><p className="mb-2">Marca las franjas en las que puedes asistir</p><AvailabilityGrid value={slots} onChange={setSlots} /></div>
          <button className="btn btn-primary" onClick={send}>Enviar solicitud</button>
        </div>
      )}
      {tab === 'Mi agenda' && (
        <ul className="space-y-3">
          {!mine.length && <li className="panel text-bone/70">Aún no tienes solicitudes. Pide tu primera tutoría.</li>}
          {mine.map((r) => (
            <li key={r.id} className="panel flex flex-wrap items-center justify-between gap-3">
              <div>
                <b className="font-display text-xl">{r.subject}</b> <Chip s={r.status} />
                <p className="text-bone/70">{r.status === 'asignada' || r.status === 'completada' ? `${tutorName(r.tutorId)} · ${slotLabel(r.slot)}` : 'Esperando asignación'}</p>
              </div>
              <div className="flex items-center gap-2">
                {r.status === 'completada' && (r.rating ? <span>Tu valoración: {r.rating}/5</span> :
                  <select className="input !w-auto" defaultValue="" onChange={(e) => act.setReq(r.id, { rating: +e.target.value })}>
                    <option value="" disabled>Valorar</option>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                  </select>)}
                {(r.status === 'pendiente' || r.status === 'asignada') && <button className="btn btn-ghost !py-2" onClick={() => act.setReq(r.id, { status: 'cancelada' })}>Cancelar</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {tab === 'Mi perfil' && (
        <div className="panel max-w-xl space-y-4">
          <label className="block">Carrera<input className="input mt-1" value={p.career} onChange={(e) => setP({ ...p, career: e.target.value })} /></label>
          <label className="block">Semestre<input type="number" min="1" max="12" className="input mt-1" value={p.semester} onChange={(e) => setP({ ...p, semester: +e.target.value })} /></label>
          <div><p className="mb-2">Materias aprobadas</p>
            <div className="flex flex-wrap gap-2">{SUBJECTS.map((s) => {
              const on = p.subjects.includes(s)
              return <button key={s} aria-pressed={on} className={`chip ${on ? '!border-cian text-cian' : ''}`} onClick={() => setP({ ...p, subjects: on ? p.subjects.filter((x) => x !== s) : [...p.subjects, s] })}>{s}</button>
            })}</div>
          </div>
          <button className="btn btn-primary" onClick={() => { act.saveProfile(me.id, p); setMsg('Perfil guardado.') }}>Guardar perfil</button>
        </div>
      )}
    </>
  )
}
