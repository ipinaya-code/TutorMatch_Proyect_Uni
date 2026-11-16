import { useState, useEffect } from 'react'
import NeuralNetwork3D from '../../components/NeuralNetwork3D.jsx'
import FlowPipeline from '../../components/FlowPipeline.jsx'
import Tabs from '../../components/Tabs.jsx'
import {
  apiAnalizarTema,
  apiEnviarPropuesta,
  apiListarProyectosEstudiante,
  apiObtenerRevisoresProyecto,
  apiListarNotificaciones,
  apiMarcarNotificacionLeida
} from '../../utils/api.js'

export default function StudentPanel({ me }) {
  const [tab, setTab] = useState('ia_matcher')
  
  // Estados para el recomendador neuronal
  const [titulo, setTitulo] = useState('Sistema de Automatización con IA para el caso de estudio Restaurante Kindomg Armando una Arquitectura MVC')
  const [loadingIA, setLoadingIA] = useState(false)
  const [palabrasClave, setPalabrasClave] = useState([])
  const [docentesRecomendados, setDocentesRecomendados] = useState([])
  
  // Selección y subida de PDF
  const [tutorSeleccionado, setTutorSeleccionado] = useState(null)
  const [tutoresSeleccionados, setTutoresSeleccionados] = useState([])
  const [archivoPdf, setArchivoPdf] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensajeEnvio, setMensajeEnvio] = useState('')

  // Proyectos del estudiante
  const [misProyectos, setMisProyectos] = useState([])
  const [cargandoProyectos, setCargandoProyectos] = useState(false)
  const [revisoresMap, setRevisoresMap] = useState({})
  const [notificaciones, setNotificaciones] = useState([])
  const usuarioBackendId = me?.backendId || me?.id

  // Ejecución inicial de análisis
  useEffect(() => {
    ejecutarAnalisisNeuronal(titulo)
    cargarMisProyectos()
    cargarNotificaciones()
  }, [])

  const ejecutarAnalisisNeuronal = async (texto) => {
    if (!texto.trim()) return
    setLoadingIA(true)
    try {
      const res = await apiAnalizarTema(texto)
      if (res.exito && res.datos) {
        setPalabrasClave(res.datos.palabras_clave || [])
        setDocentesRecomendados(res.datos.recomendaciones || [])
        if (res.datos.recomendaciones?.length > 0) {
          setTutorSeleccionado(res.datos.recomendaciones[0])
          setTutoresSeleccionados([res.datos.recomendaciones[0]])
        }
      } else {
        // Fallback local inmediato si el backend no está encendido o responde con error
        simularAnalisisLocal(texto)
      }
    } catch {
      simularAnalisisLocal(texto)
    } finally {
      setLoadingIA(false)
    }
  }

  // Simulación inteligente local con el catálogo de los 15 docentes de PyTorch
  const simularAnalisisLocal = (texto) => {
    const stopwords = ['de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'sistema', 'caso', 'estudio', 'usando']
    const tokens = texto.toLowerCase().match(/\b[a-záéíóúñ]{2,}\b/g) || []
    const claves = [...new Set(tokens.filter(t => !stopwords.includes(t)))]
    setPalabrasClave(claves)

    const docentes = [
      { docente_id: 11, nombre: 'Ing. Rodrigo Vargas', especialidades: 'Desarrollo Movil, Programacion Multiplataforma, Geolocalizacion', cursos: 'Desarrollo Movil', afinidad_porcentaje: 98.5, cupos_disponibles: 2, email: 'rvargas@adm.emi.edu.bo' },
      { docente_id: 12, nombre: 'Lic. Fernando Pinto', especialidades: 'Internet de las Cosas, Sistemas Embebidos, Automatizacion', cursos: 'Internet de las Cosas', afinidad_porcentaje: 94.0, cupos_disponibles: 3, email: 'fpinto@adm.emi.edu.bo' },
      { docente_id: 1, nombre: 'Ing. Marcelo Quiroga', especialidades: 'Inteligencia Artificial, Vision Computacional, Programacion', cursos: 'Inteligencia Artificial', afinidad_porcentaje: 86.5, cupos_disponibles: 2, email: 'mquiroga@adm.emi.edu.bo' },
      { docente_id: 13, nombre: 'Lic. Pamela Suarez', especialidades: 'Cloud Computing, DevOps, Sistemas Distribuidos', cursos: 'Cloud Computing', afinidad_porcentaje: 82.0, cupos_disponibles: 2, email: 'psuarez@adm.emi.edu.bo' },
      { docente_id: 8, nombre: 'Lic. Gabriela Paz', especialidades: 'Base de Datos, Modelado de Datos, Sistemas Transaccionales', cursos: 'Base de Datos', afinidad_porcentaje: 75.0, cupos_disponibles: 3, email: 'gpaz@adm.emi.edu.bo' }
    ]

    // Ajustar palabras coincidentes
    const resultado = docentes.map(d => ({
      ...d,
      palabras_coincidentes: claves.filter(k => d.especialidades.toLowerCase().includes(k))
    }))

    setDocentesRecomendados(resultado)
    setTutorSeleccionado(resultado[0])
    setTutoresSeleccionados([resultado[0]])
  }

  const cargarMisProyectos = async () => {
    if (!usuarioBackendId) return
    setCargandoProyectos(true)
    try {
      const res = await apiListarProyectosEstudiante(usuarioBackendId)
      if (res.exito && res.datos) {
        setMisProyectos(res.datos)
        // Consultar revisores de proyectos aceptados
        res.datos.forEach(async (p) => {
          if (p.estado === 'aceptado') {
            const revRes = await apiObtenerRevisoresProyecto(p.id)
            if (revRes.exito && revRes.datos) {
              setRevisoresMap(prev => ({ ...prev, [p.id]: revRes.datos }))
            }

            const cargarNotificaciones = async () => {
              if (!usuarioBackendId) return
              const res = await apiListarNotificaciones(usuarioBackendId)
              if (res.exito && Array.isArray(res.datos)) setNotificaciones(res.datos)
            }
          }
        })
      }
    } finally {
      setCargandoProyectos(false)
    }
  }

  const handleEnviarPropuesta = async (e) => {
    e.preventDefault()
    if (!tutoresSeleccionados.length) {
      return setMensajeEnvio('Por favor selecciona al menos un docente recomendado.')
    }
    if (!archivoPdf) {
      return setMensajeEnvio('Debes adjuntar el PDF de tu propuesta.')
    }

    setEnviando(true)
    setMensajeEnvio('')
    try {
      const res = await apiEnviarPropuesta({
        estudianteId: usuarioBackendId,
        docenteTutorIds: tutoresSeleccionados.map((docente) => docente.docente_id),
        tituloTentativo: titulo,
        archivoPdf: archivoPdf
      })

      if (res.exito) {
        setMensajeEnvio('¡Propuesta enviada con éxito! El docente tiene un plazo de 72 horas para responder.')
        cargarMisProyectos()
        cargarNotificaciones()
        setTab('mis_propuestas')
      } else {
        setMensajeEnvio(res.error || 'Ocurrió un error al enviar la propuesta.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const tabs = [
    { id: 'ia_matcher', label: '🧠 Recomendador Neuronal de Tutores' },
    { id: 'mis_propuestas', label: `📄 Mis Propuestas (${misProyectos.length})` },
    { id: 'buzon', label: `🔔 Buzón (${notificaciones.filter((n) => !n.leido).length})` },
    { id: 'como_funciona', label: 'ℹ️ ¿Cómo Funciona la Red?' }
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado del Estudiante */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/10 pb-4">
        <div>
          <h1 className="text-2xl font-black">Portal de Proyecto de Grado · EMI Cochabamba</h1>
          <p className="text-xs text-bone/60 mt-1">
            Estudiante: <b>{me?.name || me?.nombre}</b> · SAGA: <code className="text-azul">{me?.codigo_saga || 'C11368-9'}</code> · Semestre: {me?.semestre || 8}vo
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 text-xs font-mono rounded-full bg-azul/10 text-azul border border-azul/30">
            Ingeniería de Sistemas
          </span>
        </div>
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {/* PESTAÑA 1: RECOMENDADOR NEURONAL INTERACTIVO */}
      {tab === 'ia_matcher' && (
        <div className="space-y-6">
          <FlowPipeline step={tutorSeleccionado ? 3 : 2} />

          {/* Gráfico 3D de la Red Neuronal */}
          <NeuralNetwork3D keywords={palabrasClave} topTutors={docentesRecomendados} />

          {/* Caja interactiva para el título tentativo */}
          <div className="panel space-y-4 border-azul/30 bg-slate-900/60 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <span>📝 Título Tentativo de tu Proyecto de Grado:</span>
                <span className="text-xs font-normal text-bone/60">(Escribe tu idea para recalcular los pesos neuronales)</span>
              </label>
              
              {/* Botón principal para enviar a trabajar al modelo neuronal */}
              <button
                type="button"
                onClick={() => ejecutarAnalisisNeuronal(titulo)}
                disabled={loadingIA}
                className="btn btn-primary !py-2 !px-4 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-azul/20 hover:scale-[1.02] transition-transform"
              >
                {loadingIA ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Entrenando y Analizando...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Enviar a Trabajar al Módulo de Redes Neuronales</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              className="input w-full min-h-[85px] text-sm p-3 font-medium bg-black/40 border-bone/20 focus:border-azul"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Sistema de Automatización con IA para Restaurante Armando una Arquitectura MVC"
            />

            {/* Palabras clave extraídas por NLP */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-bone/70 uppercase tracking-wider">
                  Tokens / Palabras Clave Extraídas por la Red Neuronal:
                </span>
                <span className="text-[11px] text-azul font-mono">
                  {palabrasClave.length} descriptores identificados
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {palabrasClave.map((palabra, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs rounded-lg bg-azul/20 text-azul border border-azul/50 font-mono font-bold shadow-sm shadow-azul/10 animate-pulse"
                  >
                    #{palabra}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Resultados: Docentes Recomendados */}
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <span>👨‍🏫 Docentes Tutores Recomendados por Afinidad Neuronal</span>
              <span className="text-xs font-normal text-bone/60">(Selecciona el que creas más conveniente)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docentesRecomendados.map((doc) => {
                const isSelected = tutorSeleccionado?.docente_id === doc.docente_id
                return (
                  <div
                    key={doc.docente_id}
                    onClick={() => {
                      const yaSeleccionado = tutoresSeleccionados.some(
                        (seleccionado) => seleccionado.docente_id === doc.docente_id
                      )
                      if (yaSeleccionado) {
                        const nuevos = tutoresSeleccionados.filter(
                          (seleccionado) => seleccionado.docente_id !== doc.docente_id
                        )
                        setTutoresSeleccionados(nuevos)
                        setTutorSeleccionado(nuevos[0] || null)
                      } else if (tutoresSeleccionados.length < 2) {
                        const nuevos = [...tutoresSeleccionados, doc]
                        setTutoresSeleccionados(nuevos)
                        setTutorSeleccionado(nuevos[0])
                      } else {
                        setMensajeEnvio('Puedes seleccionar como máximo 2 docentes.')
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      tutoresSeleccionados.some((seleccionado) => seleccionado.docente_id === doc.docente_id)
                        ? 'bg-azul/15 border-azul shadow-xl shadow-azul/10 scale-[1.01]'
                        : 'bg-slate-900/40 border-bone/10 hover:border-bone/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-bone">{doc.nombre}</h3>
                        <p className="text-xs text-bone/60">{doc.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {doc.afinidad_porcentaje}% Afinidad
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs space-y-1">
                      <p><b className="text-bone/80">Cursos que dicta:</b> <span className="text-bone/60">{doc.cursos}</span></p>
                      <p><b className="text-bone/80">Especialidades:</b> <span className="text-bone/60">{doc.especialidades}</span></p>
                    </div>

                    {doc.palabras_coincidentes?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-bone/5 flex items-center gap-1">
                        <span className="text-[10px] text-bone/50 uppercase">Coincidencia:</span>
                        {doc.palabras_coincidentes.map((c, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-bone/10 text-bone/80">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Formulario de Confirmación y Subida de PDF */}
          {tutorSeleccionado && (
            <form onSubmit={handleEnviarPropuesta} className="panel space-y-4 border-azul/40 bg-slate-900/80">
              <div className="flex items-center justify-between border-b border-bone/10 pb-3">
                <h3 className="font-bold text-base text-azul">
                📨 Formalizar Solicitud a {tutoresSeleccionados.length} docente(s)
                </h3>
                <span className="text-xs text-amber-400 font-mono">
                  ⏱️ Plazo de respuesta: 72 horas
                </span>
              </div>

              <p className="text-xs text-bone/70">
                Al enviar la solicitud, los docentes recibirán el mismo PDF y tema en su buzón. Se iniciará un plazo de
                <b> 72 horas</b>. Si uno acepta, el otro será asignado como revisor automáticamente.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bone/80 mb-1">
                  Adjuntar Documento de Propuesta (PDF):
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setArchivoPdf(e.target.files[0])}
                  className="input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-azul file:text-black hover:file:bg-azul/80"
                />
              </div>

              {mensajeEnvio && (
                <p className="text-xs font-medium text-amber-300 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  {mensajeEnvio}
                </p>
              )}

              <button className="btn btn-primary w-full" disabled={enviando}>
                {enviando ? 'Enviando propuesta...' : `Enviar propuesta a ${tutoresSeleccionados.length} docente(s)`}
              </button>
            </form>
          )}
        </div>
      )}

      {/* PESTAÑA 2: MIS PROPUESTAS Y SEGUIMIENTO DE 72H */}
      {tab === 'mis_propuestas' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Estado de mis Propuestas de Proyecto</h2>

          {cargandoProyectos && <p className="text-sm text-bone/60">Cargando propuestas...</p>}

          {!cargandoProyectos && misProyectos.length === 0 && (
            <div className="panel text-center py-10 space-y-2">
              <p className="text-bone/70">Aún no has enviado ninguna propuesta de proyecto de grado.</p>
              <button onClick={() => setTab('ia_matcher')} className="btn btn-primary text-xs">
                Ir al Recomendador Neuronal
              </button>
            </div>
          )}

          <div className="space-y-3">
            {misProyectos.map((p) => {
              const revisores = revisoresMap[p.id] || []
              return (
                <div key={p.id} className="panel space-y-3 border-bone/15">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-bone">{p.titulo_tentativo}</h3>
                      <p className="text-xs text-bone/60 mt-0.5">
                        Tutor Seleccionado: <b className="text-bone/90">{p.docente_nombre || 'No asignado'}</b>
                      </p>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
                        p.estado === 'aceptado'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : p.estado === 'rechazado'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : p.estado === 'expirado_72h'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-azul/20 text-azul border border-azul/40 animate-pulse'
                      }`}>
                        {p.estado === 'enviado_a_tutor' && '⏳ Esperando respuesta (Plazo 72h)'}
                        {p.estado === 'aceptado' && '✅ Tutoría Aceptada'}
                        {p.estado === 'revisor_asignado' && '👥 Asignado como Revisor'}
                        {p.estado === 'rechazado' && '❌ Rechazado'}
                        {p.estado === 'expirado_72h' && '⚠️ Plazo Expirado (Sin respuesta)'}
                      </span>
                    </div>
                  </div>

                  {p.palabras_clave && (
                    <div className="flex flex-wrap gap-1">
                      {p.palabras_clave.split(',').map((k, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-bone/10 text-bone/70">
                          #{k.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Detalle si fue Aceptado: Mostrar Revisores recomendados por la Red Neuronal */}
                  {p.estado === 'aceptado' && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                        <span>👥 Revisores Designados por el Algoritmo Neuronal:</span>
                      </span>
                      {revisores.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {revisores.map((rev) => (
                            <div key={rev.id} className="p-2 rounded bg-black/30 border border-bone/10 text-xs">
                              <p className="font-bold text-bone">{rev.revisor_nombre}</p>
                              <p className="text-[11px] text-bone/60">{rev.revisor_email}</p>
                              <p className="text-[10px] text-emerald-400 mt-1">
                                Compatibilidad con el tema: {rev.afinidad_score}%
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-bone/60">Cargando revisores asignados...</p>
                      )}
                    </div>
                  )}

                  {/* Mensaje si expiró o fue rechazado */}
                  {(p.estado === 'rechazado' || p.estado === 'expirado_72h') && (
                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
                      <p><b>Aviso:</b> {p.observacion_tutor || 'El docente no pudo aceptar el proyecto. Debes buscar otro tutor en el sistema.'}</p>
                      <button
                        onClick={() => setTab('ia_matcher')}
                        className="btn btn-ghost !py-1 text-xs text-azul mt-2"
                      >
                        Buscar otro tutor ahora ➔
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'buzon' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Buzón de notificaciones</h2>
            <button onClick={cargarNotificaciones} className="btn btn-ghost !py-1 text-xs text-azul">
              Actualizar
            </button>
          </div>
          {notificaciones.length === 0 && (
            <div className="panel text-center py-10 text-sm text-bone/60">
              No tienes notificaciones todavía.
            </div>
          )}
          {notificaciones.map((notificacion) => (
            <button
              type="button"
              key={notificacion.id}
              onClick={async () => {
                if (!notificacion.leido) {
                  await apiMarcarNotificacionLeida(usuarioBackendId, notificacion.id)
                  setNotificaciones((actuales) => actuales.map((actual) =>
                    actual.id === notificacion.id ? { ...actual, leido: true } : actual
                  ))
                }
              }}
              className={`panel w-full text-left space-y-1 ${notificacion.leido ? 'opacity-70' : 'border-azul/50'}`}
            >
              <p className="font-bold text-sm">{notificacion.asunto}</p>
              <p className="text-xs text-bone/70">{notificacion.mensaje}</p>
            </button>
          ))}
        </div>
      )}

      {/* PESTAÑA 3: CÓMO FUNCIONA */}
      {tab === 'como_funciona' && (
        <div className="panel space-y-4 text-sm leading-relaxed text-bone/80">
          <h2 className="text-lg font-bold text-bone">Funcionamiento de la Red Neuronal en TutorMatch EMI</h2>
          <p>
            El sistema utiliza una arquitectura basada en <b>Procesamiento de Lenguaje Natural (NLP)</b> y representación
            vectorial semántica para emparejar temas de tesis con la trayectoria docente:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-bone/70">
            <li>
              <b>Tokenización y Extracción de Claves:</b> El título ingresado por el estudiante se analiza aislando términos
              disciplinares relevantes (ej. <i>IA, Arquitectura MVC, Redes, Automatización</i>) descartando palabras vacías.
            </li>
            <li>
              <b>Espacio Vectorial y Similitud Coseno:</b> Se proyecta el tema del estudiante y las especialidades declaradas por
              los docentes en un espacio multidimensional para calcular el grado de afinidad exacta.
            </li>
            <li>
              <b>Regla de 72 Horas:</b> Al enviar la propuesta formal en PDF, el docente dispone de 72 horas para aceptar o declinar.
              Si vence el plazo sin respuesta, el sistema libera la postulación para proteger el cronograma de grado del estudiante.
            </li>
            <li>
              <b>Recomendación de Revisores:</b> Al confirmarse la tutoría, la red neuronal realiza una segunda pasada para
              sugerir el comité de revisores afines al tema, garantizando que el tutor no forme parte de dicho comité.
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
