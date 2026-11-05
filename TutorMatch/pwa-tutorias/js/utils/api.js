// ==============================================================
// CLIENTE API REST: Conexión con el Backend en Python (FastAPI)
// ==============================================================
export const API_BASE_URL = 'http://localhost:8000/api/v1'

/**
 * Función genérica y básica para hacer peticiones fetch a la API.
 */
async function peticionApi(endpoint, metodo = 'GET', cuerpo = null) {
  try {
    const opciones = {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (cuerpo) {
      opciones.body = JSON.stringify(cuerpo)
    }

    const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, opciones)
    const datos = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(datos.detail || 'Error en la petición a la API')
    }

    return { exito: true, datos }
  } catch (error) {
    console.warn(`[API] Falló ${metodo} a ${endpoint}:`, error.message)
    return { exito: false, error: error.message }
  }
}

// --------------------------------------------------------------
// FUNCIONES DE USUARIOS Y AUTENTICACIÓN
// --------------------------------------------------------------
export async function apiLogin(email, password) {
  return await peticionApi('/auth/login', 'POST', { email, password })
}

export async function apiRegistro(datosUsuario) {
  return await peticionApi('/auth/registro', 'POST', datosUsuario)
}

export async function apiListarUsuarios() {
  return await peticionApi('/usuarios', 'GET')
}

// --------------------------------------------------------------
// FUNCIONES DE MATERIAS
// --------------------------------------------------------------
export async function apiListarMaterias() {
  return await peticionApi('/materias', 'GET')
}

export async function apiCrearMateria(datosMateria) {
  return await peticionApi('/materias', 'POST', datosMateria)
}

// --------------------------------------------------------------
// FUNCIONES DE TUTORÍAS / SOLICITUDES
// --------------------------------------------------------------
export async function apiListarSolicitudes() {
  return await peticionApi('/solicitudes', 'GET')
}

export async function apiCrearSolicitud(estudianteId, materiaId, observaciones = '') {
  return await peticionApi('/solicitudes', 'POST', {
    estudiante_id: estudianteId,
    materia_id: materiaId,
    observaciones: observaciones,
  })
}

export async function apiAsignarTutor(solicitudId, tutorId) {
  return await peticionApi(`/solicitudes/${solicitudId}/asignar`, 'PUT', {
    tutor_id: tutorId,
  })
}

// --------------------------------------------------------------
// FUNCIONES DEL ALGORITMO GENÉTICO (BACKEND)
// --------------------------------------------------------------
export async function apiSimularOptimizacion() {
  return await peticionApi('/optimizer/simular', 'POST')
}

export async function apiAplicarOptimizacion() {
  return await peticionApi('/optimizer/aplicar', 'POST')
}

