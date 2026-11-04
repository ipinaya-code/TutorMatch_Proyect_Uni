import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV } from '../data/content.js'

function useOnline() {
  const [on, setOn] = useState(navigator.onLine)
  useEffect(() => {
    const up = () => setOn(true), down = () => setOn(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])
  return on
}

export default function Navbar({ onLogin }) {
  const [open, setOpen] = useState(false)
  const online = useOnline()
  return (
    <header className="sticky top-0 z-50 border-b border-bone/10 bg-ink/80 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between">
        <a href="#" className="font-display text-xl font-extrabold">Tutor<span className="text-cian">Match</span></a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="text-bone/80 hover:text-cian">{n.label}</a>)}
          <span className="chip flex items-center gap-2">
            <i className={`dot-live h-2 w-2 rounded-full ${online ? 'bg-cian' : 'bg-ambar'}`} />
            {online ? 'En línea' : 'Sin conexión'}
          </span>
          <button className="btn btn-primary !py-2" onClick={onLogin}>Ingresar</button>
        </nav>
        <button className="btn btn-ghost !px-4 !py-2 md:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-bone/10 md:hidden" aria-label="Móvil">
            <div className="wrap flex flex-col gap-4 py-5">
              {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="text-lg">{n.label}</a>)}
              <button className="btn btn-primary w-fit" onClick={onLogin}>Ingresar</button>
              <span className="chip w-fit">{online ? 'En línea' : 'Sin conexión: usando agenda guardada'}</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
