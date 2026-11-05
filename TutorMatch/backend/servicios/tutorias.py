from conexion import obtener_conexion

# ==============================================================
# FUNCIONES PARA GESTIÓN DE SOLICITUDES DE TUTORÍA
# ==============================================================

def listar_solicitudes():
    """
    Obtiene la lista completa de solicitudes de tutoría con los nombres
    del estudiante, materia y tutor (si está asignado).
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        SELECT 
            s.id,
            s.estado,
            s.fecha_solicitud,
            s.observaciones,
            e.id AS estudiante_id,
            e.nombre AS estudiante_nombre,
            m.id AS materia_id,
            m.nombre AS materia_nombre,
            m.codigo AS materia_codigo,
            t.id AS tutor_id,
            t.nombre AS tutor_nombre
        FROM solicitudes_tutoria s
        JOIN usuarios e ON s.estudiante_id = e.id
        JOIN materias m ON s.materia_id = m.id
        LEFT JOIN usuarios t ON s.tutor_id = t.id
        ORDER BY s.fecha_solicitud DESC;
    """
    cursor.execute(query)
    solicitudes = cursor.fetchall()
    
    cursor.close()
    conexion.close()
    return solicitudes

def crear_solicitud(estudiante_id: int, materia_id: int, observaciones: str = ""):
    """
    Crea una nueva solicitud de tutoría en estado 'pendiente'.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        INSERT INTO solicitudes_tutoria (estudiante_id, materia_id, estado, observaciones)
        VALUES (%s, %s, 'pendiente', %s)
        RETURNING id, estudiante_id, materia_id, estado, fecha_solicitud, observaciones;
    """
    cursor.execute(query, (estudiante_id, materia_id, observaciones))
    solicitud = cursor.fetchone()
    
    conexion.commit()
    cursor.close()
    conexion.close()
    return solicitud

def asignar_tutor_a_solicitud(solicitud_id: int, tutor_id: int):
    """
    Asigna un tutor a una solicitud existente y cambia su estado a 'asignada'.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        UPDATE solicitudes_tutoria
        SET tutor_id = %s, estado = 'asignada'
        WHERE id = %s
        RETURNING id, estudiante_id, materia_id, tutor_id, estado;
    """
    cursor.execute(query, (tutor_id, solicitud_id))
    solicitud_actualizada = cursor.fetchone()
    
    conexion.commit()
    cursor.close()
    conexion.close()
    return solicitud_actualizada

def cambiar_estado_solicitud(solicitud_id: int, nuevo_estado: str):
    """
    Cambia el estado de una solicitud ('pendiente', 'asignada', 'completada', 'cancelada').
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        UPDATE solicitudes_tutoria
        SET estado = %s
        WHERE id = %s
        RETURNING id, estado;
    """
    cursor.execute(query, (nuevo_estado, solicitud_id))
    actualizado = cursor.fetchone()
    
    conexion.commit()
    cursor.close()
    conexion.close()
    return actualizado

