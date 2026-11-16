// ==============================================================
// CLIENTE API REST: TutorMatch — EMI Cochabamba
// ==============================================================
export const API_BASE_URL = 'http://localhost:8000/api/v1'
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '')

async function peticion(endpoint, metodo = 'GET', cuerpo = null, esFormData = false) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 1500) // 1.5 segundos máximo

  try {
    const opciones = { method: metodo, signal: controller.signal }
    
    if (cuerpo) {
      if (esFormData) {
        opciones.body = cuerpo // Fetch asigna el multipart header automáticamente
      } else {
        opciones.headers = { 'Content-Type': 'application/json' }
        opciones.body = JSON.stringify(cuerpo)
      }
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, opciones)
    clearTimeout(timeoutId)
    const datos = await res.json()
    if (!res.ok) throw new Error(datos.detail || 'Error en la petición')
    return { exito: true, datos }
  } catch (err) {
    clearTimeout(timeoutId)
    console.warn(`[API] Falló o tardó ${metodo} a ${endpoint}:`, err.message)
    return { exito: false, error: err.message }
  }
}

// --------------------------------------------------------------
// AUTENTICACIÓN INSTITUCIONAL (Correo EMI + Código SAGA)
// --------------------------------------------------------------
export async function apiLogin(email, codigoSaga) {
  return await peticion('/auth/login', 'POST', {
    email: email.trim().toLowerCase(),
    codigo_saga: codigoSaga.trim().toUpperCase()
  })
}

export async function apiRegistro(datos) {
  return await peticion('/auth/registro', 'POST', datos)
}

// --------------------------------------------------------------
// REDES NEURONALES / NLP: RECOMENDACIÓN POR TEMA
// --------------------------------------------------------------
export async function apiAnalizarTema(tituloProyecto) {
  return await peticion('/ia/analizar-tema', 'POST', {
    titulo_proyecto: tituloProyecto
  })
}

export async function apiRecomendarRevisores(tituloProyecto, tutorId) {
  return await peticion(`/ia/recomendar-revisores?titulo=${encodeURIComponent(tituloProyecto)}&tutor_id=${tutorId}`)
}

export async function apiObtenerDocentes() {
  return await peticion('/docentes')
}

// --------------------------------------------------------------
// PROPUESTAS DE PROYECTO (Envío con PDF y plazo 72h)
// --------------------------------------------------------------
export async function apiEnviarPropuesta({ estudianteId, docenteTutorIds, tituloTentativo, archivoPdf }) {
  const formData = new FormData()
  formData.append('estudiante_id', estudianteId)
  formData.append('docente_tutor_ids', docenteTutorIds.join(','))
  formData.append('titulo_tentativo', tituloTentativo)
  formData.append('archivo_pdf', archivoPdf)

  return await peticion('/proyectos/enviar', 'POST', formData, true)
}

export async function apiListarProyectosEstudiante(estudianteId) {
  return await peticion(`/proyectos/estudiante/${estudianteId}`)
}

// --------------------------------------------------------------
// BUZÓN DOCENTE (Aceptar / Rechazar propuesta)
// --------------------------------------------------------------
export async function apiObtenerBuzonDocente(docenteId) {
  return await peticion(`/docentes/${docenteId}/buzon`)
}

export async function apiResponderPropuestaDocente(docenteId, proyectoId, accion, observacion = '') {
  return await peticion(`/docentes/${docenteId}/proyectos/${proyectoId}/responder`, 'POST', {
    accion,
    observacion
  })
}

export async function apiObtenerRevisoresProyecto(proyectoId) {
  return await peticion(`/proyectos/${proyectoId}/revisores`)
}

export async function apiListarNotificaciones(usuarioId) {
  return await peticion(`/usuarios/${usuarioId}/notificaciones`)
}

export async function apiMarcarNotificacionLeida(usuarioId, notificacionId) {
  return await peticion(`/usuarios/${usuarioId}/notificaciones/${notificacionId}/leida`, 'PATCH')
}

// --------------------------------------------------------------
// ACTUALIZACIÓN DEL PERFIL DOCENTE (ESPECIALIDADES Y CURSOS EN BD)
// --------------------------------------------------------------
export async function apiActualizarPerfilDocente(docenteId, especialidades, cursos = '') {
  return await peticion(`/docentes/${docenteId}/perfil`, 'PUT', {
    especialidades: Array.isArray(especialidades) ? especialidades.join(', ') : especialidades,
    cursos_dictados: Array.isArray(cursos) ? cursos.join(', ') : cursos
  })
}
