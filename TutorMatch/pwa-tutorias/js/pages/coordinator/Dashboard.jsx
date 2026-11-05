import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const tip = { contentStyle: { background: '#062950', border: '1px solid rgba(243,246,251,.2)', borderRadius: 8 }, cursor: { fill: 'rgba(243,246,251,.06)' } }
const axis = { stroke: '#F3F6FB', tick: { fill: '#F3F6FB', fontSize: 12 }, strokeOpacity: 0.3 }

export default function Dashboard({ db }) {
  const c = (s) => db.reqs.filter((r) => r.status === s).length
  const rated = db.reqs.filter((r) => r.rating)
  const sat = rated.length ? (rated.reduce((a, r) => a + r.rating, 0) / rated.length).toFixed(1) : '—'
  const done = c('realizada') + c('ausente')
  const att = done ? Math.round((c('realizada') / done) * 100) + '%' : '—'
  const byStatus = ['pendiente', 'asignada', 'realizada', 'ausente', 'cancelada'].map((s) => ({ estado: s, total: c(s) }))
  const byTutor = db.users.filter((u) => u.role === 'tutor').map((t) => {
    const rs = db.reqs.filter((r) => r.tutorId === t.id && r.rating)
    return { tutor: t.name.split(' ')[0], promedio: rs.length ? +(rs.reduce((a, r) => a + r.rating, 0) / rs.length).toFixed(1) : 0 }
  }).filter((x) => x.promedio)
  const tiles = [['Solicitudes', db.reqs.length], ['Pendientes', c('pendiente')], ['Asistencia', att], ['Satisfacción', sat === '—' ? sat : `${sat}/5`]]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(([k, v]) => <div key={k} className="panel"><p className="text-bone/60">{k}</p><p className="font-display text-4xl font-extrabold text-azul">{v}</p></div>)}
      </div>
      <section className="panel"><h2 className="mb-4 text-xl font-extrabold">Solicitudes por estado</h2>
        <ResponsiveContainer width="100%" height={240}><BarChart data={byStatus}><CartesianGrid strokeOpacity={0.1} /><XAxis dataKey="estado" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...tip} /><Bar dataKey="total" fill="#579DFF" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
      </section>
      <section className="panel"><h2 className="mb-4 text-xl font-extrabold">Valoración promedio por tutor</h2>
        {byTutor.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={byTutor}><CartesianGrid strokeOpacity={0.1} /><XAxis dataKey="tutor" {...axis} /><YAxis domain={[0, 5]} {...axis} /><Tooltip {...tip} /><Bar dataKey="promedio" fill="#F8D800" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          : <p className="text-bone/60">Aún no hay valoraciones. Aparecerán cuando los estudiantes valoren sus tutorías realizadas.</p>}
      </section>
    </div>
  )
}
