from conexion import obtener_conexion

# ==============================================================
# FUNCIONES PARA GESTIÓN DE MATERIAS
# ==============================================================

def listar_materias():
    """
    Obtiene todas las materias registradas en el sistema.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = "SELECT id, codigo, nombre, semestre, es_tutorable FROM materias ORDER BY semestre, codigo ASC;"
    cursor.execute(query)
    materias = cursor.fetchall()
    
    cursor.close()
    conexion.close()
    return materias

def crear_materia(codigo: str, nombre: str, semestre: int, es_tutorable: bool = True):
    """
    Registra una nueva materia en el catálogo.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    query = """
        INSERT INTO materias (codigo, nombre, semestre, es_tutorable)
        VALUES (%s, %s, %s, %s)
        RETURNING id, codigo, nombre, semestre, es_tutorable;
    """
    cursor.execute(query, (codigo.upper(), nombre, semestre, es_tutorable))
    materia_creada = cursor.fetchone()
    
    conexion.commit()
    cursor.close()
    conexion.close()
    return materia_creada

