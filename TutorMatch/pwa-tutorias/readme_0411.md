🗺️ Plan de Trabajo Sugerido (Fase por Fase)
Fase 1: Estructura base, Docker y Base de Datos (PostgreSQL)
Crear la carpeta del backend (TutorMatch/backend o al nivel de TutorMatch).
Configurar Dockerfile (Python) y docker-compose.yml que orqueste:
Contenedor de PostgreSQL.
Contenedor de la API en Python.
Definir el script SQL inicial (init.sql / migraciones) con las tablas fundamentales que ya definiste en tus diagramas:
usuarios (roles: estudiante, tutor, coordinador).
materias.
disponibilidades (horarios/slots).
solicitudes_tutoria.
evaluaciones.
Fase 2: Conexión y Funciones de Base de Datos (CRUD básico)
Configurar la conexión a PostgreSQL en Python con funciones limpias (ej. usando psycopg2 o SQLAlchemy en modo directo).
Crear módulos con funciones comprensibles y documentadas:
db.py: Funciones para abrir y cerrar conexión.
crud_usuarios.py: funciones como crear_usuario(), buscar_por_email(), verificar_credenciales().
crud_materias.py: obtener_materias(), crear_materia().
crud_tutorias.py: crear_solicitud(), listar_solicitudes(), asignar_tutor().
Fase 3: Servidor Web / API REST (FastAPI o Flask)
Usar un framework sencillo y moderno (como FastAPI o Flask) donde cada endpoint sea una función clara:
Endpoint POST /api/v1/auth/login
Endpoint POST /api/v1/auth/registro
Endpoint GET /api/v1/materias
Endpoint GET /api/v1/solicitudes y POST /api/v1/solicitudes
Documentación automática visual e interactiva (Swagger en /docs) para probar todo desde el navegador sin necesidad de herramientas complejas.
Fase 4: Conectar la PWA (Frontend) con el Backend local
Modificar store.js de la PWA para reemplazar la simulación en IndexedDB por peticiones fetch() a http://localhost:8000/api/v1/....
Probar el flujo completo de inicio a fin: Login de prueba -> Pedir tutoría -> Ver solicitud desde el panel de tutor/coordinador -> Guardar en Postgres.
