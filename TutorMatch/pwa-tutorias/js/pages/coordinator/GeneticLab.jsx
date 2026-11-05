import { useEffect, useRef, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { act } from '../../store/store.js'
import { slotLabel } from '../../data/content.js'
import { buildProblem, DEFAULTS, decode, evolve, sanitize } from '../../optimizer/ga.js'
import { compareMethods } from '../../optimizer/baselines.js'
import { fmtDate, nameOf, userName } from '../../utils/helpers.js'

const FIELDS = [['pop', 'Población', 10, 300, 1], ['gens', 'Generaciones', 10, 500, 1], ['cx', 'Prob. cruce', 0, 1, 0.05], ['mut', 'Prob. mutación', 0, 1, 0.01],
  ['wGrade', 'Peso nota del tutor', 0, 10, 1], ['wBalance', 'Peso equilibrio de carga', 0, 10, 1], ['wCareer', 'Peso misma carrera', 0, 10, 1], ['wSenior', 'Peso semestre superior', 0, 10, 1]]
const axis = { stroke: '#F3F6FB', tick: { fill: '#F3F6FB', fontSize: 12 }, strokeOpacity: 0.3 }
const tip = { contentStyle: { background: '#062950', border: '1px solid rgba(243,246,251,.2)', borderRadius: 8 } }

export default function GeneticLab({ db }) {
  const [p, setP] = useState(DEFAULTS)
  const [hist, setHist] = useState([])
  const [res, setRes] = useState(null)
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState('')
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  const pending = db.reqs.filter((r) => r.status === 'pendiente').length

  const run = () => {
    const P = buildProblem(db)
    if (!P.idx.length) return setMsg('No hay solicitudes pendientes con candidatos válidos (materia ofrecida y horarios en común).')
    setMsg(''); setRes(null); setHist([]); setRunning(true)
    const it = evolve(P, p), h = [], t0 = performance.now()
    let last
    const step = () => {
      const n = it.next()
      if (n.done) {
        const ms = Math.round(performance.now() - t0)
        setHist([...h])
        setRes({ P, plan: decode(P, last.top.g), last, ms, cmp: compareMethods(P, p, last, ms) })
        setRunning(false)
        act.saveRun({ id: 'g' + Date.now(), date: new Date().toISOString(), p: { pop: p.pop, cx: p.cx, mut: p.mut }, gens: last.gen, fit: +last.best.toFixed(1), cielo: last.cielo, ms, n: P.idx.length })
        return
      }
      last = n.value
      h.push({ gen: last.gen, mejor: +last.best.toFixed(2), promedio: +last.avg.toFixed(2), conflictos: last.cielo })
      if (last.gen % 3 === 0) setHist([...h])
      timer.current = setTimeout(step, 20)
    }
    step()
  }
  const apply = () => {
    const ok = sanitize(res.P, res.plan)
    act.applyAssign(ok)
    setMsg(`Se aplicaron ${ok.length} de ${res.plan.length} asignaciones y se avisó a estudiantes y tutores.`)
    setRes(null)
  }
  const reqOf = (id) => db.reqs.find((r) => r.id === id)

  return (
    <div className="space-y-6">
      <section className="panel space-y-4">
        <div><h2 className="text-2xl font-extrabold">Laboratorio genético</h2>
          <p className="text-bone/70">{pending} solicitudes pendientes. Ajusta los parámetros y ejecuta la optimización; verás cómo evoluciona la población.</p></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {FIELDS.map(([k, label, min, max, step]) => (
            <label key={k} className="block text-sm">{label}
              <input type="number" className="input mt-1" min={min} max={max} step={step} value={p[k]} disabled={running} onChange={(e) => setP({ ...p, [k]: +e.target.value })} />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" onClick={run} disabled={running || !pending}>{running ? 'Evolucionando…' : 'Ejecutar optimización'}</button>
          <button className="text-bone/60 hover:text-azul" onClick={() => setP(DEFAULTS)} disabled={running}>Restablecer parámetros</button>
        </div>
        {msg && <p role="status" className="text-azul">{msg}</p>}
      </section>

      {hist.length > 0 && (
        <section className="panel">
          <div className="mb-3 flex flex-wrap justify-between gap-2">
            <h3 className="text-xl font-extrabold">Evolución por generación</h3>
            <span className="text-bone/70">Generación {hist[hist.length - 1].gen} · conflictos del mejor: <b className={hist[hist.length - 1].conflictos ? 'text-oro' : 'text-azul'}>{hist[hist.length - 1].conflictos}</b></span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hist}><CartesianGrid strokeOpacity={0.1} /><XAxis dataKey="gen" {...axis} /><YAxis {...axis} /><Tooltip {...tip} /><Legend />
              <Line type="monotone" dataKey="mejor" name="Mejor fitness" stroke="#579DFF" dot={false} strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="promedio" name="Fitness promedio" stroke="#F8D800" dot={false} strokeWidth={2} isAnimationActive={false} /></LineChart>
          </ResponsiveContainer>
          <h4 className="mb-1 mt-4 text-bone/70">Conflictos del mejor individuo (baja hasta 0)</h4>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={hist}><XAxis dataKey="gen" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...tip} />
              <Line type="stepAfter" dataKey="conflictos" stroke="#A9C7FF" dot={false} strokeWidth={2} isAnimationActive={false} /></LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {res && (
        <>
          <section className="panel overflow-x-auto">
            <h3 className="mb-1 text-xl font-extrabold">Mejor individuo (cromosoma)</h3>
            <p className="mb-3 text-bone/70">{res.plan.length} genes · {res.last.cielo} conflictos · calidad {res.last.soft.toFixed(1)}/100 · {res.ms} ms{res.P.noMatch > 0 && ` · ${res.P.noMatch} solicitudes sin candidatos`}</p>
            <table className="w-full min-w-[640px] text-left">
              <thead className="text-bone/60"><tr>{['Estudiante', 'Materia', 'Tutor', 'Franja', 'Por qué'].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>{res.plan.map((a) => { const r = reqOf(a.id); return (
                <tr key={a.id} className="border-t border-bone/10"><td className="p-2">{userName(db, r.studentId)}</td><td className="p-2">{nameOf(db, r.code)}</td>
                  <td className="p-2">{userName(db, a.tutorId)}</td><td className="p-2 text-azul">{slotLabel(a.slot)}</td><td className="p-2 text-bone/70">{a.why}</td></tr>) })}</tbody>
            </table>
            <div className="mt-4 flex gap-3"><button className="btn btn-primary" onClick={apply}>Aplicar asignación</button><button className="btn btn-ghost" onClick={() => setRes(null)}>Descartar</button></div>
          </section>

          <section className="panel overflow-x-auto">
            <h3 className="mb-3 text-xl font-extrabold">Comparación con otros métodos</h3>
            <table className="w-full min-w-[520px] text-left">
              <thead className="text-bone/60"><tr>{['Método', 'Conflictos', 'Calidad', 'Fitness', 'Tiempo'].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>{res.cmp.map((c, i) => (
                <tr key={c.m} className={`border-t border-bone/10 ${i === 0 ? 'text-azul' : ''}`}><td className="p-2">{c.m}</td><td className="p-2">{c.cielo}</td>
                  <td className="p-2">{c.soft.toFixed(1)}</td><td className="p-2">{c.fit.toFixed(1)}</td><td className="p-2">{c.ms < 1 ? '<1' : c.ms} ms</td></tr>))}</tbody>
            </table>
            <p className="mt-2 text-sm text-bone/50">La asignación manual es una simulación (primer tutor y franja de la lista, sin revisar choques).</p>
          </section>
        </>
      )}

      {db.runs.length > 0 && (
        <section className="panel overflow-x-auto">
          <h3 className="mb-3 text-xl font-extrabold">Historial de ejecuciones</h3>
          <table className="w-full min-w-[560px] text-left">
            <thead className="text-bone/60"><tr>{['Fecha', 'Solicitudes', 'Población', 'Generaciones', 'Fitness', 'Conflictos', 'Tiempo'].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>{db.runs.map((r) => (
              <tr key={r.id} className="border-t border-bone/10"><td className="p-2">{fmtDate(r.date)}</td><td className="p-2">{r.n}</td><td className="p-2">{r.p.pop}</td>
                <td className="p-2">{r.gens}</td><td className="p-2">{r.fit}</td><td className="p-2">{r.cielo}</td><td className="p-2">{r.ms} ms</td></tr>))}</tbody>
          </table>
        </section>
      )}
    </div>
  )
}
