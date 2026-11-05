import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Función para obtener los parámetros de conexión
def obtener_configuracion_db():
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": os.getenv("DB_PORT", "5432"),
        "database": os.getenv("DB_NAME", "tutormatch_db"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", "postgrespassword"),
    }

# Función para abrir conexión a PostgreSQL
def obtener_conexion():
    config = obtener_configuracion_db()
    conexion = psycopg2.connect(
        host=config["host"],
        port=config["port"],
        dbname=config["database"],
        user=config["user"],
        password=config["password"],
        cursor_factory=RealDictCursor # Devuelve los resultados como diccionarios en vez de tuplas
    )
    return conexion

# Función simple para probar el estado de la conexión
def probar_conexion():
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()
        cursor.execute("SELECT 1 AS estado;")
        resultado = cursor.fetchone()
        cursor.close()
        conexion.close()
        return True, "Conexión a PostgreSQL exitosa"
    except Exception as error:
        return False, f"Error al conectar a PostgreSQL: {str(error)}"

