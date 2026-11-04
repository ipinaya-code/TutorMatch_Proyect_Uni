export const NAV = [
  { id: 'problemas', label: 'Problema' },
  { id: 'motor', label: 'Motor genético' },
  { id: 'objetivos', label: 'Objetivos' },
]

export const PROBLEMS = [
  { t: 'Abandono por choque de horarios', d: 'Si tutor y estudiante no coinciden, el estudiante se desmotiva y deja el programa.', c: 'text-ambar' },
  { t: 'Coordinadores con semanas de planilla', d: 'Cruzar disponibilidades a mano toma semanas y produce errores de asignación.', c: 'text-cian' },
  { t: 'Agendas que no abren con mala señal', d: 'Los portales pesados exigen buena conexión; en el campus no siempre la hay.', c: 'text-viol' },
]

export const OBJECTIVES = [
  { v: 'Modelar', d: 'las restricciones clave: disponibilidad horaria, materias aprobadas y cupos.', a: 'Formalización matemática de variables' },
  { v: 'Implementar', d: 'un algoritmo genético que genere parejas tutor-estudiante y cronogramas.', a: 'Motor de optimización combinatoria' },
  { v: 'Configurar', d: 'la PWA con enfoque Offline-First para ver agendas sin conexión.', a: 'Service Workers e IndexedDB' },
  { v: 'Construir', d: 'una API segura para gestionar los datos académicos.', a: 'Servicios, controladores y persistencia' },
  { v: 'Evaluar', d: 'el rendimiento del algoritmo y la satisfacción de los usuarios.', a: 'Pruebas piloto y métricas de usabilidad' },
]

export const SUBJECTS = ['Cálculo I', 'Álgebra Lineal', 'Física I', 'Programación I', 'Estadística']
export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
export const HOURS = ['8:00', '10:00', '14:00', '16:00']
export const slotLabel = (s) => `${DAYS[Math.floor(s / 4)]} ${HOURS[s % 4]}`
