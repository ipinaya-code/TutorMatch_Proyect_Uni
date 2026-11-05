// Métodos de comparación contra el algoritmo genético (mismas métricas, mismos candidatos).
import { evaluate } from './ga.js'
const rnd = (n) => Math.floor(Math.random() * n)

const randomPlan = (P) => P.idx.map((i) => rnd(P.cands[i].length))
const manualPlan = (P) => P.idx.map(() => 0) // simula asignar "a mano": primer tutor y franja de la lista, sin revisar choques

function greedyPlan(P) {
  const used = new Set(P.book0), sused = new Set(P.sbook0), load = { ...P.load0 }
  return P.idx.map((i) => {
    let best = 0, bs = -Infinity
    P.cands[i].forEach((c, k) => {
      const ok = !used.has(`${c.t.id}-${c.sl}`) && !sused.has(`${P.reqs[i].studentId}-${c.sl}`) && (load[c.t.id] || 0) < c.t.cupo
      const s = (ok ? 1000 : 0) + c.grade + 10 * c.career + 10 * c.senior - 5 * (load[c.t.id] || 0)
      if (s > bs) { bs = s; best = k }
    })
    const c = P.cands[i][best]
    used.add(`${c.t.id}-${c.sl}`); sused.add(`${P.reqs[i].studentId}-${c.sl}`); load[c.t.id] = (load[c.t.id] || 0) + 1
    return best
  })
}

export function compareMethods(P, w, ga, gaMs) {
  const run = (m, f) => { const t = performance.now(), g = f(); return { m, ms: Math.round(performance.now() - t), ...evaluate(P, g, w) } }
  return [
    { m: 'Algoritmo genético', ms: gaMs, fit: ga.best, cielo: ga.cielo, soft: ga.soft },
    run('Voraz (greedy)', () => greedyPlan(P)),
    run('Aleatorio', () => randomPlan(P)),
    run('Manual (simulada)', () => manualPlan(P)),
  ]
}
