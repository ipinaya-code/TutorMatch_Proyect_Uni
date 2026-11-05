import { LogoBadge } from '../../components/Brand.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-bone/10 py-10">
      <div className="wrap flex flex-col items-start gap-5 text-bone/60 md:flex-row md:items-center md:justify-between">
        <LogoBadge />
        <div>
          <p className="font-display text-lg font-bold text-bone">EMI TutoMatch</p>
          <p>Tutorías universitarias · Escuela Militar de Ingeniería, Cochabamba</p>
        </div>
        <span>Optimización con algoritmos genéticos</span>
      </div>
    </footer>
  )
}
