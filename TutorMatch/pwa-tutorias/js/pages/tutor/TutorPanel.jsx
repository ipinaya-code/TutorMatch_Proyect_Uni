import { useState } from 'react'
import { slotLabel } from '../../data/content.js'
import { act } from '../../store/store.js'
import { nameOf, userName } from '../../utils/helpers.js'
import { isTutorable, SEMESTERS } from '../../data/curriculum.js'
import ClassSchedule from '../../components/ClassSchedule.jsx'
import Notifications from '../../components/Notifications.jsx'
import Tabs, { Chip } from '../../components/Tabs.jsx'

export default function TutorPanel({ me, db }) {
  const unread = db.notes.filter((n) => n.userId === me.id && !n.read).length
  const min = db.settings.minGrade
  const [tab, setTab] = useState('agenda')
  const [d, setD] = useState({ semester: me.semester, cupo: me.cupo, grades: me.grades, offer: me.offer })
  const [sem, setSem] = useState(1)
  const [msg, setMsg] = useState('')
  const shownSem = Math.min(sem, Math.max(d.semester - 1, 1))
  const list = db.subjects.filter((s) => s.semester === shownSem && isTutorable(s))
  const mine = db.reqs.filter((r) => r.tutorId === me.id && r.status !== 'cancelada')
  const setGrade = (code, v) => {
    const grades = { ...d.grades }
    v === '' ? delete grades[code] : (grades[code] = +v)
    setD({ ...d, grades, offer: d.offer.filter((c) => c !== code || (v !== '' && +v >= min)) })
  }
  const toggle = (code) => setD({ ...d, offer: d.offer.includes(code) ? d.offer.filter((c) => c !== code) : [...d.offer, code] })
  const tabs = [{ id: 'agenda', label: 'Mi agenda' }, { id: 'materias', label: 'Materias que ofrezco' }, { id: 'horario', label: 'Mi horario de clases' },
    { id: 'avisos', label: `Avisos${unread ? ` (${unread})` : ''}` }]
  return (
    <>
      <Tabs tabs={tabs} value={tab} onChange={(t) => { setTab(t); setMsg('') }} />
      {msg && <p role="status" className="mb-4 text-azul">{msg}</p>}
      {tab === 'agenda' && (
        <ul className="space-y-3">
          {!mine.length && <li className="panel text-bone/70">Aún no tienes sesiones asignadas. Registra tus materias y tu horario para recibirlas.</li>}
          {mine.map((r) => (
            <li key={r.id} className="panel flex flex-wrap items-center justify-between gap-3">
              <div>
                <b className="font-display text-xl">{nameOf(db, r.code)}</b> <Chip s={r.status} />
                <p className="text-bone/70">{userName(db, r.studentId)} · {slotLabel(r.slot)} · {r.place}</p>
              </div>
              {r.status === 'asignada' && (
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-primary !py-2" onClick={() => act.attendance(r.id, true)}>Asistió</button>
                  <button className="btn btn-ghost !py-2" onClick={() => act.attendance(r.id, false)}>Faltó</button>
                  <button className="btn btn-ghost !py-2" onClick={() => act.reschedule(r.id)}>Pedir reprogramación</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {tab === 'materias' && (
        <div className="panel space-y-5">
          <p className="text-bone/70">Solo puedes ofrecer materias aprobadas con nota mínima de <b className="text-azul">{min}</b>.</p>
          <div className="flex flex-wrap gap-4">
            <label className="block">Mi semestre<select className="input mt-1" value={d.semester} onChange={(e) => setD({ ...d, semester: +e.target.value })}>{Array.from({ length: SEMESTERS - 1 }, (_, i) => <option key={i + 2}>{i + 2}</option>)}</select></label>
            <label className="block">Cupo máximo<input type="number" min="1" max="10" className="input mt-1 !w-28" value={d.cupo} onChange={(e) => setD({ ...d, cupo: +e.target.value })} /></label>
            <label className="block">Ver semestre<select className="input mt-1" value={shownSem} onChange={(e) => setSem(+e.target.value)}>{Array.from({ length: Math.max(d.semester - 1, 1) }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left">
              <thead className="text-bone/60"><tr><th className="p-2 font-medium">Materia</th><th className="p-2 font-medium">Mi nota</th><th className="p-2 font-medium">Ofrecer</th></tr></thead>
              <tbody>
                {list.map((s) => {
                  const g = d.grades[s.code], ok = g !== undefined && g >= min
                  return (
                    <tr key={s.code} className="border-t border-bone/10">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2"><input type="number" min="0" max="100" className="input !w-24 !py-1" value={g ?? ''} onChange={(e) => setGrade(s.code, e.target.value)} /></td>
                      <td className="p-2"><input type="checkbox" className="h-5 w-5 accent-azul" disabled={!ok} checked={d.offer.includes(s.code)} onChange={() => toggle(s.code)} aria-label={`Ofrecer ${s.name}`} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary" onClick={() => { act.saveUser(me.id, d); setMsg('Materias y cupo guardados.') }}>Guardar</button>
        </div>
      )}
      {tab === 'horario' && <ClassSchedule me={me} />}
      {tab === 'avisos' && <Notifications me={me} db={db} />}
    </>
  )
}
