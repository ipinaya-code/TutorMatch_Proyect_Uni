from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from conexion import probar_conexion
from servicios.usuarios import verificar_credenciales, registrar_usuario, listar_usuarios
from servicios.materias import listar_materias, crear_materia
from servicios.tutorias import listar_solicitudes, crear_solicitud, asignar_tutor_a_solicitud, cambiar_estado_solicitud
from servicios.algoritmo_genetico import ejecutar_algoritmo_genetico, aplicar_plan_en_base_de_datos

# Inicialización de FastAPI
app = FastAPI(
    title="TutorMatch API",
    description="API REST en Python para la gestión de tutorías universitarias",
    version="1.0.0"
)

# CORS para comunicación con el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------
# MODELOS DE ENTRADA (Validación simple de datos)
# ----------------------------------------------------------------
class LoginRequest(BaseModel):
    email: str
    password: str

class RegistroUsuarioRequest(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str
    semestre: Optional[int] = 1

class MateriaRequest(BaseModel):
    codigo: str
    nombre: str
    semestre: int
    es_tutorable: Optional[bool] = True

class SolicitudRequest(BaseModel):
    estudiante_id: int
    materia_id: int
    observaciones: Optional[str] = ""

class AsignarTutorRequest(BaseModel):
    tutor_id: int

class EstadoRequest(BaseModel):
    estado: str

# ----------------------------------------------------------------
# ENDPOINTS GENERALES
# ----------------------------------------------------------------
@app.get("/")
def ruta_principal():
    return {
        "mensaje": "¡Bienvenido a la API de TutorMatch!",
        "documentacion": "/docs"
    }

@app.get("/api/v1/health")
def verificar_salud():
    exito, mensaje = probar_conexion()
    return {"api": "OK", "base_de_datos": mensaje, "conectado": exito}

# ----------------------------------------------------------------
# ENDPOINTS DE USUARIOS Y AUTENTICACIÓN
# ----------------------------------------------------------------
@app.post("/api/v1/auth/login")
def login(datos: LoginRequest):
    usuario = verificar_credenciales(datos.email, datos.password)
    if not usuario:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    return {"mensaje": "Inicio de sesión correcto", "usuario": usuario}

@app.post("/api/v1/auth/registro")
def registro(datos: RegistroUsuarioRequest):
    try:
        nuevo_usuario = registrar_usuario(
            nombre=datos.nombre,
            email=datos.email,
            password=datos.password,
            rol=datos.rol,
            semestre=datos.semestre
        )
        return {"mensaje": "Usuario registrado exitosamente", "usuario": nuevo_usuario}
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Error al registrar: {str(error)}")

@app.get("/api/v1/usuarios")
def obtener_usuarios():
    return listar_usuarios()

# ----------------------------------------------------------------
# ENDPOINTS DE MATERIAS
# ----------------------------------------------------------------
@app.get("/api/v1/materias")
def obtener_materias():
    return listar_materias()

@app.post("/api/v1/materias")
def nueva_materia(datos: MateriaRequest):
    try:
        materia = crear_materia(
            codigo=datos.codigo,
            nombre=datos.nombre,
            semestre=datos.semestre,
            es_tutorable=datos.es_tutorable
        )
        return {"mensaje": "Materia registrada", "materia": materia}
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Error al crear materia: {str(error)}")

# ----------------------------------------------------------------
# ENDPOINTS DE TUTORÍAS / SOLICITUDES
# ----------------------------------------------------------------
@app.get("/api/v1/solicitudes")
def obtener_solicitudes():
    return listar_solicitudes()

@app.post("/api/v1/solicitudes")
def nueva_solicitud(datos: SolicitudRequest):
    try:
        solicitud = crear_solicitud(
            estudiante_id=datos.estudiante_id,
            materia_id=datos.materia_id,
            observaciones=datos.observaciones
        )
        return {"mensaje": "Solicitud creada exitosamente", "solicitud": solicitud}
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Error al solicitar tutoría: {str(error)}")

@app.put("/api/v1/solicitudes/{solicitud_id}/asignar")
def asignar_tutor(solicitud_id: int, datos: AsignarTutorRequest):
    actualizado = asignar_tutor_a_solicitud(solicitud_id, datos.tutor_id)
    if not actualizado:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return {"mensaje": "Tutor asignado con éxito", "solicitud": actualizado}

@app.put("/api/v1/solicitudes/{solicitud_id}/estado")
def actualizar_estado(solicitud_id: int, datos: EstadoRequest):
    actualizado = cambiar_estado_solicitud(solicitud_id, datos.estado)
    if not actualizado:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return {"mensaje": "Estado actualizado", "solicitud": actualizado}

# ----------------------------------------------------------------
# ENDPOINTS DEL ALGORITMO GENÉTICO (OPTIMIZACIÓN)
# ----------------------------------------------------------------
@app.post("/api/v1/optimizer/simular")
def simular_asignacion_genetica():
    """
    Ejecuta el algoritmo genético para calcular la asignación óptima
    sin modificar la base de datos (ideal para ver la simulación en el frontend).
    """
    resultado = ejecutar_algoritmo_genetico()
    return resultado

@app.post("/api/v1/optimizer/aplicar")
def aplicar_asignacion_genetica():
    """
    Ejecuta el algoritmo genético y guarda automáticamente las asignaciones
    en la tabla 'solicitudes_tutoria' de PostgreSQL.
    """
    resultado = ejecutar_algoritmo_genetico()
    if not resultado.get("asignaciones"):
        return {"mensaje": "No se realizaron asignaciones", "detalle": resultado}
    
    total_aplicados = aplicar_plan_en_base_de_datos(resultado["asignaciones"])
    return {
        "mensaje": f"Se aplicaron {total_aplicados} asignaciones en la base de datos con éxito.",
        "resultado_algoritmo": resultado["resumen"],
        "asignaciones": resultado["asignaciones"]
    }
