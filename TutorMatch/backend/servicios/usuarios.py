from conexion import obtener_conexion

# ==============================================================
# GESTIÓN DE USUARIOS Y AUTENTICACIÓN INSTITUCIONAL EMI
# Login: Correo institucional (ej: ipinayav@est.emi.edu.bo)
# Password: Código SAGA (ej: C11368-9)
# ==============================================================

def buscar_usuario_por_email(email: str):
    """
    Busca un usuario por su correo institucional.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        SELECT id, nombre, email, codigo_saga, password_hash, rol, carrera, semestre 
        FROM usuarios 
        WHERE LOWER(email) = %s;
    """
    cursor.execute(query, (email.strip().lower(),))
    usuario = cursor.fetchone()
    
    cursor.close()
    conexion.close()
    return usuario

def verificar_credenciales_saga(email: str, codigo_saga: str):
    """
    Valida credenciales según el documento:
    email = correo institucional
    password = código SAGA
    """
    usuario = buscar_usuario_por_email(email)
    if not usuario:
        return None
    
    # Comprobamos con código SAGA o password
    if usuario["codigo_saga"].strip().upper() == codigo_saga.strip().upper() or usuario["password_hash"] == codigo_saga:
        del usuario["password_hash"]
        return usuario
    
    return None

def registrar_usuario(nombre: str, email: str, codigo_saga: str, rol: str, semestre: int = 8):
    """
    Registra un nuevo estudiante o docente en el sistema.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        INSERT INTO usuarios (nombre, email, codigo_saga, password_hash, rol, semestre)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, nombre, email, codigo_saga, rol, carrera, semestre;
    """
    cursor.execute(query, (nombre, email.strip().lower(), codigo_saga.strip().upper(), codigo_saga, rol, semestre))
    nuevo_usuario = cursor.fetchone()
    
    conexion.commit()
    cursor.close()
    conexion.close()
    return nuevo_usuario

def listar_docentes_con_perfil():
    """
    Obtiene todos los docentes y revisores junto con sus especialidades y cursos dictados.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        SELECT 
            u.id, 
            u.nombre, 
            u.email, 
            u.rol, 
            COALESCE(p.cursos_dictados, 'No especificado') AS cursos_dictados,
            COALESCE(p.especialidades, '') AS especialidades,
            COALESCE(p.experiencia_anios, 0) AS experiencia_anios,
            COALESCE(p.activo_como_tutor, true) AS activo_como_tutor,
            COALESCE(p.activo_como_revisor, true) AS activo_como_revisor
        FROM usuarios u
        LEFT JOIN docente_perfiles p ON u.id = p.docente_id
        WHERE u.rol IN ('docente', 'revisor')
        ORDER BY u.nombre ASC;
    """
    cursor.execute(query)
    docentes = cursor.fetchall()
    
    cursor.close()
    conexion.close()
    return docentes

def actualizar_especialidades_docente(docente_id: int, cursos: str, especialidades: str):
    """
    Permite al docente actualizar sus cursos dictados y especialidades desde su perfil.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        INSERT INTO docente_perfiles (docente_id, cursos_dictados, especialidades)
        VALUES (%s, %s, %s)
        ON CONFLICT (docente_id) DO UPDATE 
        SET cursos_dictados = EXCLUDED.cursos_dictados,
            especialidades = EXCLUDED.especialidades
        RETURNING docente_id, cursos_dictados, especialidades;
    """
    cursor.execute(query, (docente_id, cursos, especialidades))
    resultado = cursor.fetchone()
    
    conexion.commit()
    cursor.close()
    conexion.close()
    return resultado
