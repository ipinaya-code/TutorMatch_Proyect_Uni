import { useState } from 'react'
import { act } from '../../store/store.js'
import { slotLabel } from '../../data/content.js'
import { buildProblem } from '../../optimizer/ga.js'
import { downloadCsv, nameOf, userName } from '../../utils/helpers.js'
import { Chip } from '../../components/Tabs.jsx'

function Row({ r, db, P }) {
  const [k, setK] = useState('')
  const opts = P.cands[P.reqs.findIndex((x) => x.id === r.id)] || []
  return (
    <tr className="border-t border-bone/10">
      <td className="p-2">{userName(db, r.studentId)}</td><td className="p-2">{nameOf(db, r.code)}</td><td className="p-2"><Chip s={r.status} /></td>
      <td className="p-2">{r.tutorId ? `${userName(db, r.tutorId)} · ${slotLabel(r.slot)}` : '—'}</td>
      <td className="p-2">
        {r.status === 'asignada' && <button className="text-oro hover:underline" onClick={() => act.release(r.id)}>Liberar</button>}
        {r.status === 'pendiente' && (opts.length ? (
          <div className="flex gap-2">
            <select className="input !w-auto !py-1" value={k} onChange={(e) => setK(e.target.value)} aria-label="Asignar manualmente">
              <option value="">Asignar a…</option>
              {opts.slice(0, 40).map((c, i) => <option key={i} value={i}>{c.t.name} · {slotLabel(c.sl)}</option>)}
            </select>
            {k !== '' && <button className="text-azul hover:underline" onClick={() => act.applyAssign([{ id: r.id, tutorId: opts[k].t.id, slot: opts[k].sl }])}>Asignar</button>}
          </div>
        ) : <span className="text-bone/50">Sin coincidencia</span>)}
      </td>
    </tr>
  )
}

export default function Requests({ db }) {
  const P = buildProblem(db)
  const exportCsv = () => downloadCsv('solicitudes.csv', [['Estudiante', 'Materia', 'Estado', 'Tutor', 'Franja', 'Valoración'],
    ...db.reqs.map((r) => [userName(db, r.studentId), nameOf(db, r.code), r.status, r.tutorId ? userName(db, r.tutorId) : '', r.slot != null ? slotLabel(r.slot) : '', r.rating ?? ''])])
  return (
    <section className="panel overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold">Solicitudes</h2>
        <div className="flex gap-4"><button className="btn btn-ghost !py-2" onClick={exportCsv}>Exportar CSV</button><button className="text-bone/60 hover:text-oro" onClick={() => act.reset()}>Restablecer datos de demostración</button></div>
      </div>
      <table className="w-full min-w-[720px] text-left">
        <thead className="text-bone/60"><tr>{['Estudiante', 'Materia', 'Estado', 'Tutor y franja', 'Acción manual'].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{db.reqs.map((r) => <Row key={r.id} r={r} db={db} P={P} />)}</tbody>
      </table>
    </section>
  )
}
