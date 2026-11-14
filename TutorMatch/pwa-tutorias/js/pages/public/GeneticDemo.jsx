import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

export default function GeneticDemo() {
  const [running, setRunning] = useState(false)
  const [epoca, setEpoca] = useState(1)
  const [afinidad, setAfinidad] = useState(45)
  const bar = useRef()

  const ejemploTokens = ['#IA', '#Automatización', '#MVC', '#Arquitectura', '#Microservicios']
  const docentesMatch = [
    { nombre: 'Ing. Roberto Mendoza', especialidad: 'IA & Machine Learning', afinidad: 94.2 },
    { nombre: 'Ing. Patricia Soria', especialidad: 'Arquitectura & Metodologías', afinidad: 88.5 },
    { nombre: 'Ing. Carlos Fernández', especialidad: 'Bases de Datos & Cloud', afinidad: 74.0 }
  ]

  useEffect(() => {
    anime({ targets: bar.current, width: `${afinidad}%`, duration: 400, easing: 'easeOutQuad' })
  }, [afinidad])

  useEffect(() => {
    if (!running) return
    if (afinidad >= 95 || epoca >= 50) { setRunning(false); return }
    const id = setTimeout(() => {
      setEpoca(e => e + 1)
      setAfinidad(a => Math.min(a + Math.floor(Math.random() * 4 + 1), 95))
    }, 80)
    return () => clearTimeout(id)
  }, [running, epoca, afinidad])

  const reset = () => {
    setRunning(false)
    setEpoca(1)
    setAfinidad(45)
  }

  return (
    <section id="motor" className="section">
      <div className="wrap">
        <h2 className="max-w-3xl text-3xl font-extrabold sm:text-5xl">
          Cómo evalúa la Red Neuronal el tema propuesto
        </h2>
        <p className="mt-4 max-w-2xl text-bone/75 text-base">
          El estudiante ingresa su título tentativo. La red extrae los descriptores técnicos por NLP, 
          calcula los pesos de afinidad semántica y recomienda al docente tutor idóneo junto al comité revisor.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr] items-center">
          <div className="panel bg-slate-900/60 border-bone/15 p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-azul font-bold">
              Simulación de Entrenamiento Neuronal
            </span>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-display text-5xl font-extrabold text-oro">{afinidad}%</span>
                <span className="text-xs text-bone/60 block">Afinidad Máxima Obtenida</span>
              </div>
              <span className="text-xs font-mono text-bone/70">Época: {epoca} / 50</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-bone/10">
              <div ref={bar} className="h-full w-0 rounded-full bg-azul" />
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              {ejemploTokens.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-azul/15 text-azul border border-azul/30 font-mono">
                  {t}
                </span>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                className="btn btn-primary !py-2 text-xs font-bold"
                onClick={() => setRunning(!running)}
                disabled={afinidad >= 95}
              >
                {running ? 'Pausar red' : afinidad >= 95 ? 'Modelo Convergido' : 'Simular Red Neuronal'}
              </button>
              <button className="btn btn-ghost !py-2 text-xs" onClick={reset}>
                Reiniciar
              </button>
            </div>
          </div>

          <div className="panel bg-slate-900/40 border-bone/10 p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-bone/80 flex items-center justify-between">
              <span>Top Docentes Recomendados por la Red</span>
              <span className="text-xs text-emerald-400 font-mono font-normal">NLP Coseno Activo</span>
            </h3>

            <div className="space-y-2.5">
              {docentesMatch.map((doc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-black/30 border border-bone/10 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-bone">{doc.nombre}</p>
                    <p className="text-xs text-bone/60">Área: {doc.especialidad}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {Math.min(doc.afinidad, afinidad)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-bone/10 text-[11px] text-bone/60">
              💡 <b>Regla EMI:</b> Al aceptar el tutor, la red designa automáticamente a 2 docentes revisores afines al tema.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
