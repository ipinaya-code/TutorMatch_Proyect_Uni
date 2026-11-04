import { useState } from 'react'
import { slotLabel } from '../data/content.js'
import { act } from '../utils/store.js'
import { assign } from '../utils/scheduler.js'
import { Chip, STATUS } from '../components/Tabs.jsx'

export default function CoordPanel({ db }) {
  const [res, setRes] = useState(null)
  const name = (id) => db.users.find((u) => u.id === id)?.name || '—'
  const count = (s) => db.reqs.filter((r) => r.status === s).length
  const rated = db.reqs.filter((r) => r.rating)
  const avg = rated.length ? (rated.reduce((a, r) => a + r.rating, 0) / rated.length).toFixed(1) : '—'
  const total = db.reqs.length || 1
  const run = () => { const r = assign(db.reqs, db.users); act.applyAssign(r.assigned); setRes(r) }
  return (
    <div className="space-y-8">
      <section className="panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Asignación automática</h2>
          <p className="text-bone/70">{count('pendiente')} solicitudes pendientes · {db.users.filter((u) => u.role === 'tutor').length} tutores</p>
        </div>
        <button className="btn btn-primary" onClick={run} disabled={!count('pendiente')}>Generar asignación</button>
        {res && (
          <p role="status" className="w-full text-cian">
            Se asignaron {res.assigned.length} de {res.total} solicitudes en {res.generations} generaciones.
            {res.left.length > 0 && <span className="text-ambar"> {res.left.length} quedan pendientes ({res.noMatch} sin coincidencia de horario o materia).</span>}
          </p>
        )}
      </section>

      <section className="panel">
        <h2 className="mb-4 text-2xl font-extrabold">Resumen · satisfacción {avg}/5</h2>
        <div className="space-y-3">
          {Object.keys(STATUS).map((s) => (
            <div key={s} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3">
              <span className={STATUS[s]}>{s}</span>
              <div className="h-3 overflow-hidden rounded-full bg-bone/10"><div className="h-full rounded-full bg-cian transition-[width] duration-500" style={{ width: `${(count(s) / total) * 100}%` }} /></div>
              <b>{count(s)}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="panel overflow-x-auto">
        <h2 className="mb-4 text-2xl font-extrabold">Solicitudes</h2>
        <table className="w-full min-w-[640px] text-left">
          <thead className="text-bone/60"><tr>{['Estudiante', 'Materia', 'Estado', 'Tutor', 'Franja', ''].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {db.reqs.map((r) => (
              <tr key={r.id} className="border-t border-bone/10">
                <td className="p-2">{name(r.studentId)}</td><td className="p-2">{r.subject}</td><td className="p-2"><Chip s={r.status} /></td>
                <td className="p-2">{r.tutorId ? name(r.tutorId) : '—'}</td><td className="p-2">{r.slot != null ? slotLabel(r.slot) : '—'}</td>
                <td className="p-2">{r.status === 'asignada' && <button className="text-ambar hover:underline" onClick={() => act.setReq(r.id, { status: 'pendiente', tutorId: null, slot: null })}>Liberar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-4 text-bone/60 hover:text-ambar" onClick={() => act.reset()}>Restablecer datos de demostración</button>
      </section>
    </div>
  )
}
