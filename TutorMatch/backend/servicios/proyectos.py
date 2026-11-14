from datetime import datetime, timedelta
from conexion import obtener_conexion
from servicios.recomendador_neuronal import extraer_palabras_clave, recomendar_revisores_por_tema

# ==============================================================
# GESTIÓN DE PROYECTOS DE GRADO, TUTORES Y REVISORES
# Plazo de respuesta: 72 horas para aceptación del tutor
# ==============================================================

def crear_propuesta_proyecto(estudiante_id: int, titulo_tentativo: str, docente_tutor_id: int, pdf_url: str = ""):
    """
    Registra la propuesta tentativa del estudiante y arranca el contador de 72 horas.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    palabras = extraer_palabras_clave(titulo_tentativo)
    palabras_str = ", ".join(palabras)
    
    ahora = datetime.now()
    limite_72h = ahora + timedelta(hours=72)
    
    query = """
        INSERT INTO proyectos_grado (
            estudiante_id, titulo_tentativo, palabras_clave, pdf_documento_url,
            docente_tutor_id, estado, fecha_envio, fecha_limite_72h
        )
        VALUES (%s, %s, %s, %s, %s, 'enviado_a_tutor', %s, %s)
        RETURNING id, estudiante_id, titulo_tentativo, palabras_clave, docente_tutor_id, estado, fecha_envio, fecha_limite_72h;
    """
    cursor.execute(query, (estudiante_id, titulo_tentativo, palabras_str, pdf_url, docente_tutor_id, ahora, limite_72h))
    proyecto = cursor.fetchone()
    
    # Crear notificación para el docente
    cursor.execute("""
        INSERT INTO notificaciones (usuario_id, proyecto_id, asunto, mensaje)
        VALUES (%s, %s, 'Nueva propuesta de Proyecto de Grado', 
                'Un estudiante ha enviado su propuesta de proyecto para su revisión (plazo de 72h).');
    """, (docente_tutor_id, proyecto["id"]))

    conexion.commit()
    cursor.close()
    conexion.close()
    return proyecto

def listar_proyectos_de_estudiante(estudiante_id: int):
    """
    Obtiene los proyectos propuestos por un estudiante con su estado actual y horas restantes.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        SELECT 
            p.id,
            p.titulo_tentativo,
            p.palabras_clave,
            p.pdf_documento_url,
            p.estado,
            p.fecha_envio,
            p.fecha_limite_72h,
            p.observacion_tutor,
            d.nombre AS docente_nombre,
            d.email AS docente_email
        FROM proyectos_grado p
        LEFT JOIN usuarios d ON p.docente_tutor_id = d.id
        WHERE p.estudiante_id = %s
        ORDER BY p.creado_en DESC;
    """
    cursor.execute(query, (estudiante_id,))
    proyectos = cursor.fetchall()
    
    # Revisar si ya expiró el plazo de 72 horas
    ahora = datetime.now()
    for p in proyectos:
        if p["estado"] == "enviado_a_tutor" and p["fecha_limite_72h"]:
            if ahora > p["fecha_limite_72h"]:
                p["estado"] = "expirado_72h"
                p["observacion_tutor"] = "El docente no respondió en el plazo de 72 horas. Debes buscar otro docente tutor."
                
    cursor.close()
    conexion.close()
    return proyectos

def buzon_proyectos_docente(docente_id: int):
    """
    Buzón donde el docente ve los proyectos tentativos enviados por los estudiantes.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        SELECT 
            p.id,
            p.titulo_tentativo,
            p.palabras_clave,
            p.pdf_documento_url,
            p.estado,
            p.fecha_envio,
            p.fecha_limite_72h,
            e.id AS estudiante_id,
            e.nombre AS estudiante_nombre,
            e.email AS estudiante_email,
            e.codigo_saga AS estudiante_saga
        FROM proyectos_grado p
        JOIN usuarios e ON p.estudiante_id = e.id
        WHERE p.docente_tutor_id = %s
        ORDER BY p.fecha_envio DESC;
    """
    cursor.execute(query, (docente_id,))
    proyectos = cursor.fetchall()
    
    cursor.close()
    conexion.close()
    return proyectos

def responder_propuesta_docente(proyecto_id: int, docente_id: int, accion: str, observacion: str = ""):
    """
    El docente acepta o niega la propuesta:
    - Si acepta ('aceptado'): El algoritmo recomienda automáticamente a los Revisores del tema.
    - Si niega ('rechazado'): Se le notifica al estudiante para que busque otro tutor.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    nuevo_estado = "aceptado" if accion == "aceptar" else "rechazado"
    ahora = datetime.now()
    
    query = """
        UPDATE proyectos_grado
        SET estado = %s, fecha_respuesta = %s, observacion_tutor = %s
        WHERE id = %s AND docente_tutor_id = %s
        RETURNING id, estudiante_id, titulo_tentativo, estado;
    """
    cursor.execute(query, (nuevo_estado, ahora, observacion, proyecto_id, docente_id))
    proyecto = cursor.fetchone()
    
    if not proyecto:
        cursor.close()
        conexion.close()
        return None

    # Notificar al estudiante
    mensaje_estudiante = (
        f"El docente tutor ha ACEPTADO tu tema de proyecto de grado: '{proyecto['titulo_tentativo']}'." 
        if nuevo_estado == "aceptado" 
        else f"El docente ha RECHAZADO tu tema: '{observacion}'. Debes seleccionar otro tutor en el sistema."
    )
    
    cursor.execute("""
        INSERT INTO notificaciones (usuario_id, proyecto_id, asunto, mensaje)
        VALUES (%s, %s, %s, %s);
    """, (proyecto["estudiante_id"], proyecto["id"], f"Respuesta de Tutoría: {nuevo_estado.upper()}", mensaje_estudiante))

    # SI FUE ACEPTADO: El algoritmo recomienda y asigna automáticamente a los REVISORES
    revisores_asignados = []
    if nuevo_estado == "aceptado":
        resultado_revisores = recomendar_revisores_por_tema(proyecto["titulo_tentativo"], docente_id, cantidad=2)
        for rev in resultado_revisores["revisores_recomendados"]:
            cursor.execute("""
                INSERT INTO proyecto_revisores (proyecto_id, revisor_id, afinidad_score, estado)
                VALUES (%s, %s, %s, 'asignado')
                ON CONFLICT (proyecto_id, revisor_id) DO NOTHING
                RETURNING revisor_id, afinidad_score;
            """, (proyecto["id"], rev["docente_id"], rev["afinidad_porcentaje"]))
            revisores_asignados.append(rev)

    conexion.commit()
    cursor.close()
    conexion.close()
    
    return {
        "proyecto": proyecto,
        "revisores_asignados": revisores_asignados
    }

def obtener_revisores_de_proyecto(proyecto_id: int):
    """
    Obtiene los revisores asignados a un proyecto ya aceptado.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        SELECT 
            r.id,
            u.id AS revisor_id,
            u.nombre AS revisor_nombre,
            u.email AS revisor_email,
            r.afinidad_score,
            r.estado,
            r.asignado_en
        FROM proyecto_revisores r
        JOIN usuarios u ON r.revisor_id = u.id
        WHERE r.proyecto_id = %s;
    """
    cursor.execute(query, (proyecto_id,))
    revisores = cursor.fetchall()
    
    cursor.close()
    conexion.close()
    return revisores

