import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const Helix3D = lazy(() => import('./Helix3D.jsx'))

export default function Hero({ onLogin }) {
  const root = useRef()
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.h-line', { yPercent: 110, duration: 0.9, stagger: 0.12 })
        .from('.h-fade', { opacity: 0, y: 16, duration: 0.6, stagger: 0.1 }, '-=0.4')
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="wrap grid min-h-[calc(100svh-4rem)] items-center gap-6 py-10 md:grid-cols-2">
      <div>
        <h1 className="text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
          <span className="block overflow-hidden"><span className="h-line block">Tutorías sin</span></span>
          <span className="block overflow-hidden"><span className="h-line block text-cian">choques de horario.</span></span>
        </h1>
        <p className="h-fade mt-6 max-w-md text-lg text-bone/75">
          TutorMatch empareja tutores y estudiantes con un algoritmo genético y guarda tu agenda en el celular, incluso sin internet.
        </p>
        <div className="h-fade mt-8 flex flex-wrap gap-3">
          <button onClick={onLogin} className="btn btn-primary">Ingresar a la plataforma</button>
          <a href="#motor" className="btn btn-ghost">Probar el motor</a>
        </div>
      </div>
      <div className="h-[340px] sm:h-[460px] md:h-[560px]">
        <Suspense fallback={null}><Helix3D /></Suspense>
      </div>
    </section>
  )
}
