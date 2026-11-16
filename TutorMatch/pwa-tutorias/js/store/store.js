// Capa de datos y sesión institucional EMI TutorMatch
import { useSyncExternalStore } from 'react'
import { idbGet, idbSet } from '../offline/idb.js'
import { apiLogin } from '../utils/api.js'

const KEY = 'tutormatch_emi_session_v5'
const CAREER = 'Ingeniería de Sistemas'

// Nómina Oficial de Estudiantes y Docentes cargados directamente en la BD
const USUARIOS_OFICIALES_BD = [
  // 15 Docentes Tutores Oficiales
  { id: '1', name: 'Ing. Marcelo Quiroga', email: 'mquiroga@adm.emi.edu.bo', pass: 'DOC-1001', codigo_saga: 'DOC-1001', role: 'docente', semester: 10 },
  { id: '2', name: 'Ing. Roberto Mendoza', email: 'rmendoza@adm.emi.edu.bo', pass: 'DOC-1002', codigo_saga: 'DOC-1002', role: 'docente', semester: 10 },
  { id: '3', name: 'Ing. Patricia Soria', email: 'psoria@adm.emi.edu.bo', pass: 'DOC-1003', codigo_saga: 'DOC-1003', role: 'docente', semester: 10 },
  { id: '4', name: 'Ing. Carlos Arce', email: 'carce@adm.emi.edu.bo', pass: 'DOC-1004', codigo_saga: 'DOC-1004', role: 'docente', semester: 10 },
  { id: '5', name: 'Ing. Valeria Torrico', email: 'vtorrico@adm.emi.edu.bo', pass: 'DOC-1005', codigo_saga: 'DOC-1005', role: 'docente', semester: 10 },
  { id: '6', name: 'Ing. Fernando Rojas', email: 'frojas@adm.emi.edu.bo', pass: 'DOC-1006', codigo_saga: 'DOC-1006', role: 'docente', semester: 10 },
  { id: '7', name: 'Ing. Andrea Morales', email: 'amorales@adm.emi.edu.bo', pass: 'DOC-1007', codigo_saga: 'DOC-1007', role: 'docente', semester: 10 },
  { id: '8', name: 'Lic. Gabriela Paz', email: 'gpaz@adm.emi.edu.bo', pass: 'DOC-1008', codigo_saga: 'DOC-1008', role: 'docente', semester: 10 },
  { id: '9', name: 'Ing. Hugo Zeballos', email: 'hzeballos@adm.emi.edu.bo', pass: 'DOC-1009', codigo_saga: 'DOC-1009', role: 'docente', semester: 10 },
  { id: '10', name: 'Ing. Claudia Medina', email: 'cmedina@adm.emi.edu.bo', pass: 'DOC-1010', codigo_saga: 'DOC-1010', role: 'docente', semester: 10 },
  { id: '11', name: 'Ing. Diego Flores', email: 'dflores@adm.emi.edu.bo', pass: 'DOC-1011', codigo_saga: 'DOC-1011', role: 'docente', semester: 10 },
  { id: '12', name: 'Ing. Paola Vargas', email: 'pvargas@adm.emi.edu.bo', pass: 'DOC-1012', codigo_saga: 'DOC-1012', role: 'docente', semester: 10 },
  { id: '13', name: 'Ing. Sergio Camacho', email: 'scamacho@adm.emi.edu.bo', pass: 'DOC-1013', codigo_saga: 'DOC-1013', role: 'docente', semester: 10 },
  { id: '14', name: 'Ing. Lucía Benítez', email: 'lbenitez@adm.emi.edu.bo', pass: 'DOC-1014', codigo_saga: 'DOC-1014', role: 'docente', semester: 10 },
  { id: '15', name: 'Ing. Javier Navarro', email: 'jnavarro@adm.emi.edu.bo', pass: 'DOC-1015', codigo_saga: 'DOC-1015', role: 'docente', semester: 10 },

  // Estudiantes Oficiales de la Relación Nominal
  { id: '101', name: 'Joaquin Rodrigo Ocampo Valdivia', email: 'jocampov@est.emi.edu.bo', pass: 'C11550-9', codigo_saga: 'C11550-9', role: 'estudiante', semester: 8 },
  { id: '102', name: 'Erlan Ostin Sanchez Yucra', email: 'esanchezy@est.emi.edu.bo', pass: 'C11591-6', codigo_saga: 'C11591-6', role: 'estudiante', semester: 8 },
  { id: '103', name: 'Maria del Carmen Villarpando Yucra', email: 'mvillarpandoy@est.emi.edu.bo', pass: 'C11379-4', codigo_saga: 'C11379-4', role: 'estudiante', semester: 8 },
  { id: '104', name: 'Juan Pablo Jimenez Siles', email: 'jjimenezs@est.emi.edu.bo', pass: 'C11522-3', codigo_saga: 'C11522-3', role: 'estudiante', semester: 8 },
  { id: '105', name: 'Sharaid Gabriela Cruz Serrano', email: 'scruzs@est.emi.edu.bo', pass: 'C11424-3', codigo_saga: 'C11424-3', role: 'estudiante', semester: 8 },
  { id: '106', name: 'Thiago Leonardo Sossa Chugar', email: 'tsossac@est.emi.edu.bo', pass: 'C11627-0', codigo_saga: 'C11627-0', role: 'estudiante', semester: 8 },
  { id: '107', name: 'Marcelo Fabricio Delgado Cardozo', email: 'mdelgadoc@est.emi.edu.bo', pass: 'C11947-4', codigo_saga: 'C11947-4', role: 'estudiante', semester: 8 },
  { id: '108', name: 'Richard Simon Vargas Cachi', email: 'rvargasc@est.emi.edu.bo', pass: 'C11596-7', codigo_saga: 'C11596-7', role: 'estudiante', semester: 8 },
  { id: '109', name: 'Carlos David Luna Arebalo', email: 'clunaa@est.emi.edu.bo', pass: 'C10202-4', codigo_saga: 'C10202-4', role: 'estudiante', semester: 8 },
  { id: '110', name: 'Carlos Daniel Ledezma Arias', email: 'cledezmaa@est.emi.edu.bo', pass: 'C10170-2', codigo_saga: 'C10170-2', role: 'estudiante', semester: 8 },
  { id: '111', name: 'Alexander Mamani Coyo', email: 'amamanic@est.emi.edu.bo', pass: 'C9924-4', codigo_saga: 'C9924-4', role: 'estudiante', semester: 8 },
  { id: '112', name: 'Nataly Karen Quispe Cordero', email: 'nquispec@est.emi.edu.bo', pass: 'C11032-9', codigo_saga: 'C11032-9', role: 'estudiante', semester: 8 },
  { id: '113', name: 'Elvin Andres Gutierrez Lozano', email: 'egutierrezl@est.emi.edu.bo', pass: 'C11773-0', codigo_saga: 'C11773-0', role: 'estudiante', semester: 8 },
  { id: '114', name: 'Lucio Alfredo Mercado Mendoza', email: 'lmercadom@est.emi.edu.bo', pass: 'C10748-4', codigo_saga: 'C10748-4', role: 'estudiante', semester: 8 },
  { id: '115', name: 'Rubi Natalie Carballo Saavedra', email: 'rcarballos@est.emi.edu.bo', pass: 'C10797-2', codigo_saga: 'C10797-2', role: 'estudiante', semester: 8 },
  { id: '116', name: 'Angel Gabriel Rocha Tarqui', email: 'arochat@est.emi.edu.bo', pass: 'A26895-X', codigo_saga: 'A26895-X', role: 'estudiante', semester: 8 },
  { id: '117', name: 'Dilan Itamar Muriel Vargas', email: 'dmurielv@est.emi.edu.bo', pass: 'C11475-8', codigo_saga: 'C11475-8', role: 'estudiante', semester: 8 },
  { id: '118', name: 'Juan Falcao Conde Casas', email: 'jcondec@est.emi.edu.bo', pass: 'C11495-2', codigo_saga: 'C11495-2', role: 'estudiante', semester: 8 },
  { id: '119', name: 'Yadir Dilan Llanque Canedo', email: 'yllanquec@est.emi.edu.bo', pass: 'C11881-8', codigo_saga: 'C11881-8', role: 'estudiante', semester: 8 },
  { id: '120', name: 'Marco Antonio Quintana Callejas', email: 'mquintanac@est.emi.edu.bo', pass: 'C11613-0', codigo_saga: 'C11613-0', role: 'estudiante', semester: 8 },
  { id: '121', name: 'Juan Rodolfo Murillo Rodriguez', email: 'jmurillor@est.emi.edu.bo', pass: 'C11251-8', codigo_saga: 'C11251-8', role: 'estudiante', semester: 8 },
  { id: '122', name: 'Damaris Dariane Muriel Altamirano', email: 'dmuriela@est.emi.edu.bo', pass: 'C11389-1', codigo_saga: 'C11389-1', role: 'estudiante', semester: 8 },
  { id: '123', name: 'George Pablo Zurita Gutierrez', email: 'gzuritag@est.emi.edu.bo', pass: 'C11942-3', codigo_saga: 'C11942-3', role: 'estudiante', semester: 8 },
  { id: '124', name: 'Jherson Adolfo Pinto Lujan', email: 'jpintol@est.emi.edu.bo', pass: 'C11546-0', codigo_saga: 'C11546-0', role: 'estudiante', semester: 8 },
  { id: '125', name: 'Wilson Oscar Gonzales Jimenez', email: 'wgonzalesj@est.emi.edu.bo', pass: 'C11680-7', codigo_saga: 'C11680-7', role: 'estudiante', semester: 8 },
  { id: '126', name: 'Nataly Nicole Crespo Arriarán', email: 'ncrespoa@est.emi.edu.bo', pass: 'C11483-9', codigo_saga: 'C11483-9', role: 'estudiante', semester: 8 },
  { id: '127', name: 'Iver Pinaya Verduguez', email: 'ipinayav@est.emi.edu.bo', pass: 'C11368-9', codigo_saga: 'C11368-9', role: 'estudiante', semester: 8 },
  { id: '128', name: 'Mariano Julian Herbas Quispe', email: 'mherbasq@est.emi.edu.bo', pass: 'C9499-4', codigo_saga: 'C9499-4', role: 'estudiante', semester: 8 },
  { id: '129', name: 'Leonel Aduviri Calizaya', email: 'laduviric@est.emi.edu.bo', pass: 'C11515-0', codigo_saga: 'C11515-0', role: 'estudiante', semester: 8 },
  { id: '130', name: 'Carlos Ronald Villca Calcina', email: 'cvillcac@est.emi.edu.bo', pass: 'C10926-6', codigo_saga: 'C10926-6', role: 'estudiante', semester: 8 },
  { id: '131', name: 'Kevin Carlos Portanda Lupa', email: 'kportandal@est.emi.edu.bo', pass: 'C8597-5', codigo_saga: 'C8597-5', role: 'estudiante', semester: 8 },
  { id: '132', name: 'Arian Alejandro Solís Rojas', email: 'asolisr@est.emi.edu.bo', pass: 'C11612-2', codigo_saga: 'C11612-2', role: 'estudiante', semester: 8 }
]

function inicializarEstado() {
  return {
    session: null,
    users: USUARIOS_OFICIALES_BD.map(u => ({ ...u, career: CAREER })),
    pending: 0,
    notes: [],
    reqs: [],
    runs: []
  }
}

function normalizarEstadoPersistido(estado) {
  const oficialesPorCorreo = new Map(
    USUARIOS_OFICIALES_BD.map((usuario) => [usuario.email, usuario])
  )
  let requiereNuevoLogin = false

  const usuariosNormalizados = estado.users.map((usuario) => {
    const oficial = oficialesPorCorreo.get(usuario.email)
    if (!oficial) return null
    if (estado.session === usuario.id && usuario.id !== oficial.id) {
      requiereNuevoLogin = true
    }
    return {
      ...usuario,
      name: oficial.name,
      email: oficial.email,
      pass: oficial.pass,
      codigo_saga: oficial.codigo_saga,
      role: oficial.role,
      semester: oficial.semester,
      id: oficial.id,
      backendId: usuario.backendId || null
    }
  }).filter(Boolean)

  estado.users = usuariosNormalizados

  if (requiereNuevoLogin || !estado.users.some((usuario) => usuario.id === estado.session)) {
    estado.session = null
  }
  return estado
}

let db = null
const subs = new Set()
const emit = () => subs.forEach((f) => f())

export const ready = idbGet(KEY)
  .then((v) => { db = normalizarEstadoPersistido(v || inicializarEstado()) })
  .catch(() => { db = inicializarEstado() })
  .then(emit)
export const getDB = () => db
export const useDB = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => db)

function commit(fn) {
  db = fn(structuredClone(db))
  idbSet(KEY, db).catch(() => {})
  emit()
}

export const act = {
  async login(email, pass) {
    const emailNorm = (email || '').trim().toLowerCase()
    const passNorm = (pass || '').trim().toUpperCase()

    // 1. Consulta directa a la API en Backend (PostgreSQL)
    try {
      const resApi = await apiLogin(emailNorm, passNorm)
      if (resApi.exito && resApi.datos?.usuario) {
        const u = resApi.datos.usuario
        commit((d) => {
          let existente = d.users.find((x) => x.email === u.email)
          if (!existente) {
            existente = {
              id: `local-${u.email}`,
              backendId: String(u.id),
              name: u.nombre,
              email: u.email,
              pass: passNorm,
              codigo_saga: u.codigo_saga || passNorm,
              role: u.rol,
              career: u.carrera || CAREER,
              semester: u.semestre || 8
            }
            d.users.push(existente)
          } else {
            existente.backendId = String(u.id)
            existente.email = u.email
            existente.name = u.nombre
            existente.role = u.rol
            existente.codigo_saga = u.codigo_saga
            existente.pass = passNorm
            existente.career = u.carrera || CAREER
            existente.semester = u.semestre || 8
          }
          d.session = existente.id
          return d
        })
        return null // Éxito
      }
    } catch (e) {
      console.warn('API no disponible, verificando en base de datos local predefinida:', e)
    }

    // 2. Consulta en la lista precargada de la BD institucional
    const encontrado = USUARIOS_OFICIALES_BD.find(
      (u) => u.email.toLowerCase() === emailNorm && u.codigo_saga.toUpperCase() === passNorm
    )

    if (encontrado) {
      commit((d) => {
        let existente = d.users.find((x) => x.email === encontrado.email)
        if (!existente) {
          existente = { ...encontrado, career: CAREER }
          d.users.push(existente)
        } else {
          existente.name = encontrado.name
          existente.email = encontrado.email
          existente.pass = encontrado.pass
          existente.codigo_saga = encontrado.codigo_saga
          existente.role = encontrado.role
          existente.semester = encontrado.semester
          existente.backendId = null
        }
        d.session = existente.id
        return d
      })
      return null // Éxito
    }

    return 'Correo institucional o código SAGA no registrado en la base de datos de la EMI.'
  },

  logout() {
    commit((d) => {
      d.session = null
      return d
    })
  }
}
