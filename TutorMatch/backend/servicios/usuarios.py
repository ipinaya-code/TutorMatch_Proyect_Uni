from conexion import obtener_conexion

# ==============================================================
# FUNCIONES PARA GESTIÓN DE USUARIOS
# ==============================================================

def buscar_usuario_por_email(email: str):
    """
    Busca un usuario en la base de datos por su correo electrónico.
    Retorna un diccionario con los datos o None si no existe.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = "SELECT id, nombre, email, password_hash, rol, carrera, semestre FROM usuarios WHERE email = %s;"
    cursor.execute(query, (email.strip().lower(),))
    usuario = cursor.fetchone()
    
    cursor.close()
    conexion.close()
    return usuario

def verificar_credenciales(email: str, password: str):
    """
    Valida si el correo y la contraseña coinciden.
    Retorna los datos del usuario si es correcto, o None si falla.
    """
    usuario = buscar_usuario_por_email(email)
    if not usuario:
        return None
    
    # Comprobación simple de contraseña
    if usuario["password_hash"] == password:
        # Quitamos el password del resultado antes de devolverlo por seguridad
        del usuario["password_hash"]
        return usuario
    
    return None

def registrar_usuario(nombre: str, email: str, password: str, rol: str, semestre: int = 1):
    """
    Registra un nuevo usuario en la base de datos.
    Retorna el usuario creado o genera una excepción si ya existe.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        INSERT INTO usuarios (nombre, email, password_hash, rol, semestre)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, nombre, email, rol, semestre;
    """
    cursor.execute(query, (nombre, email.strip().lower(), password, rol, semestre))
    nuevo_usuario = cursor.fetchone()
    
    conexion.commit()
    cursor.close()
    conexion.close()
    return nuevo_usuario

def listar_usuarios():
    """
    Lista todos los usuarios registrados (sin exponer contraseñas).
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = "SELECT id, nombre, email, rol, carrera, semestre, creado_en FROM usuarios ORDER BY id ASC;"
    cursor.execute(query)
    usuarios = cursor.fetchall()
    
    cursor.close()
    conexion.close()
    return usuarios

