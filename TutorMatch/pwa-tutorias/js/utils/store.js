// "Base de datos" local en el navegador (localStorage). Funciona sin conexión.
// Se reemplaza por llamadas a la API REST cuando exista el backend.
import { useSyncExternalStore } from 'react'
const KEY = 'tutormatch-db-v1'
const mk = (id, name, role, x = {}) => ({ id, name, email: `${id}@uni.edu`, pass: '1234', role, career: '', semester: 1, subjects: [], slots: [], cupo: 3, ...x })
const seed = () => ({
  session: null,
  users: [
    mk('coord', 'Coordinación Académica', 'coordinador'),
    mk('ana', 'Ana Rojas', 'tutor', { subjects: ['Cálculo I', 'Álgebra Lineal'], slots: [0, 1, 2, 5, 6, 9, 10, 13], cupo: 4 }),
    mk('luis', 'Luis Mendoza', 'tutor', { subjects: ['Física I', 'Programación I'], slots: [2, 3, 6, 7, 10, 11, 14, 15, 18], cupo: 4 }),
    mk('marta', 'Marta Quispe', 'tutor', { subjects: ['Estadística', 'Cálculo I', 'Programación I'], slots: [0, 4, 5, 8, 9, 12, 16, 17, 19], cupo: 3 }),
    mk('camila', 'Camila Vargas', 'estudiante', { career: 'Ing. de Sistemas', semester: 2, slots: [0, 1, 5, 6, 8] }),
    mk('diego', 'Diego Soria', 'estudiante', { career: 'Ing. Civil', semester: 3, slots: [2, 3, 7, 10, 11] }),
    mk('elena', 'Elena Paz', 'estudiante', { career: 'Ing. de Sistemas', semester: 1, slots: [3, 4, 12, 15, 16] }),
    mk('fabio', 'Fabio Arce', 'estudiante', { career: 'Ing. Industrial', semester: 4, slots: [4, 8, 9, 12] }),
    mk('gala', 'Gala Rios', 'estudiante', { career: 'Ing. Civil', semester: 2, slots: [1, 5, 9, 13] }),
  ],
  reqs: [
    { id: 'r1', studentId: 'camila', subject: 'Cálculo I', status: 'pendiente' },
    { id: 'r2', studentId: 'diego', subject: 'Física I', status: 'pendiente' },
    { id: 'r3', studentId: 'elena', subject: 'Programación I', status: 'pendiente' },
    { id: 'r4', studentId: 'fabio', subject: 'Estadística', status: 'pendiente' },
    { id: 'r5', studentId: 'gala', subject: 'Álgebra Lineal', status: 'pendiente' },
  ],
})
let db
try { db = JSON.parse(localStorage.getItem(KEY)) } catch { /* vacío */ }
db = db || seed()
const subs = new Set()
const commit = (fn) => {
  db = fn(structuredClone(db))
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* sin espacio */ }
  subs.forEach((f) => f())
}
export const useDB = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => db)

export const act = {
  login(email, pass) {
    const u = db.users.find((x) => x.email === email.trim().toLowerCase() && x.pass === pass)
    if (!u) return 'Correo o contraseña incorrectos.'
    commit((d) => { d.session = u.id; return d })
  },
  register(f) {
    const email = f.email.trim().toLowerCase()
    if (db.users.some((u) => u.email === email)) return 'Ese correo ya está registrado.'
    const id = 'u' + Date.now()
    commit((d) => { d.users.push(mk(id, f.name.trim(), f.role, { email, pass: f.pass })); d.session = id; return d })
  },
  logout: () => commit((d) => { d.session = null; return d }),
  saveProfile: (id, patch) => commit((d) => { Object.assign(d.users.find((u) => u.id === id), patch); return d }),
  request: (studentId, subject) => commit((d) => { d.reqs.push({ id: 'r' + Date.now(), studentId, subject, status: 'pendiente' }); return d }),
  setReq: (id, patch) => commit((d) => { Object.assign(d.reqs.find((r) => r.id === id), patch); return d }),
  applyAssign: (list) => commit((d) => { list.forEach((a) => Object.assign(d.reqs.find((r) => r.id === a.id), { status: 'asignada', tutorId: a.tutorId, slot: a.slot })); return d }),
  reset() { const s = db.session; commit(() => ({ ...seed(), session: s })) },
}
