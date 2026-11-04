import { useState } from 'react'
import { act } from '../utils/store.js'

export default function Auth({ onBack }) {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', pass: '', role: 'estudiante' })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    if (mode === 'register' && f.pass.length < 4) return setErr('La contraseña necesita al menos 4 caracteres.')
    setErr((mode === 'login' ? act.login(f.email, f.pass) : act.register(f)) || '')
  }
  return (
    <main className="wrap grid min-h-svh place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-md space-y-4">
        <button type="button" onClick={onBack} className="text-bone/60 hover:text-cian">Volver al inicio</button>
        <h1 className="text-3xl font-extrabold">{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
        {mode === 'register' && (
          <>
            <label className="block">Nombre completo<input required className="input mt-1" value={f.name} onChange={set('name')} /></label>
            <label className="block">Soy
              <select className="input mt-1" value={f.role} onChange={set('role')}>
                <option value="estudiante">Estudiante</option><option value="tutor">Tutor</option>
              </select>
            </label>
          </>
        )}
        <label className="block">Correo institucional<input required type="email" className="input mt-1" value={f.email} onChange={set('email')} /></label>
        <label className="block">Contraseña<input required type="password" className="input mt-1" value={f.pass} onChange={set('pass')} /></label>
        {err && <p role="alert" className="text-ambar">{err}</p>}
        <button className="btn btn-primary w-full">{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
        <button type="button" className="w-full text-bone/70 hover:text-cian" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr('') }}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
        </button>
        <div className="border-t border-bone/10 pt-3 text-sm text-bone/60">
          Cuentas de prueba (clave 1234): camila@uni.edu (estudiante), ana@uni.edu (tutor), coord@uni.edu (coordinador).
        </div>
      </form>
    </main>
  )
}
