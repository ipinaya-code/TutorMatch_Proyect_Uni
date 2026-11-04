// Mini algoritmo genético: cada estudiante recibe (tutor, franja).
// Penaliza: tutor no disponible, estudiante no disponible, tutor doble-reservado.
export const SLOTS = ['Lun 8h', 'Lun 10h', 'Mar 8h', 'Mar 10h', 'Mié 8h']
export const TUTORS = [
  { n: 'Ana', s: [0, 1, 2] },
  { n: 'Luis', s: [2, 3, 4] },
  { n: 'Marta', s: [0, 3, 4] },
  { n: 'Raúl', s: [1, 2, 4] },
]
export const STUDENTS = [
  { n: 'Camila', s: [0, 2] },
  { n: 'Diego', s: [1, 2, 3] },
  { n: 'Elena', s: [3, 4] },
  { n: 'Fabio', s: [0, 4] },
  { n: 'Gala', s: [1, 4] },
  { n: 'Hugo', s: [2, 3] },
]
const MAX_PEN = STUDENTS.length * 3
const rnd = (n) => Math.floor(Math.random() * n)
const gene = () => ({ t: rnd(TUTORS.length), s: rnd(SLOTS.length) })

export const randomIndividual = () => STUDENTS.map(gene)
export const randomPopulation = (n = 40) => Array.from({ length: n }, randomIndividual)

export function fitness(ind) {
  let pen = 0
  const used = new Set()
  ind.forEach((g, i) => {
    if (!TUTORS[g.t].s.includes(g.s)) pen++
    if (!STUDENTS[i].s.includes(g.s)) pen++
    const k = `${g.t}-${g.s}`
    if (used.has(k)) pen++
    used.add(k)
  })
  return Math.round((1 - pen / MAX_PEN) * 100)
}

const tournament = (pop) => {
  const a = pop[rnd(pop.length)], b = pop[rnd(pop.length)]
  return fitness(a) >= fitness(b) ? a : b
}

export function nextGeneration(pop) {
  const sorted = [...pop].sort((a, b) => fitness(b) - fitness(a))
  const next = [sorted[0], sorted[1]] // elitismo
  while (next.length < pop.length) {
    const p1 = tournament(pop), p2 = tournament(pop)
    const cut = rnd(STUDENTS.length)
    const child = p1.map((g, i) => ({ ...(i < cut ? g : p2[i]) }))
    if (Math.random() < 0.3) child[rnd(child.length)] = gene() // mutación
    next.push(child)
  }
  return next
}

export const best = (pop) => pop.reduce((m, x) => (fitness(x) > fitness(m) ? x : m), pop[0])
