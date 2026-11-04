// Algoritmo genético de asignación: cada gen = (tutor, franja) válido para una solicitud.
// Restricciones: tutor enseña la materia, ambos disponibles, sin doble reserva y respetando el cupo.
const rnd = (n) => Math.floor(Math.random() * n)

export function assign(reqs, users, popSize = 60, maxGen = 250) {
  const tutors = users.filter((u) => u.role === 'tutor')
  const pend = reqs.filter((r) => r.status === 'pendiente')
  const cands = pend.map((r) => {
    const s = users.find((u) => u.id === r.studentId), c = []
    tutors.forEach((t) => { if (t.subjects.includes(r.subject)) t.slots.forEach((sl) => s.slots.includes(sl) && c.push({ t, sl })) })
    return c
  })
  const idx = pend.map((_, i) => i).filter((i) => cands[i].length)
  const noMatch = pend.filter((_, i) => !cands[i].length).map((r) => r.id)
  const taken = reqs.filter((r) => r.status === 'asignada')
  const load0 = {}; taken.forEach((r) => (load0[r.tutorId] = (load0[r.tutorId] || 0) + 1))
  const book0 = taken.map((r) => `${r.tutorId}-${r.slot}`)

  const pen = (g) => {
    let p = 0; const used = new Set(book0), load = { ...load0 }
    g.forEach((k, j) => {
      const { t, sl } = cands[idx[j]][k], key = `${t.id}-${sl}`
      if (used.has(key)) p++
      used.add(key)
      load[t.id] = (load[t.id] || 0) + 1
      if (load[t.id] > t.cupo) p++
    })
    return p
  }
  const pick = (pop) => { const a = pop[rnd(pop.length)], b = pop[rnd(pop.length)]; return pen(a) <= pen(b) ? a : b }
  let pop = Array.from({ length: popSize }, () => idx.map((i) => rnd(cands[i].length)))
  let gen = 0
  for (; gen < maxGen; gen++) {
    pop.sort((a, b) => pen(a) - pen(b))
    if (pen(pop[0]) === 0) break
    const next = [pop[0], pop[1]]
    while (next.length < popSize) {
      const p1 = pick(pop), p2 = pick(pop), cut = rnd(idx.length + 1)
      const child = p1.map((k, j) => (j < cut ? k : p2[j]))
      if (Math.random() < 0.3 && idx.length) { const j = rnd(idx.length); child[j] = rnd(cands[idx[j]].length) }
      next.push(child)
    }
    pop = next
  }
  pop.sort((a, b) => pen(a) - pen(b))
  const best = pop[0] || []
  const used = new Set(book0), load = { ...load0 }, assigned = [], left = [...noMatch]
  best.forEach((k, j) => {
    const { t, sl } = cands[idx[j]][k], key = `${t.id}-${sl}`, id = pend[idx[j]].id
    if (!used.has(key) && (load[t.id] || 0) < t.cupo) { used.add(key); load[t.id] = (load[t.id] || 0) + 1; assigned.push({ id, tutorId: t.id, slot: sl }) } else left.push(id)
  })
  return { assigned, left, noMatch: noMatch.length, generations: gen, total: pend.length }
}
