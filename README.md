# 🎓 TutorMatch — Sistema Inteligente de Tutorías Universitarias

**Escuela Militar de Ingeniería (EMI) · Unidad Académica Cochabamba · Ingeniería de Sistemas**

Plataforma integral web progresiva (**PWA**) asistida por un **Algoritmo Genético** en backend para la asignación y optimización automática de tutorías académicas entre estudiantes y tutores pares.

---

## 🎯 ¿Qué es lo que se quiere lograr?

1. **Asignación Óptima Automatizada:** Eliminar el proceso manual de coordinación asignando tutores pares a estudiantes solicitantes mediante un **Algoritmo Genético** que optimiza:
   - Notas de aprobación del tutor en la materia solicitada.
   - Balance equitativo de carga entre tutores.
   - Misma carrera universitaria y tutores de semestres superiores.
   - Evitar choques de horarios y sobrecupo de tutorías simultáneas.
2. **Arquitectura Robusta y Desacoplada:** Separar la lógica en servicios independientes:
   - **Frontend:** PWA rápida con React, Tailwind CSS e IndexedDB (resiliente offline).
   - **Backend:** API REST en Python con FastAPI, modular y fácil de mantener.
   - **Persistencia:** Base de datos relacional PostgreSQL 15 en contenedor Docker.
3. **Control y Seguimiento Académico:** Permitir a la jefatura de carrera y coordinación académica supervisar el avance, historial de tutorías, valoraciones y asistencias en tiempo real.

---

## 🚀 ¿Cómo se corre el proyecto?

### 1. Iniciar Base de Datos y Backend (Docker)

1. Abre la aplicación **Docker Desktop** en tu computadora (espera a que el icono inferior izquierdo esté en verde: _"Engine running"_).
2. Abre una terminal y navega hasta la carpeta `TutorMatch`:
   ```powershell
   cd TutorMatch
   docker-compose up --build
   ```
3. Verifica que la API responda en tu navegador:
   - **Documentación interactiva Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Comprobación de salud y conexión:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
   - **Listar usuarios de la BD:** [http://localhost:8000/api/v1/usuarios](http://localhost:8000/api/v1/usuarios)

### 2. Iniciar el Frontend (PWA)

1. En una segunda terminal, navega a la carpeta de la PWA:
   ```powershell
   cd TutorMatch\pwa-tutorias
   npm install       # Solo la primera vez si no tienes node_modules
   npm run dev
   ```
2. Abre la URL local generada: **[http://localhost:5173/html/index.html](http://localhost:5173/html/index.html)**.

---

## 🐳 Servicios en Docker Desktop

El archivo [`docker-compose.yml`](file:///c:/Users/usser/OneDrive/Escritorio/8to/Proyect_TutorMatch/TutorMatch/docker-compose.yml) orquesta los siguientes contenedores:

| Contenedor                | Imagen               | Puerto      | Descripción                                                                                                   |
| :------------------------ | :------------------- | :---------- | :------------------------------------------------------------------------------------------------------------ |
| **`tutormatch_postgres`** | `postgres:15-alpine` | `5432:5432` | Base de datos relacional PostgreSQL con volumen persistente (`postgres_data`) y script inicial `01_init.sql`. |
| **`tutormatch_api`**      | `Python 3.11-slim`   | `8000:8000` | API REST en FastAPI con recarga en vivo (`--reload`) de cualquier cambio en el código.                        |

---

## 👥 Cuentas de Prueba Registradas en la Base de Datos

Todos los usuarios iniciales tienen la contraseña común: **`1234`**

| Rol             | Correo Electrónico | Descripción / Perfil                                                                 |
| :-------------- | :----------------- | :----------------------------------------------------------------------------------- |
| **Coordinador** | `coord@emi.demo`   | Acceso al panel de control, laboratorio del algoritmo genético, catálogo y usuarios. |
| **Tutor**       | `ana@emi.demo`     | Perfil de tutora par (7mo semestre), materias aprobadas y disponibilidad horaria.    |
| **Estudiante**  | `camila@emi.demo`  | Perfil de estudiante (2do semestre) solicitante de tutorías.                         |

_(También es posible registrar nuevos estudiantes o tutores directamente desde el botón "Crear cuenta" del formulario)._

---

## 📂 1. Estructura Actual del Proyecto (Lo que tenemos implementado)

```text
Proyect_TutorMatch/
│
├── README.md                           # Documento maestro del proyecto y guía de uso
├── readme_trabajados.md                # Bitácora cronológica de avances por fechas
├── diagramas/                          # Carpeta de diseño UML y modelos de software
│   ├── Arbol de problemas/             # Árbol de problemas en .txt
│   ├── Arquitectura/                   # arquitectura.jpeg y .txt
│   ├── Caso de uso/                    # caso de uso.jpeg y .txt
│   ├── Despliegue/                     # Despliegue.txt
│   ├── Diagrama de Actividades/        # Diagrama de actividades.txt
│   ├── Diagrama de clases/             # diagrama de clases.txt
│   ├── Diagramas de Secuencia/         # diagrama de secuencia.jpeg y .txt
│   ├── Entidad-Relacion/               # diagrama entidad y relacion.jpeg y .txt
│   ├── Estados/                        # estados.txt
│   ├── Flujo de datos/                 # flujo de datos.txt
│   ├── Ishikawa/                       # ishikawa.txt
│   ├── Mockups/                        # mockups.txt
│   └── RF Y RNF/                       # RF y RNF.txt
│
├── documentacion/                      # Documentación académica y especificación formal
│   ├── Proyecto_PWA_Tutorias_Universitarias.docx / .pdf
│   ├── TutorMatch - Arquitectura y plan del proyecto.docx
│   └── TutorMatch - Descripción, funcionamiento y arquitectura.docx
│
└── TutorMatch/
    ├── docker-compose.yml              # Orquestador multi-contenedor (Postgres + Python API)
    │
    ├── backend/                        # Backend API en Python (FastAPI)
    │   ├── Dockerfile                  # Empaquetado del backend en Python 3.11
    │   ├── requirements.txt            # Dependencias (fastapi, uvicorn, psycopg2-binary, pydantic)
    │   ├── main.py                     # Enrutador principal de endpoints REST
    │   ├── conexion.py                 # Conexión limpia y modular a PostgreSQL
    │   ├── init_db/
    │   │   └── 01_init.sql             # Tablas: usuarios, materias, disponibilidades, solicitudes, evaluaciones
    │   └── servicios/                  # Lógica de negocio en funciones básicas
    │       ├── usuarios.py             # Login, registro y consulta de usuarios
    │       ├── materias.py             # Listado y alta de materias
    │       ├── tutorias.py             # Solicitudes y asignación de tutores
    │       └── algoritmo_genetico.py   # Motor evolutivo (evaluación de fitness, cruce, mutación)
    │
    └── pwa-tutorias/                   # Aplicación Frontend PWA
        ├── package.json                # React, Vite, Lucide-react, Tailwind CSS
        ├── vite.config.js
        ├── html/
        │   └── index.html              # Punto de entrada HTML
        ├── css/                        # Estilos CSS y animaciones
        └── js/
            ├── components/             # Componentes visuales (Brand, Tabs, Notificaciones)
            ├── data/                   # Malla curricular de Sistemas EMI y catálogo base
            ├── offline/                # idb.js (Soporte offline con IndexedDB)
            ├── optimizer/              # Simulador previo del algoritmo genético en JS
            ├── pages/                  # Vistas por rol: public, student, tutor, coordinator
            ├── store/                  # Estado global con sincronización a la API
            └── utils/
                └── api.js              # Cliente fetch hacia http://localhost:8000/api/v1
```

---

## 🎯 2. Estructura Completa que Deseamos Alcanzar (Meta Final)

```text
Proyect_TutorMatch/
│
├── README.md
├── readme_trabajados.md
│
├── diagramas/                          # Todos los diagramas con su gráfico visual exportado
│   ├── Arbol de problemas/             # arbol_problemas.png + .drawio
│   ├── Arquitectura/                   # arquitectura.png + .drawio
│   ├── Caso de uso/                    # casos_de_uso.png + .drawio
│   ├── Despliegue/                     # despliegue.png + .drawio
│   ├── Diagrama de Actividades/        # actividades.png + .drawio
│   ├── Diagrama de clases/             # clases_uml.png + .drawio
│   ├── Diagramas de Secuencia/         # secuencia.png + .drawio
│   ├── Entidad-Relacion/               # modelo_er.png + .sql + .drawio
│   ├── Estados/                        # estados_tutoria.png + .drawio
│   ├── Flujo de datos/                 # dfd_nivel0_nivel1.png + .drawio
│   ├── Ishikawa/                       # ishikawa_pescado.png + .drawio
│   └── Mockups/                        # capturas_ui_figma/
│
├── documentacion/
│   ├── Documento_Final_Grado_TutorMatch.docx / .pdf
│   └── Manual_de_Usuario_e_Instalacion.pdf
│
└── TutorMatch/
    ├── docker-compose.yml              # Orquesta 3 servicios completos (DB + API + Frontend)
    │
    ├── backend/
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   ├── main.py
    │   ├── conexion.py
    │   ├── config.py                   # Variables de entorno centralizadas (.env)
    │   ├── init_db/
    │   │   ├── 01_init.sql             # Tablas relacionales
    │   │   └── 02_seed_completo.sql    # Toda la malla curricular de Sistemas cargada
    │   └── servicios/
    │       ├── auth.py                 # JWT Token seguro para sesiones
    │       ├── usuarios.py
    │       ├── materias.py
    │       ├── tutorias.py
    │       ├── algoritmo_genetico.py   # Motor genético optimizado
    │       ├── notificaciones.py       # Envío real de correos Gmail/SMTP
    │       └── reportes.py             # Exportación de actas y listas a PDF/Excel
    │
    └── pwa-tutorias/
        ├── Dockerfile                  # Contenedor para desplegar el frontend en Nginx
        ├── nginx.conf                  # Servidor web ligero para producción del frontend
        ├── package.json
        └── js/
            ├── components/
            ├── pages/
            │   ├── student/            # Flujo 100% conectado a la API de PostgreSQL
            │   ├── tutor/              # Aceptación de sesiones y carga de horarios en Postgres
            │   └── coordinator/        # Botón de ejecución del algoritmo genético en el backend
            ├── store/                  # Gestión de datos en red con fallback offline
            └── utils/
```

---

## 🛠️ Tecnologías Empleadas

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Service Workers (PWA).
- **Backend:** Python 3.11, FastAPI, Uvicorn, Pydantic, Psycopg2.
- **Base de Datos:** PostgreSQL 15 Alpine.
- **Infraestructura:** Docker Desktop, Docker Compose.
