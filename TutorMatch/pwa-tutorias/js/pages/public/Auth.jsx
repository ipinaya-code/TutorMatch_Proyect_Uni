import { useState } from 'react'
import { act } from '../../store/store.js'
import { LogoBadge } from '../../components/Brand.jsx'
import { SEMESTERS } from '../../data/curriculum.js'

export default function Auth({ onBack }) {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', pass: '', role: 'estudiante', semester: 1 })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (mode === 'register' && f.pass.length < 4) return setErr('La contraseña necesita al menos 4 caracteres.')
    const resultado = mode === 'login' ? await act.login(f.email, f.pass) : await act.register(f)
    setErr(resultado || '')
  }
  return (
    <main className="wrap grid min-h-svh place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-md space-y-4">
        <button type="button" onClick={onBack} className="text-bone/60 hover:text-azul">Volver al inicio</button>
        <LogoBadge />
        <h1 className="text-3xl font-extrabold">{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
        {mode === 'register' && (
          <>
            <label className="block">Nombre completo<input required className="input mt-1" value={f.name} onChange={set('name')} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">Soy
                <select className="input mt-1" value={f.role} onChange={set('role')}><option value="estudiante">Estudiante</option><option value="tutor">Tutor</option></select>
              </label>
              <label className="block">Semestre
                <select className="input mt-1" value={f.semester} onChange={set('semester')}>{Array.from({ length: SEMESTERS }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select>
              </label>
            </div>
          </>
        )}
        <label className="block">Correo institucional<input required type="email" className="input mt-1" value={f.email} onChange={set('email')} /></label>
        <label className="block">Contraseña<input required type="password" className="input mt-1" value={f.pass} onChange={set('pass')} /></label>
        {err && <p role="alert" className="text-oro">{err}</p>}
        <button className="btn btn-primary w-full">{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
        <button type="button" className="w-full text-bone/70 hover:text-azul" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr('') }}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
        </button>
        <div className="border-t border-bone/10 pt-3 text-sm text-bone/60">
          Cuentas de demostración (clave 1234): camila@emi.demo (estudiante), ana@emi.demo (tutor), coord@emi.demo (coordinador).
        </div>
      </form>
    </main>
  )
}
