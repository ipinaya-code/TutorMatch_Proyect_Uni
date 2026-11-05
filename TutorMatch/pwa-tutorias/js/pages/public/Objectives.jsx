import { motion } from 'framer-motion'
import { OBJECTIVES } from '../../data/content.js'

export default function Objectives() {
  return (
    <section id="objetivos" className="section bg-ink2">
      <div className="wrap">
        <h2 className="max-w-2xl text-3xl font-extrabold sm:text-5xl">Qué vamos a lograr</h2>
        <ol className="mt-12 space-y-10">
          {OBJECTIVES.map((o) => (
            <motion.li key={o.v} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }} className="grid gap-3 md:grid-cols-[18rem_1fr] md:gap-10">
              <h3 className="font-display text-4xl font-extrabold text-azul sm:text-5xl">{o.v}</h3>
              <div>
                <p className="text-lg">{o.d}</p>
                <p className="mt-2 text-bone/60">{o.a}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
