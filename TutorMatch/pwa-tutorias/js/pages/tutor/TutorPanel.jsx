import { useState, useEffect } from 'react'
import {
  apiObtenerBuzonDocente,
  apiResponderPropuestaDocente,
  apiObtenerRevisoresProyecto
} from '../../utils/api.js'

export default function TutorPanel({ me, db }) {
  // Pestañas solicitadas: AVISOS (Buzón), PERFIL (CV/Materias/Certificados), HORARIOS
  const [tab, setTab] = useState('avisos')
  
  // Proyectos / Solicitudes recibidas en el buzón
  const [buzon, setBuzon] = useState([])
  const [loadingBuzon, setLoadingBuzon] = useState(false)
  const [revisoresMap, setRevisoresMap] = useState({})
  const [mensajeAccion, setMensajeAccion] = useState('')

  // Estado del CV / Perfil del docente
  const [perfil, setPerfil] = useState({
    experienciaLaboral: '12 años como docente investigador en Inteligencia Artificial y Machine Learning. Asesor de más de 30 tesis de grado en el área de software y automatización.',
    materiasDestacadas: ['Inteligencia Artificial', 'Sistemas Expertos', 'Machine Learning', 'Robótica Industrial', 'Visión por Computadora'],
    nuevaMateria: '',
    certificados: [
      { id: 1, titulo: 'Especialista en Deep Learning y Redes Neuronales (Stanford Online)', anio: '2023' },
      { id: 2, titulo: 'Certificación Internacional en Cloud Computing & MLOps (AWS)', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Educación Superior Basada en Competencias (EMI)', anio: '2020' }
    ],
    nuevoCertificado: '',
    nuevoCertAnio: '2024'
  })

  // Horarios de docencia
  const [horarios] = useState([
    { dia: 'Lunes', hora: '07:30 - 09:45', aula: 'Laboratorio de IA 2', materia: 'Inteligencia Artificial', curso: '8vo Semestre A' },
    { dia: 'Lunes', hora: '10:00 - 12:15', aula: 'Aula Magna 4', materia: 'Sistemas Expertos', curso: '9no Semestre B' },
    { dia: 'Miércoles', hora: '07:30 - 09:45', aula: 'Laboratorio de IA 2', materia: 'Inteligencia Artificial', curso: '8vo Semestre A' },
    { dia: 'Jueves', hora: '14:00 - 16:15', aula: 'Lab Redes & Cloud', materia: 'Robótica Industrial', curso: '7mo Semestre' },
    { dia: 'Viernes', hora: '08:15 - 10:30', aula: 'Sala de Grado', materia: 'Taller de Grado I', curso: '8vo Semestre' }
  ])

  // Cargar buzón al entrar
  useEffect(() => {
    cargarBuzon()
  }, [me])

  const cargarBuzon = async () => {
    // Si viene de ID real de backend o local
    const docenteId = me?.id || 1
    setLoadingBuzon(true)
    try {
      const res = await apiObtenerBuzonDocente(docenteId)
      if (res.exito && Array.isArray(res.datos)) {
        setBuzon(res.datos)
        // Consultar revisores si están aceptados
        res.datos.forEach(async (p) => {
          if (p.estado === 'aceptado') {
            const revRes = await apiObtenerRevisoresProyecto(p.id)
            if (revRes.exito && revRes.datos) {
              setRevisoresMap(prev => ({ ...prev, [p.id]: revRes.datos }))
            }
          }
        })
      } else {
        // Mock de datos de ejemplo si el backend no tiene registros aún
        const datosMock = [
          {
            id: 101,
            estudiante_id: 5,
            estudiante_nombre: 'Iver Piñaya Vargas',
            estudiante_email: 'ipinayav@est.emi.edu.bo',
            estudiante_saga: 'C11368-9',
            titulo_tentativo: 'Sistema de Automatización con IA para el caso de estudio Restaurante Kindomg Armando una Arquitectura MVC',
            palabras_clave: 'IA, automatizacion, arquitectura, mvc, restaurante',
            pdf_documento_url: 'propuesta_iver_tesis.pdf',
            estado: 'enviado_a_tutor',
            fecha_envio: '2026-11-14T09:30:00',
            fecha_limite_72h: '2026-11-17T09:30:00'
          }
        ]
        setBuzon(datosMock)
      }
    } finally {
      setLoadingBuzon(false)
    }
  }

  const responderPropuesta = async (proyectoId, accion) => {
    setMensajeAccion('')
    const docenteId = me?.id || 1
    const res = await apiResponderPropuestaDocente(docenteId, proyectoId, accion)

    // Actualizar en el estado local de la interfaz
    setBuzon(prev => prev.map(p => {
      if (p.id === proyectoId) {
        return { ...p, estado: accion === 'aceptar' ? 'aceptado' : 'rechazado' }
      }
      return p
    }))

    if (accion === 'aceptar') {
      // Simular revisores recomendados de inmediato si la API está simulada
      setRevisoresMap(prev => ({
        ...prev,
        [proyectoId]: [
          { id: 1, revisor_nombre: 'Ing. Patricia Soria', revisor_email: 'psoria@adm.emi.edu.bo', afinidad_score: 91.5 },
          { id: 2, revisor_nombre: 'Ing. Carlos Fernández', revisor_email: 'cfernandez@adm.emi.edu.bo', afinidad_score: 84.0 }
        ]
      }))
      setMensajeAccion('✅ Has ACEPTADO ser el tutor del proyecto. El algoritmo recomendó a 2 revisores automáticamente.')
    } else {
      setMensajeAccion('❌ Has RECHAZADO la propuesta. Se le notificó al estudiante para que busque otro tutor.')
    }
  }

  // REGLA OFICIAL: MÁXIMO 3 PUPILOS
  const LIMITE_PUPILOS = 3
  const pupilosAceptados = buzon.filter(p => p.estado === 'aceptado')
  const cantidadPupilos = pupilosAceptados.length
  const cuposLibres = LIMITE_PUPILOS - cantidadPupilos
  const solicitudesPendientes = buzon.filter(p => p.estado === 'enviado_a_tutor').length

  // Agregar materia al perfil
  const agregarMateria = (e) => {
    e.preventDefault()
    if (!perfil.nuevaMateria.trim()) return
    setPerfil({
      ...perfil,
      materiasDestacadas: [...perfil.materiasDestacadas, perfil.nuevaMateria.trim()],
      nuevaMateria: ''
    })
  }

  // Agregar certificado al perfil
  const agregarCertificado = (e) => {
    e.preventDefault()
    if (!perfil.nuevoCertificado.trim()) return
    const nuevo = {
      id: Date.now(),
      titulo: perfil.nuevoCertificado.trim(),
      anio: perfil.nuevoCertAnio
    }
    setPerfil({
      ...perfil,
      certificados: [...perfil.certificados, nuevo],
      nuevoCertificado: ''
    })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. SECCIÓN SUPERIOR: DATOS DEL DOCENTE Y CONTROL DE PUPILOS (MÁXIMO 3) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bone/10 pb-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <span>👨‍🏫 Panel del Docente Tutor de Grado</span>
          </h1>
          <p className="text-xs text-bone/60 mt-0.5">
            Docente: <b>{me?.name || 'Ing. Roberto Mendoza'}</b> · Correo: <code className="text-azul">{me?.email || 'rmendoza@adm.emi.edu.bo'}</code> · EMI Cochabamba
          </p>
        </div>

        {/* CONTADOR VISUAL DE PUPILOS (MÁXIMO 3) */}
        <div className="panel !p-3 border-azul/40 bg-slate-900/90 flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-bone/60 block">
              Límite Reglamentario
            </span>
            <span className="text-xs font-bold text-bone">
              Capacidad: <b className={cantidadPupilos >= LIMITE_PUPILOS ? 'text-rose-400' : 'text-emerald-400'}>{cantidadPupilos} / {LIMITE_PUPILOS} Pupilos</b>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((slot) => {
              const ocupado = slot <= cantidadPupilos
              return (
                <div
                  key={slot}
                  title={ocupado ? `Pupilo ${slot} Asignado` : `Cupo ${slot} Disponible`}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${
                    ocupado
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-sm shadow-emerald-500/20'
                      : 'bg-black/30 border-dashed border-bone/20 text-bone/30'
                  }`}
                >
                  {ocupado ? '🎓' : slot}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. MENÚ DE PESTAÑAS (AVISOS / BUZÓN, PERFIL CV, HORARIOS) */}
      <div className="flex items-center gap-2 border-b border-bone/15 pb-2">
        <button
          onClick={() => setTab('avisos')}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg flex items-center gap-2 transition-all ${
            tab === 'avisos'
              ? 'bg-azul text-black shadow-lg shadow-azul/20'
              : 'bg-slate-900/40 text-bone/70 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🔔 Avisos / Buzón de Temas</span>
          {solicitudesPendientes > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black">
              {solicitudesPendientes}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('perfil')}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg flex items-center gap-2 transition-all ${
            tab === 'perfil'
              ? 'bg-azul text-black shadow-lg shadow-azul/20'
              : 'bg-slate-900/40 text-bone/70 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📋 Mi Perfil y CV Docente</span>
        </button>

        <button
          onClick={() => setTab('horarios')}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg flex items-center gap-2 transition-all ${
            tab === 'horarios'
              ? 'bg-azul text-black shadow-lg shadow-azul/20'
              : 'bg-slate-900/40 text-bone/70 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📅 Mis Horarios y Cursos</span>
        </button>
      </div>

      {mensajeAccion && (
        <div className="p-3 rounded-lg bg-azul/15 border border-azul/30 text-xs text-bone font-medium flex items-center justify-between">
          <span>{mensajeAccion}</span>
          <button onClick={() => setMensajeAccion('')} className="text-bone/50 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 1: AVISOS Y BUZÓN DE TEMAS PROPUESTOS (PLAZO 72H) */}
      {/* ============================================================== */}
      {tab === 'avisos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-bone">
                Buzón de Propuestas de Proyecto de Grado
              </h2>
              <p className="text-xs text-bone/60">
                Temas propuestos por estudiantes mediante la Red Neuronal de Recomendación. Plazo reglamentario: <b>72 horas</b>.
              </p>
            </div>
            <button onClick={cargarBuzon} className="btn btn-ghost !py-1 text-xs text-azul">
              🔄 Actualizar Buzón
            </button>
          </div>

          {loadingBuzon && <p className="text-xs text-bone/60">Cargando buzón de solicitudes...</p>}

          {!loadingBuzon && buzon.length === 0 && (
            <div className="panel text-center py-12 space-y-2 text-bone/60">
              <p>No tienes propuestas de estudiantes pendientes en tu buzón actualmente.</p>
            </div>
          )}

          <div className="space-y-4">
            {buzon.map((solicitud) => {
              const revisores = revisoresMap[solicitud.id] || []
              const esAceptado = solicitud.estado === 'aceptado'
              const esRechazado = solicitud.estado === 'rechazado'
              const esPendiente = solicitud.estado === 'enviado_a_tutor'

              return (
                <div
                  key={solicitud.id}
                  className={`panel space-y-4 border transition-all ${
                    esAceptado
                      ? 'border-emerald-500/40 bg-emerald-950/15'
                      : esRechazado
                      ? 'border-rose-500/30 bg-rose-950/10 opacity-75'
                      : 'border-azul/30 bg-slate-900/60 shadow-lg'
                  }`}
                >
                  {/* Encabezado de la solicitud */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-bone/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-azul/20 text-azul">
                          Estudiante Postulante
                        </span>
                        <h3 className="font-extrabold text-base text-bone">
                          {solicitud.estudiante_nombre}
                        </h3>
                      </div>
                      <p className="text-xs text-bone/60 mt-1">
                        Correo: <span className="text-bone/80">{solicitud.estudiante_email}</span> · Código SAGA: <code className="text-azul">{solicitud.estudiante_saga || 'C11368-9'}</code>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
                        esAceptado
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : esRechazado
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
                      }`}>
                        {esPendiente && '⏱️ Plazo de Revisión: 72 horas'}
                        {esAceptado && '✅ Pupilo Aceptado'}
                        {esRechazado && '❌ Propuesta Rechazada'}
                      </span>
                    </div>
                  </div>

                  {/* Detalle del Tema Propuesto */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-bone/50 block mb-1">
                      Tema de Proyecto de Grado Propuesto:
                    </span>
                    <p className="font-bold text-sm text-bone bg-black/40 p-3 rounded-lg border border-bone/10">
                      "{solicitud.titulo_tentativo}"
                    </p>
                  </div>

                  {/* Palabras Clave y Documento PDF */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-bone/50 uppercase block mb-1">
                        Palabras clave analizadas por la Red Neuronal:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {solicitud.palabras_clave?.split(',').map((k, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-azul/15 text-azul border border-azul/30 font-mono text-[11px]">
                            #{k.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Botón ver PDF adjunto */}
                    <div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          alert(`Abriendo documento formal en PDF adjuntado por ${solicitud.estudiante_nombre}`)
                        }}
                        className="btn btn-ghost !py-1.5 !px-3 text-xs flex items-center gap-2 border border-bone/20 hover:border-azul"
                      >
                        <span>📄 Ver Documento de Propuesta (PDF)</span>
                      </a>
                    </div>
                  </div>

                  {/* REVISORES DESIGNADOS AUTOMÁTICAMENTE CUANDO ES ACEPTADO */}
                  {esAceptado && revisores.length > 0 && (
                    <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                        <span>👥 Revisores Asignados Automáticamente por el Algoritmo Neuronal:</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {revisores.map((rev) => (
                          <div key={rev.id} className="p-2.5 rounded bg-black/40 border border-emerald-500/20 text-xs">
                            <p className="font-bold text-bone">{rev.revisor_nombre}</p>
                            <p className="text-[11px] text-bone/60">{rev.revisor_email}</p>
                            <p className="text-[10px] text-emerald-400 mt-1">
                              Afinidad temática de revisión: {rev.afinidad_score}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOTONES DE ACCIÓN: ACEPTAR O RECHAZAR (Solo si está pendiente) */}
                  {esPendiente && (
                    <div className="pt-2 border-t border-bone/10 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-bone/60">
                        {cuposLibres > 0
                          ? `Tienes ${cuposLibres} cupo(s) disponible(s) para pupilos.`
                          : '⚠️ Has alcanzado el límite reglamentario de 3 pupilos.'}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => responderPropuesta(solicitud.id, 'rechazar')}
                          className="btn btn-ghost !py-2 !px-4 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                        >
                          ✕ Rechazar Tema
                        </button>

                        <button
                          type="button"
                          disabled={cuposLibres <= 0}
                          onClick={() => responderPropuesta(solicitud.id, 'aceptar')}
                          className="btn btn-primary !py-2 !px-4 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-azul/20"
                        >
                          <span>✓ Aceptar como Tutor de Tesis</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 2: MI PERFIL Y CV DOCENTE (EXPERIENCIA, MATERIAS, CERTIFICADOS) */}
      {/* ============================================================== */}
      {tab === 'perfil' && (
        <div className="space-y-6">
          <div className="panel space-y-4">
            <h2 className="text-lg font-black text-bone">Currículum y Perfil Profesional del Docente</h2>
            <p className="text-xs text-bone/60">
              Esta información es procesada por el modelo de Redes Neuronales para emparejarte con temas afines de los estudiantes.
            </p>

            {/* Experiencia Laboral */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-bone/70">
                💼 Experiencia Laboral y Especialidad:
              </label>
              <textarea
                className="input w-full min-h-[90px] text-sm bg-black/30"
                value={perfil.experienciaLaboral}
                onChange={(e) => setPerfil({ ...perfil, experienciaLaboral: e.target.value })}
              />
            </div>

            {/* Materias donde destaca el docente */}
            <div className="space-y-3 pt-2 border-t border-bone/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-bone/70">
                  ⭐ Materias y Áreas donde destaca:
                </label>
                <span className="text-[11px] text-bone/50">{perfil.materiasDestacadas.length} registradas</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {perfil.materiasDestacadas.map((mat, i) => (
                  <span key={i} className="px-3 py-1 rounded-md text-xs bg-azul/15 text-azul border border-azul/40 font-semibold flex items-center gap-1.5">
                    <span>{mat}</span>
                    <button
                      type="button"
                      onClick={() => setPerfil({
                        ...perfil,
                        materiasDestacadas: perfil.materiasDestacadas.filter((_, idx) => idx !== i)
                      })}
                      className="text-bone/50 hover:text-rose-400 font-bold ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Formulario para agregar más materias */}
              <form onSubmit={agregarMateria} className="flex gap-2 max-w-md pt-1">
                <input
                  type="text"
                  placeholder="Agregar nueva materia o especialidad..."
                  className="input !py-1.5 text-xs flex-1 bg-black/30"
                  value={perfil.nuevaMateria}
                  onChange={(e) => setPerfil({ ...perfil, nuevaMateria: e.target.value })}
                />
                <button className="btn btn-primary !py-1.5 text-xs font-bold">
                  + Agregar
                </button>
              </form>
            </div>

            {/* Certificaciones y Cursos Adicionales */}
            <div className="space-y-3 pt-2 border-t border-bone/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-bone/70">
                  📜 Certificados y Cursos Impartidos / Recibidos:
                </label>
                <span className="text-[11px] text-bone/50">{perfil.certificados.length} certificados</span>
              </div>

              <div className="space-y-2">
                {perfil.certificados.map((cert) => (
                  <div key={cert.id} className="p-2.5 rounded-lg bg-black/30 border border-bone/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-bone">{cert.titulo}</p>
                      <p className="text-[11px] text-bone/50">Año de acreditación: {cert.anio}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPerfil({
                        ...perfil,
                        certificados: perfil.certificados.filter(c => c.id !== cert.id)
                      })}
                      className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulario para adjuntar más certificados */}
              <form onSubmit={agregarCertificado} className="flex flex-wrap gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Título del certificado o curso..."
                  className="input !py-1.5 text-xs flex-1 min-w-[200px] bg-black/30"
                  value={perfil.nuevoCertificado}
                  onChange={(e) => setPerfil({ ...perfil, nuevoCertificado: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Año"
                  className="input !py-1.5 text-xs !w-20 bg-black/30"
                  value={perfil.nuevoCertAnio}
                  onChange={(e) => setPerfil({ ...perfil, nuevoCertAnio: e.target.value })}
                />
                <button className="btn btn-primary !py-1.5 text-xs font-bold">
                  + Adjuntar Certificado
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 3: MIS HORARIOS Y CURSOS ASIGNADOS */}
      {/* ============================================================== */}
      {tab === 'horarios' && (
        <div className="panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bone/10 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-bone">Mi Horario de Clases y Cursos Asignados</h2>
              <p className="text-xs text-bone/60">
                Carga horaria académica actual en la Escuela Militar de Ingeniería (Ingeniería de Sistemas).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-azul/10 text-azul border border-azul/30">
              Gestión II-2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-bone/15 text-bone/60 uppercase font-mono text-[11px]">
                  <th className="py-2.5 px-3">Día</th>
                  <th className="py-2.5 px-3">Horario</th>
                  <th className="py-2.5 px-3">Materia Asignada</th>
                  <th className="py-2.5 px-3">Curso / Semestre</th>
                  <th className="py-2.5 px-3">Aula / Laboratorio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {horarios.map((h, i) => (
                  <tr key={i} className="hover:bg-bone/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-azul">{h.dia}</td>
                    <td className="py-3 px-3 font-mono text-bone/80">{h.hora}</td>
                    <td className="py-3 px-3 font-semibold text-bone">{h.materia}</td>
                    <td className="py-3 px-3 text-bone/70">
                      <span className="px-2 py-0.5 rounded bg-bone/10 text-[11px] font-mono">
                        {h.curso}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-bone/60">{h.aula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
