import { useState } from 'react'
import { act } from '../../store/store.js'
import { LogoBadge } from '../../components/Brand.jsx'

export default function Auth({ onBack }) {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({
    name: '',
    email: '',
    codigo_saga: '',
    role: 'estudiante',
    semester: 8 // 8vo o 9no semestre según documento
  })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)

    try {
      if (mode === 'register' && f.codigo_saga.length < 4) {
        setLoading(false)
        return setErr('El código SAGA debe tener al menos 4 caracteres.')
      }

      const res = mode === 'login'
        ? await act.login(f.email, f.codigo_saga)
        : await act.register({
            name: f.name,
            email: f.email,
            codigo_saga: f.codigo_saga,
            role: f.role,
            semester: f.semester
          })

      if (res) setErr(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="wrap grid min-h-svh place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-md space-y-4">
        <button type="button" onClick={onBack} className="text-bone/60 hover:text-azul">
          Volver al inicio
        </button>
        <LogoBadge />
        <div>
          <h1 className="text-2xl font-extrabold">
            {mode === 'login' ? 'Iniciar Sesión Institucional' : 'Registro de Usuario'}
          </h1>
          <p className="text-xs text-bone/60 mt-1">
            Plataforma de Recomendación de Tutores y Revisores — EMI Cochabamba
          </p>
        </div>

        {mode === 'register' && (
          <>
            <label className="block text-sm">
              Nombre completo
              <input required className="input mt-1" value={f.name} onChange={set('name')} placeholder="Ej: Iver Piñaya" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Tipo de Usuario
                <select className="input mt-1" value={f.role} onChange={set('role')}>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente Tutor</option>
                </select>
              </label>
              <label className="block text-sm">
                Semestre
                <select className="input mt-1" value={f.semester} onChange={set('semester')}>
                  <option value="8">8vo Semestre</option>
                  <option value="9">9no Semestre</option>
                  <option value="10">Docente / Egresado</option>
                </select>
              </label>
            </div>
          </>
        )}

        <label className="block text-sm">
          Correo Institucional
          <input
            required
            type="email"
            className="input mt-1"
            value={f.email}
            onChange={set('email')}
            placeholder="ejm: ipinayav@est.emi.edu.bo"
          />
        </label>

        <label className="block text-sm">
          Código SAGA (Contraseña)
          <input
            required
            type="text"
            className="input mt-1"
            value={f.codigo_saga}
            onChange={set('codigo_saga')}
            placeholder="ejm: C11368-9"
          />
        </label>

        {err && <p role="alert" className="text-oro text-sm font-medium">{err}</p>}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Verificando...' : (mode === 'login' ? 'Ingresar con SAGA' : 'Crear cuenta')}
        </button>

        <button
          type="button"
          className="w-full text-xs text-bone/70 hover:text-azul text-center"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr('') }}
        >
          {mode === 'login' ? '¿Eres nuevo? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        <div className="border-t border-bone/10 pt-3 text-xs text-bone/60 space-y-2">
          <p className="font-semibold text-bone/80">Cuentas oficiales de prueba (Clic para autocompletar):</p>
          <button
            type="button"
            className="w-full text-left p-1.5 rounded bg-bone/5 hover:bg-azul/20 text-bone hover:text-white transition-all block"
            onClick={() => setF({ ...f, email: 'ipinayav@est.emi.edu.bo', codigo_saga: 'C11368-9' })}
          >
            🎓 <b>Estudiante:</b> <code>ipinayav@est.emi.edu.bo</code> | SAGA: <code>C11368-9</code>
          </button>
          <button
            type="button"
            className="w-full text-left p-1.5 rounded bg-bone/5 hover:bg-azul/20 text-bone hover:text-white transition-all block"
            onClick={() => setF({ ...f, email: 'rmendoza@adm.emi.edu.bo', codigo_saga: 'DOC-8821' })}
          >
            👨‍🏫 <b>Docente IA:</b> <code>rmendoza@adm.emi.edu.bo</code> | SAGA: <code>DOC-8821</code>
          </button>
        </div>
      </form>
    </main>
  )
}
