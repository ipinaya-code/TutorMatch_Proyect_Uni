// Capa de datos del frontend. Imita lo que hará la API REST (mismas entidades que el
// modelo de datos del documento) y persiste en IndexedDB. Para conectar el backend real,
// cada acción de `act` pasa a ser una llamada fetch a /api/v1/...
import { useSyncExternalStore } from 'react'
import { idbGet, idbSet } from '../offline/idb.js'
import { ALL_SLOTS, slotLabel } from '../data/content.js'
import { buildCatalog, CAREER, isTutorable } from '../data/curriculum.js'
import { apiLogin, apiRegistro, apiCrearSolicitud } from '../utils/api.js'

const KEY = 'db-v3'
const rng = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const FN = ['Camila', 'Diego', 'Elena', 'Fabio', 'Gala', 'Hugo', 'Irene', 'Jorge', 'Karla', 'Luis', 'Marta', 'Nora', 'Omar', 'Paola', 'Rafael', 'Sofía', 'Tomás', 'Ursula', 'Víctor', 'Ximena', 'Andrés', 'Bruno']
const LN = ['Vargas', 'Soria', 'Paz', 'Arce', 'Ríos', 'Mendoza', 'Quispe', 'Rojas', 'Flores', 'Choque']

function seed() {
  const r = rng(11)
  const pick = (a) => a[Math.floor(r() * a.length)]
  const sample = (a, n) => [...a].sort(() => r() - 0.5).slice(0, n)
  const subjects = buildCatalog()
  const semOf = Object.fromEntries(subjects.map((s) => [s.code, s.semester]))
  const person = (id, name, role, semester, x = {}) => ({
    id, name, email: `${id}@emi.demo`, pass: '1234', role, career: CAREER, semester,
    classes: sample(ALL_SLOTS, role === 'tutor' ? 10 : 11).sort((a, b) => a - b), grades: {}, offer: [], cupo: 4, ...x,
  })
  const tutors = ['ana', ...Array.from({ length: 7 }, (_, i) => `tutor${i + 1}`)].map((id, i) => {
    const sem = 6 + (i % 3), grades = {}
    subjects.filter((s) => s.semester < sem && isTutorable(s)).forEach((s) => { grades[s.code] = 60 + Math.floor(r() * 39) })
    const t = person(id, id === 'ana' ? 'Ana Rojas' : `${pick(FN)} ${pick(LN)}`, 'tutor', sem, { grades, cupo: 3 + Math.floor(r() * 3) })
    t.offer = sample(Object.keys(grades).filter((c) => grades[c] >= 70 && semOf[c] <= 5), 10)
    return t
  })
  tutors[0].grades['LBAT-01-01-02'] = 90
  if (!tutors[0].offer.includes('LBAT-01-01-02')) tutors[0].offer.push('LBAT-01-01-02')
  const students = ['camila', ...Array.from({ length: 21 }, (_, i) => `est${i + 1}`)].map((id, i) =>
    person(id, id === 'camila' ? 'Camila Vargas' : `${pick(FN)} ${pick(LN)}`, 'estudiante', id === 'camila' ? 1 : 1 + (i % 4)))
  const reqs = students.slice(0, 20).map((s, i) => ({
    id: `r${i + 1}`, studentId: s.id, status: 'pendiente', created: new Date().toISOString(),
    code: s.id === 'camila' ? 'LBAT-01-01-02' : pick(subjects.filter((x) => x.semester === s.semester && isTutorable(x))).code,
  }))
  return {
    session: null, pending: 0, settings: { minGrade: 70 }, subjects, reqs, runs: [], notes: [],
    users: [person('coord', 'Coordinación Académica', 'coordinador', 1), ...tutors, ...students],
  }
}

let db = null
const subs = new Set()
const emit = () => subs.forEach((f) => f())
export const ready = idbGet(KEY).then((v) => { db = v || seed() }).catch(() => { db = seed() }).then(emit)
export const getDB = () => db
export const useDB = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => db)

function commit(fn) {
  db = fn(structuredClone(db))
  if (!navigator.onLine) db.pending = (db.pending || 0) + 1 // cambios en cola para sincronizar
  idbSet(KEY, db).catch(() => {})
  emit()
}
window.addEventListener('online', () => db?.pending && commit((d) => { d.pending = 0; return d })) // sincronización simulada

const note = (d, userId, subject, body) =>
  d.notes.unshift({ id: 'n' + Math.random().toString(36).slice(2, 9), userId, subject, body, date: new Date().toISOString(), read: false })
const sname = (d, code) => d.subjects.find((s) => s.code === code)?.name || code
const uname = (d, id) => d.users.find((u) => u.id === id)?.name || ''
const find = (d, id) => d.reqs.find((r) => r.id === id)

export const act = {
  async login(email, pass) {
    // 1. Intento de autenticación real contra la API en Python / PostgreSQL
    const resApi = await apiLogin(email, pass)
    if (resApi.exito && resApi.datos?.usuario) {
      const u = resApi.datos.usuario
      // Sincronizar o mantener sesión local
      commit((d) => {
        let existente = d.users.find((x) => x.email === u.email)
        if (!existente) {
          d.users.push({
            id: String(u.id),
            name: u.nombre,
            email: u.email,
            pass: pass,
            role: u.rol,
            career: u.carrera || CAREER,
            semester: u.semestre || 1,
            classes: [],
            grades: {},
            offer: [],
            cupo: 4
          })
        }
        d.session = existente ? existente.id : String(u.id)
        return d
      })
      return null // Sin error
    }

    // 2. Fallback local si el backend estuviera apagado
    const uLocal = db.users.find((x) => x.email === email.trim().toLowerCase() && x.pass === pass)
    if (!uLocal) return 'Correo o contraseña incorrectos.'
    commit((d) => { d.session = uLocal.id; return d })
  },
  async register(f) {
    const email = f.email.trim().toLowerCase()
    
    // 1. Enviar registro al Backend / PostgreSQL
    await apiRegistro({
      nombre: f.name.trim(),
      email: email,
      password: f.pass,
      rol: f.role,
      semestre: Number(f.semester) || 1
    })

    // 2. Persistir localmente en la PWA
    if (db.users.some((u) => u.email === email)) return 'Ese correo ya está registrado.'
    const id = 'u' + Date.now()
    commit((d) => {
      d.users.push({ id, name: f.name.trim(), email, pass: f.pass, role: f.role, career: CAREER, semester: +f.semester, classes: [], grades: {}, offer: [], cupo: 4 })
      note(d, id, 'Bienvenido a EMI TutoMatch', 'Tu cuenta fue creada. Registra tu horario de clases para calcular tu disponibilidad.')
      d.session = id; return d
    })
  },
  logout: () => commit((d) => { d.session = null; return d }),
  saveUser: (id, patch) => commit((d) => { Object.assign(d.users.find((u) => u.id === id), patch); return d }),
  setSettings: (patch) => commit((d) => { Object.assign(d.settings, patch); return d }),
  markRead: (userId) => commit((d) => { d.notes.forEach((n) => n.userId === userId && (n.read = true)); return d }),

  createRequest: (studentId, code) => commit((d) => {
    d.reqs.push({ id: 'r' + Date.now(), studentId, code, status: 'pendiente', created: new Date().toISOString() })
    note(d, studentId, 'Solicitud recibida', `Recibimos tu solicitud de tutoría en ${sname(d, code)}. Te avisaremos cuando tengas tutor y horario.`)
    return d
  }),
  applyAssign: (list) => commit((d) => {
    list.forEach((a) => {
      const r = find(d, a.id)
      Object.assign(r, { status: 'asignada', tutorId: a.tutorId, slot: a.slot, mode: 'Presencial', place: `Aula ${100 + a.slot}` })
      const when = `${slotLabel(a.slot)} · ${r.mode} · ${r.place}`
      note(d, r.studentId, 'Tutoría asignada', `${sname(d, r.code)} con ${uname(d, a.tutorId)}: ${when}.`)
      note(d, a.tutorId, 'Nuevo estudiante asignado', `${uname(d, r.studentId)} · ${sname(d, r.code)}: ${when}.`)
    })
    return d
  }),
  release: (id) => commit((d) => { Object.assign(find(d, id), { status: 'pendiente', tutorId: null, slot: null }); return d }),
  cancel: (id) => commit((d) => {
    const r = find(d, id); r.status = 'cancelada'
    if (r.tutorId) note(d, r.tutorId, 'Sesión cancelada', `${uname(d, r.studentId)} canceló la tutoría de ${sname(d, r.code)}.`)
    return d
  }),
  reschedule: (id) => commit((d) => {
    const r = find(d, id), prev = r.tutorId
    Object.assign(r, { status: 'pendiente', tutorId: null, slot: null })
    note(d, r.studentId, 'Reprogramación solicitada', `Tu tutoría de ${sname(d, r.code)} volvió a pendiente para una nueva asignación.`)
    if (prev) note(d, prev, 'Sesión reprogramada', `La sesión con ${uname(d, r.studentId)} será reasignada.`)
    return d
  }),
  attendance: (id, ok) => commit((d) => {
    const r = find(d, id); r.status = ok ? 'realizada' : 'ausente'
    if (ok) note(d, r.studentId, 'Valora tu tutoría', `¿Cómo te fue en ${sname(d, r.code)}? Entra a tu agenda y deja tu valoración.`)
    return d
  }),
  rate: (id, n) => commit((d) => { find(d, id).rating = n; return d }),
  saveRun: (run) => commit((d) => { d.runs.unshift(run); d.runs = d.runs.slice(0, 20); return d }),
  importSubjects: (rows) => commit((d) => {
    rows.forEach(([code, name, semester, area]) => {
      const s = { code, name, semester: +semester, area: area || 'Sin área' }, i = d.subjects.findIndex((x) => x.code === code)
      i >= 0 ? (d.subjects[i] = s) : d.subjects.push(s)
    })
    return d
  }),
  reset() { const s = db.session; commit(() => ({ ...seed(), session: s })) },
}
