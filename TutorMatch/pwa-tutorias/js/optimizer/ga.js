// Motor del algoritmo genético (en el backend real vive en backend/app/optimizer/).
// Cromosoma: una asignación completa. Gen: índice del candidato (tutor, franja) de una solicitud.
// Restricciones duras (se penalizan): doble reserva del tutor, doble reserva del estudiante, cupo excedido.
// Candidatos ya filtrados: el tutor ofrece la materia con nota >= mínima y ambos están libres en la franja.
// Preferencias blandas (suman): nota del tutor, equilibrio de carga, misma carrera, semestre superior.
import { free } from '../utils/helpers.js'

export const DEFAULTS = { pop: 60, gens: 120, cx: 0.8, mut: 0.12, elite: 2, wGrade: 3, wBalance: 2, wCareer: 1, wSenior: 1, hard: 50 }
const rnd = (n) => Math.floor(Math.random() * n)

export function buildProblem(db) {
  const tutors = db.users.filter((u) => u.role === 'tutor')
  const load0 = {}, book0 = new Set(), sbook0 = new Set()
  db.reqs.filter((r) => r.status === 'asignada').forEach((r) => {
    load0[r.tutorId] = (load0[r.tutorId] || 0) + 1
    book0.add(`${r.tutorId}-${r.slot}`); sbook0.add(`${r.studentId}-${r.slot}`)
  })
  const reqs = db.reqs.filter((r) => r.status === 'pendiente')
  const cands = reqs.map((r) => {
    const s = db.users.find((u) => u.id === r.studentId), sf = s ? free(s) : [], out = []
    tutors.forEach((t) => {
      const grade = t.grades[r.code] || 0
      if (!s || !t.offer.includes(r.code) || grade < db.settings.minGrade) return
      free(t).forEach((sl) => {
        if (sf.includes(sl) && !book0.has(`${t.id}-${sl}`) && !sbook0.has(`${s.id}-${sl}`))
          out.push({ t, sl, grade, career: +(t.career === s.career), senior: +(t.semester > s.semester) })
      })
    })
    return out
  })
  const idx = reqs.map((_, i) => i).filter((i) => cands[i].length)
  return { tutors, reqs, cands, idx, load0, book0, sbook0, noMatch: reqs.length - idx.length }
}

export function evaluate(P, g, w) {
  const used = new Set(P.book0), sused = new Set(P.sbook0), load = { ...P.load0 }
  let cielo = 0, gr = 0, ca = 0, se = 0
  g.forEach((k, j) => {
    const i = P.idx[j], c = P.cands[i][k], sid = P.reqs[i].studentId
    const tk = `${c.t.id}-${c.sl}`, sk = `${sid}-${c.sl}`
    if (used.has(tk)) cielo++
    if (sused.has(sk)) cielo++
    used.add(tk); sused.add(sk)
    load[c.t.id] = (load[c.t.id] || 0) + 1
    if (load[c.t.id] > c.t.cupo) cielo++
    gr += c.grade / 100; ca += c.career; se += c.senior
  })
  const n = Math.max(g.length, 1)
  const ls = P.tutors.map((t) => (load[t.id] || 0) / t.cupo)
  const mean = ls.reduce((a, b) => a + b, 0) / (ls.length || 1)
  const std = Math.sqrt(ls.reduce((a, b) => a + (b - mean) ** 2, 0) / (ls.length || 1))
  const W = w.wGrade + w.wBalance + w.wCareer + w.wSenior || 1
  const soft = (100 * (w.wGrade * (gr / n) + w.wBalance / (1 + 3 * std) + w.wCareer * (ca / n) + w.wSenior * (se / n))) / W
  return { fit: soft - w.hard * cielo, cielo, soft }
}

// Generador: produce una "foto" por generación para dibujar la evolución en vivo.
export function* evolve(P, p) {
  const n = P.idx.length
  let pop = Array.from({ length: p.pop }, () => P.idx.map((i) => rnd(P.cands[i].length)))
  let bestEver = -Infinity, since = 0
  for (let gen = 0; gen <= p.gens; gen++) {
    const sc = pop.map((g) => ({ g, ...evaluate(P, g, p) })).sort((a, b) => b.fit - a.fit)
    yield { gen, best: sc[0].fit, avg: sc.reduce((a, x) => a + x.fit, 0) / sc.length, cielo: sc[0].cielo, soft: sc[0].soft, top: sc[0] }
    if (sc[0].fit > bestEver + 1e-9) { bestEver = sc[0].fit; since = 0 } else since++
    if (sc[0].cielo === 0 && since >= 25) break // sin conflictos y sin mejora
    const tour = () => { let b = sc[rnd(sc.length)]; for (let k = 1; k < 3; k++) { const c = sc[rnd(sc.length)]; if (c.fit > b.fit) b = c } return b.g }
    const next = sc.slice(0, p.elite).map((x) => x.g)
    while (next.length < p.pop) {
      const a = tour(), b = tour(), cut = rnd(n + 1)
      let child = Math.random() < p.cx ? a.map((k, j) => (j < cut ? k : b[j])) : [...a]
      child = child.map((k, j) => (Math.random() < p.mut ? rnd(P.cands[P.idx[j]].length) : k))
      next.push(child)
    }
    pop = next
  }
}

export const decode = (P, g) => g.map((k, j) => {
  const i = P.idx[j], c = P.cands[i][k]
  return { id: P.reqs[i].id, tutorId: c.t.id, slot: c.sl, why: `Nota ${c.grade} en la materia${c.career ? ' · misma carrera' : ''}${c.senior ? ' · semestre superior' : ''}` }
})

// Garantiza que lo que se aplica no tenga conflictos (por si quedó alguno en la mejor solución).
export function sanitize(P, plan) {
  const used = new Set(P.book0), sused = new Set(P.sbook0), load = { ...P.load0 }, out = []
  plan.forEach((a) => {
    const t = P.tutors.find((x) => x.id === a.tutorId), sid = P.reqs.find((r) => r.id === a.id).studentId
    if (!used.has(`${a.tutorId}-${a.slot}`) && !sused.has(`${sid}-${a.slot}`) && (load[a.tutorId] || 0) < t.cupo) {
      used.add(`${a.tutorId}-${a.slot}`); sused.add(`${sid}-${a.slot}`); load[a.tutorId] = (load[a.tutorId] || 0) + 1; out.push(a)
    }
  })
  return out
}
