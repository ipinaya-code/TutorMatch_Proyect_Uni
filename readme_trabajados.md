# Bitácora de Trabajo por Fechas — TutorMatch

**Carrera:** Ingeniería de Sistemas · **Institución:** Escuela Militar de Ingeniería (EMI) · Cochabamba

---

## 📅 Fecha: 05/11/2026

### ✅ 1. ¿Qué cosas ya se realizaron hoy?

- **Arquitectura de Base de Datos Real (PostgreSQL):**
  - Se diseñó el esquema relacional (`01_init.sql`) con 6 tablas principales: `usuarios`, `materias`, `disponibilidades`, `tutor_materias`, `solicitudes_tutoria` y `evaluaciones`.
  - Se incluyeron datos de prueba (seed) con los 3 roles iniciales: Coordinador, Tutor y Estudiante.
- **Contenedores Docker y Docker Compose:**
  - Se configuró `Dockerfile` para empaquetar el backend en Python 3.11.
  - Se configuró `docker-compose.yml` orquestando la base de datos `tutormatch_postgres` (PostgreSQL 15 Alpine en puerto 5432) y la API `tutormatch_api` (FastAPI en puerto 8000).
  - Ambos servicios se construyeron y levantaron exitosamente en **Docker Desktop** con volúmenes de persistencia.
- **Backend Modular con Funciones Básicas (Python):**
  - Creación del módulo de conexión `conexion.py`.
  - Implementación de funciones CRUD independientes y entendibles:
    - `servicios/usuarios.py`: Login, registro y consulta segura de usuarios.
    - `servicios/materias.py`: Listado y registro de materias.
    - `servicios/tutorias.py`: Creación, listado y asignación de solicitudes.
- **Migración del Algoritmo Genético al Backend:**
  - Se implementó en Python el motor evolutivo (`servicios/algoritmo_genetico.py`):
    - Cruce, mutación y selección por torneo.
    - Evaluación de fitness con restricciones duras (evitar choques y límite de cupos) y blandas (prioridad de notas, balance de carga y misma carrera).
    - Endpoints creados: `/api/v1/optimizer/simular` y `/api/v1/optimizer/aplicar`.
- **Integración Frontend PWA <-> Backend API:**
  - Se creó `pwa-tutorias/js/utils/api.js` para realizar peticiones REST reales.
  - Se conectó el formulario de Login y Registro (`Auth.jsx` y `store.js`) a la API de FastAPI.
  - Se verificó la compilación de producción del frontend (`npm run build`) con 0 errores.

---

### ⏳ 2. ¿Qué cosas nos falta por realizar?

- **Frontend - Vistas de Tutoría y Algoritmo:**
  - Conectar el botón de "Optimizar con Algoritmo Genético" del panel de Coordinación para que consuma directamente `/api/v1/optimizer/aplicar` del backend.
  - Reemplazar la persistencia local de la creación de solicitudes de estudiantes por el endpoint `/api/v1/solicitudes`.
- **Diagramas pendientes de exportación visual:**
  - En la carpeta `diagramas/`, dibujar y exportar a formato gráfico (`.png` / `.drawio`):
    - Diagrama de Clases.
    - Diagrama de Actividades.
    - Diagrama de Estados.
    - Diagrama de Despliegue.
    - Árbol de Problemas e Ishikawa.
    - Crear un diagrama de como funciona el algoritmo genetico con sus graficas
- **Notificaciones reales:**
  - Implementación de servicio de envío de correos o recordatorios automáticos (Gmail / SMTP).
