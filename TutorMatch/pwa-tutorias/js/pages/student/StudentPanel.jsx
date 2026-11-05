import { useState } from 'react'
import { slotLabel } from '../../data/content.js'
import { act } from '../../store/store.js'
import { free, nameOf, userName } from '../../utils/helpers.js'
import { isTutorable, SEMESTERS } from '../../data/curriculum.js'
import ClassSchedule from '../../components/ClassSchedule.jsx'
import Notifications from '../../components/Notifications.jsx'
import Tabs, { Chip } from '../../components/Tabs.jsx'

export default function StudentPanel({ me, db }) {
  const unread = db.notes.filter((n) => n.userId === me.id && !n.read).length
  const [tab, setTab] = useState('agenda')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const subjects = db.subjects.filter((s) => s.semester === me.semester && isTutorable(s)) // materias que cursa
  const mine = db.reqs.filter((r) => r.studentId === me.id)
  const send = () => {
    const c = code || subjects[0]?.code
    if (!c) return setMsg('No hay materias cargadas para tu semestre.')
    if (!me.classes.length) return setMsg('Primero registra tu horario de clases para calcular tu disponibilidad.')
    if (mine.some((r) => r.code === c && ['pendiente', 'asignada'].includes(r.status))) return setMsg('Ya tienes una solicitud activa para esa materia.')
    act.createRequest(me.id, c); setMsg('Solicitud enviada. La coordinación generará la asignación.'); setTab('agenda')
  }
  const tabs = [{ id: 'agenda', label: 'Mi agenda' }, { id: 'pedir', label: 'Pedir tutoría' }, { id: 'horario', label: 'Mi horario de clases' },
    { id: 'perfil', label: 'Mi perfil' }, { id: 'avisos', label: `Avisos${unread ? ` (${unread})` : ''}` }]
  return (
    <>
      <Tabs tabs={tabs} value={tab} onChange={(t) => { setTab(t); setMsg('') }} />
      {msg && <p role="status" className="mb-4 text-azul">{msg}</p>}
      {tab === 'agenda' && (
        <ul className="space-y-3">
          {!mine.length && <li className="panel text-bone/70">Aún no tienes solicitudes. Pide tu primera tutoría.</li>}
          {mine.map((r) => (
            <li key={r.id} className="panel flex flex-wrap items-center justify-between gap-3">
              <div>
                <b className="font-display text-xl">{nameOf(db, r.code)}</b> <Chip s={r.status} />
                <p className="text-bone/70">{r.tutorId ? `${userName(db, r.tutorId)} · ${slotLabel(r.slot)} · ${r.mode} · ${r.place}` : 'Esperando asignación'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {r.status === 'realizada' && (r.rating ? <span>Tu valoración: {r.rating}/5</span> :
                  <select className="input !w-auto" defaultValue="" onChange={(e) => act.rate(r.id, +e.target.value)}>
                    <option value="" disabled>Valorar</option>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                  </select>)}
                {r.status === 'asignada' && <button className="btn btn-ghost !py-2" onClick={() => act.reschedule(r.id)}>Pedir reprogramación</button>}
                {['pendiente', 'asignada'].includes(r.status) && <button className="btn btn-ghost !py-2" onClick={() => act.cancel(r.id)}>Cancelar</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {tab === 'pedir' && (
        <div className="panel space-y-5">
          <label className="block">Materias de tu semestre ({me.semester}.º)
            <select className="input mt-1 max-w-md" value={code || subjects[0]?.code || ''} onChange={(e) => setCode(e.target.value)}>
              {subjects.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </label>
          <p className="text-bone/70">Tu disponibilidad: <b className="text-azul">{free(me).length}</b> franjas libres, calculadas desde tu horario de clases.</p>
          <button className="btn btn-primary" onClick={send}>Enviar solicitud</button>
        </div>
      )}
      {tab === 'horario' && <ClassSchedule me={me} />}
      {tab === 'perfil' && (
        <div className="panel max-w-xl space-y-4">
          <p>{me.name} · {me.email}</p>
          <p className="text-bone/70">Carrera: {me.career}</p>
          <label className="block">Semestre actual
            <select className="input mt-1 max-w-[8rem]" value={me.semester} onChange={(e) => act.saveUser(me.id, { semester: +e.target.value })}>{Array.from({ length: SEMESTERS }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select>
          </label>
          <div><p className="mb-2">Materias que cursas</p><div className="flex flex-wrap gap-2">{subjects.map((s) => <span key={s.code} className="chip">{s.name}</span>)}</div></div>
        </div>
      )}
      {tab === 'avisos' && <Notifications me={me} db={db} />}
    </>
  )
}
