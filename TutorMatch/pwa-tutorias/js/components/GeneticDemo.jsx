import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { SLOTS, TUTORS, STUDENTS, best, fitness, nextGeneration, randomPopulation } from '../utils/genetic.js'

export default function GeneticDemo() {
  const [pop, setPop] = useState(() => randomPopulation())
  const [gen, setGen] = useState(0)
  const [running, setRunning] = useState(false)
  const bar = useRef()
  const champion = best(pop)
  const score = fitness(champion)

  useEffect(() => {
    anime({ targets: bar.current, width: `${score}%`, duration: 350, easing: 'easeOutQuad' })
  }, [score])

  useEffect(() => {
    if (!running) return
    if (score === 100 || gen >= 80) { setRunning(false); return }
    const id = setTimeout(() => { setPop((p) => nextGeneration(p)); setGen((g) => g + 1) }, 90)
    return () => clearTimeout(id)
  }, [running, pop, gen, score])

  const reset = () => { setRunning(false); setPop(randomPopulation()); setGen(0) }

  return (
    <section id="motor" className="section">
      <div className="wrap">
        <h2 className="max-w-2xl text-3xl font-extrabold sm:text-5xl">Mira cómo evoluciona una agenda</h2>
        <p className="mt-4 max-w-xl text-bone/75">
          Seis estudiantes, cuatro tutores y cinco franjas. Cada generación elimina choques hasta llegar a una agenda sin conflictos.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="flex items-end justify-between">
              <span className="font-display text-6xl font-extrabold text-ambar">{score}%</span>
              <span className="text-bone/70">Generación {gen}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-bone/10">
              <div ref={bar} className="h-full w-0 rounded-full bg-cian" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => setRunning(!running)} disabled={score === 100}>
                {running ? 'Pausar' : score === 100 ? 'Agenda óptima' : 'Evolucionar'}
              </button>
              <button className="btn btn-ghost" onClick={reset}>Reiniciar</button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-bone/10">
            <table className="w-full min-w-[420px] text-left">
              <thead className="bg-ink2 text-bone/70">
                <tr><th className="p-3 font-medium">Estudiante</th><th className="p-3 font-medium">Tutor</th><th className="p-3 font-medium">Franja</th></tr>
              </thead>
              <tbody>
                {champion.map((g, i) => {
                  const ok = TUTORS[g.t].s.includes(g.s) && STUDENTS[i].s.includes(g.s) &&
                    champion.findIndex((x) => x.t === g.t && x.s === g.s) === i
                  return (
                    <tr key={i} className="border-t border-bone/10">
                      <td className="p-3">{STUDENTS[i].n}</td>
                      <td className="p-3">{TUTORS[g.t].n}</td>
                      <td className={`p-3 ${ok ? 'text-cian' : 'text-ambar'}`}>{SLOTS[g.s]} {ok ? '✓' : '· conflicto'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
