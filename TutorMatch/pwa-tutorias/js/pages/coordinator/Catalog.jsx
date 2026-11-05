import { useState } from 'react'
import { act } from '../../store/store.js'
import { CAREER, INSTITUTION, LOAD, PLAN, isTutorable } from '../../data/curriculum.js'

export default function Catalog({ db }) {
  const [sem, setSem] = useState(1)
  const [msg, setMsg] = useState('')
  const sems = [...new Set(db.subjects.map((s) => s.semester))].sort((a, b) => a - b)
  const list = db.subjects.filter((s) => s.semester === sem)
  const onFile = async (e) => {
    const f = e.target.files[0]; if (!f) return
    const rows = (await f.text()).split(/\r?\n/).map((l) => l.split(/[;,]/).map((c) => c.trim().replace(/^"|"$/g, ''))).filter((r) => r[0] && r[1] && !isNaN(+r[2]))
    rows.length ? (act.importSubjects(rows), setMsg(`${rows.length} materias importadas.`)) : setMsg('No se encontraron filas válidas. Formato: código, nombre, semestre, área.')
    e.target.value = ''
  }
  return (
    <div className="space-y-6">
      <section className="panel space-y-3">
        <h2 className="text-2xl font-extrabold">Malla curricular</h2>
        <p className="text-bone/70">{CAREER} · {PLAN} · {INSTITUTION}</p>
        <p className="text-bone/70">Para actualizar o reemplazar materias, importa un CSV con columnas: código, nombre, semestre, área. Si el código existe, se actualiza.</p>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="block text-bone/80" />
        {msg && <p role="status" className="text-azul">{msg}</p>}
        <label className="block">Nota mínima para ser tutor
          <input type="number" min="0" max="100" className="input mt-1 !w-28" value={db.settings.minGrade} onChange={(e) => act.setSettings({ minGrade: +e.target.value })} />
        </label>
      </section>
      <section className="panel overflow-x-auto">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">Materias por semestre</h2>
          <label>Semestre <select className="input !w-auto" value={sem} onChange={(e) => setSem(+e.target.value)}>{sems.map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>
        {LOAD[sem - 1] && <p className="mb-3 text-bone/70">{list.length} materias · carga oficial: {LOAD[sem - 1][0]} h semanales, {LOAD[sem - 1][1]} h semestrales</p>}
        <table className="w-full min-w-[560px] text-left">
          <thead className="text-bone/60"><tr><th className="p-2 font-medium">Código</th><th className="p-2 font-medium">Materia</th><th className="p-2 font-medium">Área</th><th className="p-2 font-medium">Tutoría</th></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s.code} className="border-t border-bone/10"><td className="p-2">{s.code}</td><td className="p-2">{s.name}</td><td className="p-2 text-bone/70">{s.area}</td><td className="p-2">{isTutorable(s) ? 'Sí' : 'No'}</td></tr>))}</tbody>
        </table>
      </section>
    </div>
  )
}
