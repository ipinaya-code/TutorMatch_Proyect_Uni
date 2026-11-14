export default function FlowPipeline({ step = 1 }) {
  const steps = [
    {
      num: 1,
      title: '1. Título Tentativo',
      desc: 'Ingreso del tema planificado (8vo / 9no semestre)'
    },
    {
      num: 2,
      title: '2. Procesamiento NLP',
      desc: 'Extracción de palabras clave técnicas (IA, MVC, etc.)'
    },
    {
      num: 3,
      title: '3. Red Neuronal',
      desc: 'Cálculo de pesos y similitud con especialidad docente'
    },
    {
      num: 4,
      title: '4. Envío PDF y Plazo 72h',
      desc: 'Notificación al docente (espera de respuesta)'
    },
    {
      num: 5,
      title: '5. Revisores del Tema',
      desc: 'Designación automática al aceptar la tutoría'
    }
  ]

  return (
    <div className="w-full my-4 p-4 rounded-xl bg-slate-900/60 border border-bone/10">
      <h3 className="text-xs font-mono uppercase tracking-wider text-bone/60 mb-3">
        Pipeline del Algoritmo Neuronal EMI
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {steps.map((s) => {
          const isCurrent = step === s.num
          const isDone = step > s.num
          return (
            <div
              key={s.num}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                isCurrent
                  ? 'bg-azul/20 border-azul shadow-lg shadow-azul/10 scale-102'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-bone/80'
                  : 'bg-black/20 border-bone/5 text-bone/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-azul text-black'
                      : isDone
                      ? 'bg-emerald-500 text-black'
                      : 'bg-bone/20 text-bone/60'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </span>
                <span className="text-xs font-semibold">{s.title}</span>
              </div>
              <p className="text-[11px] leading-tight text-bone/60">{s.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

