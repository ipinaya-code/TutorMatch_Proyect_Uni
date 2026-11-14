import { motion } from 'framer-motion'
import { PROBLEMS } from '../../data/content.js'

export default function Problems() {
  return (
    <section id="problemas" className="section bg-ink2">
      <div className="wrap">
        <h2 className="max-w-3xl text-3xl font-extrabold sm:text-5xl">
          El problema actual en la asignación de tutorías de grado
        </h2>
        <p className="mt-4 max-w-2xl text-bone/70 text-base">
          Encontrar un docente apto según el tema propuesto es el mayor desafío en 8vo y 9no semestre. 
          Un mal asesoramiento por falta de especialidad perjudica el avance de titulación.
        </p>
        <ul className="mt-12 divide-y divide-bone/10 border-y border-bone/10">
          {PROBLEMS.map((p) => (
            <motion.li key={p.t} whileHover={{ x: 8 }} className="grid gap-2 py-7 md:grid-cols-[1fr_1.2fr] md:gap-10">
              <h3 className={`text-2xl font-bold ${p.c}`}>{p.t}</h3>
              <p className="text-bone/75">{p.d}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
