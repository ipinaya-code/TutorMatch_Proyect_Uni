from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import shutil
import os

from conexion import probar_conexion
from servicios.usuarios import (
    verificar_credenciales_saga, 
    registrar_usuario, 
    listar_docentes_con_perfil,
    actualizar_especialidades_docente
)
from servicios.recomendador_neuronal import (
    extraer_palabras_clave, 
    recomendar_tutores_por_tema, 
    recomendar_revisores_por_tema
)
from servicios.proyectos import (
    crear_propuesta_proyecto,
    listar_proyectos_de_estudiante,
    buzon_proyectos_docente,
    responder_propuesta_docente,
    obtener_revisores_de_proyecto,
    listar_notificaciones,
    marcar_notificacion_leida
)

# Inicialización de la API
app = FastAPI(
    title="TutorMatch API — EMI Cochabamba",
    description="Sistema Recomendador con Redes Neuronales de Tutores y Revisores para Proyectos de Grado",
    version="2.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carpeta para almacenar los PDFs de las propuestas
UPLOADS_DIR = "uploads_propuestas"
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# ----------------------------------------------------------------
# MODELOS DE ENTRADA (Pydantic)
# ----------------------------------------------------------------
class LoginSagaRequest(BaseModel):
    email: str          # ej: ipinayav@est.emi.edu.bo
    codigo_saga: str    # ej: C11368-9

class RegistroUsuarioRequest(BaseModel):
    nombre: str
    email: str
    codigo_saga: str
    rol: str            # 'estudiante' o 'docente'
    semestre: Optional[int] = 8

class RecomendarTutoresRequest(BaseModel):
    titulo_proyecto: str

class PerfilDocenteRequest(BaseModel):
    cursos_dictados: str
    especialidades: str

class ResponderPropuestaRequest(BaseModel):
    accion: str         # 'aceptar' o 'rechazar'
    observacion: Optional[str] = ""

# ----------------------------------------------------------------
# ENDPOINTS GENERALES
# ----------------------------------------------------------------
@app.get("/")
def ruta_principal():
    return {
        "sistema": "TutorMatch — EMI Cochabamba (Ingeniería de Sistemas)",
        "descripcion": "Recomendación de Tutores y Revisores de Proyectos de Grado con Redes Neuronales",
        "docs": "/docs"
    }

@app.get("/api/v1/health")
def salud():
    exito, mensaje = probar_conexion()
    return {"api": "OK", "base_de_datos": mensaje, "conectado": exito}

# ----------------------------------------------------------------
# ENDPOINTS DE AUTENTICACIÓN INSTITUCIONAL
# ----------------------------------------------------------------
@app.post("/api/v1/auth/login")
def login(datos: LoginSagaRequest):
    """
    Login con correo institucional y código SAGA.
    """
    usuario = verificar_credenciales_saga(datos.email, datos.codigo_saga)
    if not usuario:
        raise HTTPException(
            status_code=401, 
            detail="Credenciales inválidas. Revisa tu correo institucional o tu código SAGA."
        )
    return {"mensaje": "Acceso concedido", "usuario": usuario}

@app.post("/api/v1/auth/registro")
def registro(datos: RegistroUsuarioRequest):
    try:
        nuevo = registrar_usuario(
            nombre=datos.nombre,
            email=datos.email,
            codigo_saga=datos.codigo_saga,
            rol=datos.rol,
            semestre=datos.semestre or 8
        )
        return {"mensaje": "Usuario registrado exitosamente", "usuario": nuevo}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en registro: {str(e)}")

# ----------------------------------------------------------------
# ENDPOINTS DE DOCENTES Y PERFIL
# ----------------------------------------------------------------
@app.get("/api/v1/docentes")
def obtener_docentes():
    return listar_docentes_con_perfil()

@app.put("/api/v1/docentes/{docente_id}/perfil")
def actualizar_perfil(docente_id: int, datos: PerfilDocenteRequest):
    actualizado = actualizar_especialidades_docente(
        docente_id=docente_id,
        cursos=datos.cursos_dictados,
        especialidades=datos.especialidades
    )
    return {"mensaje": "Perfil docente actualizado", "perfil": actualizado}

# ----------------------------------------------------------------
# ENDPOINTS DEL MOTOR DE REDES NEURONALES / NLP
# ----------------------------------------------------------------
@app.post("/api/v1/ia/analizar-tema")
def analizar_tema(datos: RecomendarTutoresRequest):
    """
    Extrae palabras clave y recomienda tutores ordenados por afinidad.
    """
    resultado = recomendar_tutores_por_tema(datos.titulo_proyecto)
    return resultado

@app.get("/api/v1/ia/recomendar-revisores")
def obtener_revisores_recomendados(titulo: str, tutor_id: int):
    """
    Recomienda revisores afines al tema excluyendo al docente tutor.
    """
    return recomendar_revisores_por_tema(titulo, tutor_id)

# ----------------------------------------------------------------
# ENDPOINTS DE PROPUESTAS DE PROYECTO (ESTUDIANTES Y BUZÓN DOCENTE)
# ----------------------------------------------------------------
@app.post("/api/v1/proyectos/enviar")
async def enviar_propuesta_proyecto(
    estudiante_id: int = Form(...),
    docente_tutor_ids: Optional[str] = Form(None),
    docente_tutor_id: Optional[int] = Form(None),
    titulo_tentativo: str = Form(...),
    archivo_pdf: UploadFile = File(...)
):
    """
    El estudiante selecciona al docente recomendado y sube su PDF.
    Se activa el plazo de 72 horas para respuesta del tutor.
    """
    if archivo_pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF.")

    pdf_url = ""
    if archivo_pdf:
        nombre_guardado = f"propuesta_est_{estudiante_id}_{archivo_pdf.filename}"
        ruta_completa = os.path.join(UPLOADS_DIR, nombre_guardado)
        with open(ruta_completa, "wb") as buffer:
            shutil.copyfileobj(archivo_pdf.file, buffer)
        pdf_url = f"/uploads/{nombre_guardado}"

    ids = []
    if docente_tutor_ids:
        try:
            ids = [int(valor) for valor in docente_tutor_ids.split(",") if valor.strip()]
        except ValueError as error:
            raise HTTPException(status_code=400, detail="Los docentes seleccionados no son válidos.") from error
    elif docente_tutor_id is not None:
        ids = [docente_tutor_id]

    try:
        proyectos = crear_propuesta_proyecto(
            estudiante_id=estudiante_id,
            titulo_tentativo=titulo_tentativo,
            docente_tutor_ids=ids,
            pdf_url=pdf_url
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return {
        "mensaje": "Propuesta enviada a los docentes seleccionados. Plazo de respuesta: 72 horas.",
        "proyectos": proyectos
    }

@app.get("/api/v1/proyectos/estudiante/{estudiante_id}")
def obtener_proyectos_estudiante(estudiante_id: int):
    return listar_proyectos_de_estudiante(estudiante_id)

@app.get("/api/v1/docentes/{docente_id}/buzon")
def obtener_buzon_docente(docente_id: int):
    """
    Buzón donde el docente revisa los proyectos tentativos con sus PDFs.
    """
    return buzon_proyectos_docente(docente_id)

@app.post("/api/v1/docentes/{docente_id}/proyectos/{proyecto_id}/responder")
def responder_propuesta(docente_id: int, proyecto_id: int, datos: ResponderPropuestaRequest):
    """
    El docente Acepta o Rechaza la propuesta.
    Si Acepta, la IA asigna automáticamente a los Revisores del tema.
    """
    try:
        resultado = responder_propuesta_docente(
            proyecto_id=proyecto_id,
            docente_id=docente_id,
            accion=datos.accion,
            observacion=datos.observacion
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not resultado:
        raise HTTPException(status_code=404, detail="Proyecto o docente no encontrado.")
    return {
        "mensaje": f"Propuesta {'aceptada' if datos.accion == 'aceptar' else 'rechazada'} correctamente.",
        "resultado": resultado
    }

@app.get("/api/v1/proyectos/{proyecto_id}/revisores")
def consultar_revisores_proyecto(proyecto_id: int):
    return obtener_revisores_de_proyecto(proyecto_id)

@app.get("/api/v1/usuarios/{usuario_id}/notificaciones")
def consultar_notificaciones(usuario_id: int):
    return listar_notificaciones(usuario_id)

@app.patch("/api/v1/usuarios/{usuario_id}/notificaciones/{notificacion_id}/leida")
def leer_notificacion(usuario_id: int, notificacion_id: int):
    resultado = marcar_notificacion_leida(usuario_id, notificacion_id)
    if not resultado:
        raise HTTPException(status_code=404, detail="Notificación no encontrada.")
    return {"mensaje": "Notificación marcada como leída."}
