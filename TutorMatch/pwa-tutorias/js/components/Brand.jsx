// Logo oficial de la EMI. Es un PNG transparente con textos azules: va sobre fondo blanco.
export const LogoBadge = ({ className = 'h-12' }) => (
  <span className="inline-flex rounded-lg bg-white px-2 py-1">
    <img src="/logo-emi.png" alt="Escuela Militar de Ingeniería — Mcal. Antonio José de Sucre" className={`${className} w-auto`} />
  </span>
)

export const Brand = () => (
  <a href="#" className="flex items-center gap-3" aria-label="EMI TutoMatch">
    <img src="/logo-emi.png" alt="Escuela Militar de Ingeniería — Mcal. Antonio José de Sucre" className="h-12 w-auto" />
    <span className="hidden border-l border-emi/25 pl-3 font-display text-xl font-extrabold text-emi sm:block">Tuto<span className="text-ink">Match</span></span>
  </a>
)
