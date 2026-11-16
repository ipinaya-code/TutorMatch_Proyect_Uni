# TutorMatch EMI

Sistema web de recomendación de tutores y revisores para proyectos de grado de
la Escuela Militar de Ingeniería (EMI), Unidad Académica Cochabamba.

El estudiante escribe el título tentativo de su proyecto. El sistema extrae
palabras clave, consulta las especialidades vigentes de PostgreSQL y recomienda
docentes según su afinidad temática.

## Estado actual

El proyecto cuenta con un flujo funcional de desarrollo:

- Login institucional con correo y código SAGA.
- Catálogo oficial de 15 docentes tutores y estudiantes registrados.
- Perfiles de docentes con especialidades, experiencia, certificados y horarios.
- Recomendación de tutores mediante NLP/modelo neuronal.
- Selección de uno o dos docentes para una misma propuesta.
- Envío del mismo PDF y tema a los docentes seleccionados.
- Plazo de respuesta de 72 horas.
- Buzón de propuestas para docentes.
- Aceptación o rechazo de propuestas.
- Si un docente acepta, el segundo docente seleccionado pasa automáticamente a
  ser revisor.
- Notificaciones persistentes para estudiantes y docentes.
- Buzón de notificaciones para el estudiante.
- Apertura del PDF desde el buzón docente.
- Límite reglamentario de tres pupilos por docente.
- Especialidades actualizadas en el perfil docente y utilizadas por el
  recomendador.

> El estado actual está preparado para pruebas internas y demostración. Antes de
> publicar en producción se deben completar autenticación segura, autorización
> por roles, HTTPS, secretos mediante variables de entorno, backups y monitoreo.

## Flujo principal

### Estudiante

1. Inicia sesión con su correo institucional y código SAGA.
2. Escribe el título tentativo del proyecto.
3. Ejecuta el recomendador neuronal.
4. Selecciona uno o dos docentes recomendados.
5. Adjunta el PDF de la propuesta.
6. Envía la propuesta.
7. Consulta el estado de cada docente desde **Mis Propuestas**.
8. Consulta las respuestas desde el **Buzón**.
9. Si ambos docentes rechazan, vuelve a utilizar el recomendador.

### Docentes

1. Inician sesión con su cuenta institucional.
2. Revisan las propuestas recibidas en **Avisos / Buzón de Temas**.
3. Abren el PDF adjunto.
4. Aceptan o rechazan la propuesta dentro de 72 horas.
5. Si aceptan y existe un segundo docente seleccionado, ese docente queda
   asignado como revisor automáticamente.

Dejar una propuesta pendiente equivale a no responder; el estudiante conserva
el estado pendiente hasta que el docente responda o expire el plazo de 72 horas.

## Cuentas oficiales

La lista completa de docentes y estudiantes está en:

- [`../README_usuarios.md`](../README_usuarios.md)
- [`../../README_usuarios.md`](../../README_usuarios.md)

Ejemplos:

| Rol | Correo | Código SAGA |
| --- | --- | --- |
| Estudiante | `ipinayav@est.emi.edu.bo` | `C11368-9` |
| Docente | `rmendoza@adm.emi.edu.bo` | `DOC-1002` |
| Docente | `psoria@adm.emi.edu.bo` | `DOC-1003` |

Las credenciales oficiales de docentes usan códigos `DOC-1001` a `DOC-1015`.

## Ejecución local

### 1. Base de datos y backend

Requisitos:

- Docker Desktop.
- Docker Compose.
- Git.

Desde la carpeta del proyecto:

```powershell
cd TutorMatch
docker compose up --build
```

Servicios:

| Servicio | URL/puerto | Descripción |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | Base de datos del sistema |
| FastAPI | `http://localhost:8000` | API REST |
| Swagger | `http://localhost:8000/docs` | Documentación interactiva |
| Health | `http://localhost:8000/api/v1/health` | Estado de API y PostgreSQL |

### 2. Frontend PWA

En otra terminal:

```powershell
cd TutorMatch\pwa-tutorias
npm install
npm run dev
```

Abrir:

```text
http://localhost:5173/html/index.html
```

Para generar la versión de producción del frontend:

```powershell
npm run build
```

## Base de datos y migraciones

Las migraciones se encuentran en `backend/init_db/`:

- `01_init.sql`: esquema inicial y catálogo institucional.
- `02_sync_especialidades_docentes.sql`: sincronización de docentes y
  especialidades oficiales.
- `03_propuestas_dos_tutores.sql`: propuestas agrupadas, revisores y
  notificaciones.

Las instalaciones nuevas reciben los scripts mediante Docker Compose.

Si la base ya existía antes de agregar el flujo de propuestas, ejecutar una vez:

```powershell
Get-Content -Raw backend\init_db\03_propuestas_dos_tutores.sql |
  docker exec -i tutormatch_postgres psql -U postgres -d tutormatch_db
```

Tablas principales:

- `usuarios`
- `docente_perfiles`
- `proyectos_grado`
- `proyecto_revisores`
- `notificaciones`

## API principal

### Autenticación y docentes

```text
POST /api/v1/auth/login
GET  /api/v1/docentes
PUT  /api/v1/docentes/{docente_id}/perfil
```

### Recomendador

```text
POST /api/v1/ia/analizar-tema
GET  /api/v1/ia/recomendar-revisores
```

Las recomendaciones convierten los identificadores del catálogo en los IDs
actuales de PostgreSQL antes de enviarlos al frontend.

### Propuestas y revisores

```text
POST /api/v1/proyectos/enviar
GET  /api/v1/proyectos/estudiante/{estudiante_id}
GET  /api/v1/docentes/{docente_id}/buzon
POST /api/v1/docentes/{docente_id}/proyectos/{proyecto_id}/responder
GET  /api/v1/proyectos/{proyecto_id}/revisores
```

`POST /api/v1/proyectos/enviar` recibe `multipart/form-data` con:

- `estudiante_id`
- `docente_tutor_ids`: uno o dos IDs separados por coma
- `titulo_tentativo`
- `archivo_pdf`

### Notificaciones

```text
GET   /api/v1/usuarios/{usuario_id}/notificaciones
PATCH /api/v1/usuarios/{usuario_id}/notificaciones/{notificacion_id}/leida
```

Los PDFs se sirven desde:

```text
http://localhost:8000/uploads/{archivo}
```

## Estructura principal

```text
TutorMatch/
├── backend/
│   ├── main.py
│   ├── conexion.py
│   ├── init_db/
│   │   ├── 01_init.sql
│   │   ├── 02_sync_especialidades_docentes.sql
│   │   └── 03_propuestas_dos_tutores.sql
│   └── servicios/
│       ├── usuarios.py
│       ├── proyectos.py
│       └── recomendador_neuronal.py
├── modelo_de_recomendacion/
│   ├── app/
│   ├── artefactos/
│   ├── datos/
│   ├── tests/
│   └── README.md
├── pwa-tutorias/
│   ├── js/
│   │   ├── pages/student/StudentPanel.jsx
│   │   ├── pages/tutor/TutorPanel.jsx
│   │   ├── store/store.js
│   │   └── utils/api.js
│   └── package.json
└── docker-compose.yml
```

## Modelo de recomendación

El modelo y sus artefactos están en `modelo_de_recomendacion/`.

El backend:

1. Extrae palabras clave del título.
2. Carga las especialidades actuales desde PostgreSQL.
3. Ejecuta los artefactos del modelo cuando están disponibles.
4. Filtra docentes que no pertenecen al catálogo oficial.
5. Usa el motor semántico oficial como respaldo.

Para ejecutar las pruebas del modelo:

```powershell
cd TutorMatch\modelo_de_recomendacion
pytest
```

## Validaciones realizadas

- Build del frontend con Vite.
- Compilación de los módulos Python del backend.
- Verificación de conexión API/PostgreSQL.
- Envío real de una propuesta a dos docentes.
- Verificación del mismo grupo de propuesta y PDF.
- Aceptación de un docente.
- Asignación del segundo docente como revisor.
- Creación y consulta de notificaciones.
- Limpieza de los datos utilizados en la prueba.

## Tecnologías

- React 18, Vite y Tailwind CSS.
- FastAPI, Python 3.11 y Uvicorn.
- PostgreSQL 15.
- PyTorch/NLP y motor semántico de respaldo.
- Docker Compose.
- IndexedDB para persistencia local de sesión y estado del frontend.

## Pendientes para producción

- Mover todas las credenciales fuera del frontend.
- Implementar sesiones seguras o JWT con expiración.
- Proteger cada endpoint según usuario y rol.
- Configurar HTTPS y un dominio real.
- Usar variables de entorno para todos los secretos.
- Configurar backups y migraciones versionadas.
- Agregar monitoreo, logs y límites de subida de archivos.
- Ejecutar pruebas completas con las cuentas oficiales.
