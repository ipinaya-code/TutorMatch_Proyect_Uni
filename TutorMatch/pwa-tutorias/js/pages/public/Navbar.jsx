import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV } from '../../data/content.js'
import { Brand } from '../../components/Brand.jsx'

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
    <header className="sticky top-0 z-50 bg-white text-ink shadow-lg shadow-black/25">
      <div className="wrap flex h-[4.5rem] items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="font-medium text-ink/80 hover:text-emi">{n.label}</a>)}
          <span className="flex items-center gap-2 rounded-full border border-emi/25 px-3 py-1 text-sm text-emi">
            <i className={`dot-live h-2 w-2 rounded-full ${online ? 'bg-emi' : 'bg-oro'}`} />{online ? 'En línea' : 'Sin conexión'}
          </span>
          <button className="btn btn-primary !py-2" onClick={onLogin}>Ingresar</button>
        </nav>
        <button className="rounded-full border border-emi/30 px-4 py-2 font-bold text-emi md:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-emi/15 md:hidden" aria-label="Móvil">
            <div className="wrap flex flex-col gap-4 py-5">
              {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="text-lg font-medium text-ink">{n.label}</a>)}
              <button className="btn btn-primary w-fit" onClick={onLogin}>Ingresar</button>
              <span className="w-fit rounded-full border border-emi/25 px-3 py-1 text-sm text-emi">{online ? 'En línea' : 'Sin conexión: usando agenda guardada'}</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
