import { useState } from 'react'
import { act } from '../../store/store.js'
import { LogoBadge } from '../../components/Brand.jsx'

export default function Auth({ onBack }) {
  const [f, setF] = useState({
    email: '',
    codigo_saga: ''
  })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)

    try {
      const res = await act.login(f.email, f.codigo_saga)
      if (res) setErr(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="wrap grid min-h-svh place-items-center py-10">
      <div className="w-full max-w-md">
        {/* Botón Volver al inicio estilizado y separado del contenedor del logo */}
        <div className="mb-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-bone/70 hover:text-oro text-xs font-medium transition-colors border border-white/10"
          >
            <span>←</span> Volver al inicio
          </button>
        </div>

        <form onSubmit={submit} className="panel w-full space-y-4">
          <div className="flex justify-center pt-1 pb-2">
            <LogoBadge />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-bone">
              Iniciar Sesión Institucional
            </h1>
            <p className="text-xs text-bone/60 mt-1">
              Plataforma de Recomendación de Tutores y Revisores — EMI Cochabamba
            </p>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wider text-bone/80">
            Correo Institucional
            <input
              required
              type="email"
              className="input mt-1.5 w-full bg-black/40 border-bone/20 focus:border-azul"
              value={f.email}
              onChange={set('email')}
              placeholder="ejm: ipinayav@est.emi.edu.bo o docente@adm.emi.edu.bo"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wider text-bone/80">
            Código SAGA (Contraseña)
            <input
              required
              type="password"
              className="input mt-1.5 w-full bg-black/40 border-bone/20 focus:border-azul font-mono"
              value={f.codigo_saga}
              onChange={set('codigo_saga')}
              placeholder="ejm: C11368-9 o DOC-1001"
            />
          </label>

          {err && (
            <p role="alert" className="text-oro text-xs font-medium p-2 bg-oro/10 border border-oro/20 rounded-lg">
              {err}
            </p>
          )}

          <button className="btn btn-primary w-full !py-2.5 font-bold" disabled={loading}>
            {loading ? 'Verificando en Base de Datos...' : 'Ingresar con SAGA'}
          </button>
        </form>
      </div>
    </main>
  )
}
