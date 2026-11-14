export const NAV = [
  { id: 'problemas', label: 'El Problema' },
  { id: 'motor', label: 'Redes Neuronales' },
  { id: 'objetivos', label: 'Objetivos' },
]

export const PROBLEMS = [
  { 
    t: 'Dificultad para encontrar un docente apto al tema', 
    d: 'Los estudiantes de 8vo y 9no semestre presentan temas innovadores (IA, Cloud, Seguridad) pero terminan asignados a docentes que no dominan esa área específica.', 
    c: 'text-oro' 
  },
  { 
    t: 'Riesgo de mal asesoramiento y retraso de tesis', 
    d: 'Cuando el tema de grado no es el fuerte del docente tutor, se generan observaciones tardías, frustración académica y retrasos en la titulación.', 
    c: 'text-azul' 
  },
  { 
    t: 'Falta de designación idónea de tribunales revisores', 
    d: 'Al aprobarse el proyecto, los revisores asignados a menudo no tienen afinidad técnica con el tema, prolongando las correcciones.', 
    c: 'text-cielo' 
  },
]

export const OBJECTIVES = [
  { 
    v: 'Analizar', 
    d: 'los títulos y propuestas tentativas mediante Procesamiento de Lenguaje Natural (NLP).', 
    a: 'Extracción semántica de palabras clave y tecnologías involucradas.' 
  },
  { 
    v: 'Recomendar', 
    d: 'al docente tutor idóneo utilizando Redes Neuronales y cálculo de afinidad temática.', 
    a: 'Cotejo vectorial con especialidades, cursos dictados y trayectoria docente.' 
  },
  { 
    v: 'Gestionar', 
    d: 'el plazo formal de 72 horas para la aceptación o declinación con documento PDF adjunto.', 
    a: 'Buzón docente con control de expiración automática y notificación.' 
  },
  { 
    v: 'Designar', 
    d: 'automáticamente al comité de Revisores afines al tema en cuanto el tutor acepta el proyecto.', 
    a: 'Garantía de idoneidad técnica en el tribunal de grado.' 
  },
  { 
    v: 'Optimizar', 
    d: 'la carga académica limitando a un máximo de 3 pupilos activos por tutor.', 
    a: 'Reglamento de titulación de Ingeniería de Sistemas — EMI Cochabamba.' 
  },
]

export const SUBJECTS = ['Inteligencia Artificial', 'Arquitectura de Software', 'Seguridad Informática', 'Bases de Datos', 'Desarrollo Web']
export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
export const HOURS = ['7:30', '9:45', '14:00', '16:15']
export const slotLabel = (s) => `${DAYS[Math.floor(s / 4)]} ${HOURS[s % 4]}`
export const ALL_SLOTS = Array.from({ length: 20 }, (_, i) => i)
