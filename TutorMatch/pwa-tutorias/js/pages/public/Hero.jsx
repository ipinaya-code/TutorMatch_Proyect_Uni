import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const Helix3D = lazy(() => import('./Helix3D.jsx'))

// La hélice ocupa toda la pantalla; el contenido siguiente aparece al bajar la página.
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
    <section ref={root} className="relative flex min-h-[calc(100svh-4.5rem)] items-center overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true"><Suspense fallback={null}><Helix3D /></Suspense></div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-transparent md:via-ink/25" aria-hidden="true" />
      <div className="wrap relative z-10 py-16">
        <p className="h-fade chip mb-5 w-fit">EMI TutoMatch · Ingeniería de Sistemas · Cochabamba</p>
        <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
          <span className="block overflow-hidden"><span className="h-line block">Tutorías sin</span></span>
          <span className="block overflow-hidden"><span className="h-line block text-oro">choques de horario.</span></span>
        </h1>
        <p className="h-fade mt-6 max-w-md text-lg text-bone/80">
          EMI TutoMatch empareja tutores y estudiantes con un algoritmo genético y guarda tu agenda en el celular, incluso sin internet.
        </p>
        <div className="h-fade mt-8 flex flex-wrap gap-3">
          <button onClick={onLogin} className="btn btn-primary">Ingresar a la plataforma</button>
          <a href="#motor" className="btn btn-ghost">Probar el motor</a>
        </div>
      </div>
      <a href="#problemas" className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-sm text-bone/70 hover:text-oro">
        Desliza para ver más<span className="animate-bounce text-xl" aria-hidden="true">↓</span>
      </a>
    </section>
  )
}
