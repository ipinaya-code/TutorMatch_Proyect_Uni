# 🎓 TutorMatch — Sistema Recomendador Inteligente con Redes Neuronales
### Recomendación de Tutores y Revisores para Proyectos de Grado
**Escuela Militar de Ingeniería (EMI) · Unidad Académica Cochabamba · Ingeniería de Sistemas**

Plataforma Web Progresiva (**PWA**) para celular y laptop que analiza temas tentativos de proyecto de grado de estudiantes de **8vo y 9no semestre**, recomendando mediante **Redes Neuronales / NLP** a los docentes tutores más aptos y designando automáticamente al comité de docentes revisores al ser aceptado el tema.

---

## 🎯 1. Definición del Proyecto y Objetivos

### ¿Qué problema queremos solucionar?
Encontrar un **Docente apto según el tema propuesto o tentativo del estudiante**. Se busca erradicar el mal asesoramiento o desorientación en el proyecto de grado originado cuando la temática de tesis no corresponde a la especialidad o fuerte del docente tutor.

### ¿Cuál es nuestro objetivo principal?
* Conseguir que el sistema basado en **Redes Neuronales / Procesamiento de Lenguaje Natural (NLP)** recomiende al estudiante de Ingeniería de Sistemas cuál es el docente tutor más idóneo según su tema tentativo.
* Recomendar y designar automáticamente al comité de **Docentes Revisores** una vez que el tutor acepte formalmente la tutoría.
* **Aclaración de alcance:** *El sistema NO realiza seguimiento de clases del tutor con el estudiante*; su propósito es el emparejamiento inteligente, formalización con PDF y designación de revisores.

---

## 👥 2. Público Objetivo y Responsabilidades

1. **Estudiantes (8vo y 9no semestre):**
   * Ingresan al sistema mediante su **Correo Institucional** (ej: `ipinayav@est.emi.edu.bo`) y su **Código SAGA** como contraseña (ej: `C11368-9`).
   * Disponen de una caja de texto donde ingresan el **título tentativo del proyecto de grado** que están planificando.
   * La Red Neuronal analiza el título, extrae palabras clave técnicas (ej: *IA, Arquitectura MVC, Automatización*) y calcula la afinidad con los docentes.
   * El estudiante elige al docente más conveniente y adjunta su **documento formal en PDF**.
   * Una vez enviado el documento, corre un **plazo reglamentario de 72 horas** para saber si el docente acepta o no.
   * Si el docente no responde en 72 horas o rechaza el tema, el sistema le notifica al estudiante para que postule con otro tutor.

2. **Docentes (Tutores de Grado):**
   * Cuentan con un perfil donde se registran los cursos que dictan, sus especialidades, trayectoria y certificaciones.
   * Disponen de un **Buzón de Mensajería / Avisos** donde reciben los proyectos tentativos de los estudiantes con su documento PDF adjunto.
   * Tienen la facultad de **Aceptar** o **Rechazar** la propuesta de tesis.
   * **Regla reglamentaria:** Un docente solo puede tener **máximo 3 pupilos** de grado simultáneos.

3. **Docentes Revisores:**
   * En cuanto el docente tutor acepta la propuesta del estudiante, el algoritmo de Red Neuronal recomienda y designa automáticamente a **2 Docentes Revisores** afines al tema propuesto (excluyendo al tutor para evitar conflicto de roles).

---

## 🧠 3. Modelo de Redes Neuronales y NLP

1. **Tokenización y Extracción de Descriptores Técnicos:**
   * El modelo extrae términos clave descartando palabras vacías (stopwords).
   * *Ejemplo:* Entrada: `"Sistema de Automatización con IA para el caso de estudio Restaurante Kindomg Armando una Arquitectura MVC"`
   * *Tokens extraídos:* `[IA, Automatización, Arquitectura, MVC, Restaurante]`.
2. **Capa Semántica y Similitud Coseno:**
   * Proyección en espacio vectorial TF-IDF / Embeddings cruzando los tokens del proyecto con las especialidades y cursos dictados por la plana docente.
   * Generación de porcentaje de afinidad técnica en tiempo real.
3. **Visualización 3D Interactiva (Three.js / React Three Fiber):**
   * Gráfica frontal de la Red Neuronal Artificial: Capa de Entrada (Tokens) ➔ Capa Oculta (Pesos sinápticos / TF-IDF) ➔ Capa de Salida (Docentes Afines).
   * Animación continua de paquetes de energía / pulsos viajando entre capas.

---

## 🚀 4. ¿Cómo se corre el proyecto?

### A. Base de Datos y Backend (Docker)
1. Abre la aplicación **Docker Desktop** en tu computadora (asegúrate de que el motor esté corriendo).
2. En una terminal en la carpeta raíz del proyecto, ejecuta:
   ```powershell
   cd TutorMatch
   docker-compose up --build
   ```
3. Verifica los servicios activos en tu navegador:
   * **Documentación interactiva Swagger API:** [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Comprobación de salud y conexión BD:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
   * **Listar docentes con perfil:** [http://localhost:8000/api/v1/docentes](http://localhost:8000/api/v1/docentes)

### B. Frontend PWA (React + Vite + Tailwind CSS)
1. En una segunda terminal, navega a la carpeta de la PWA:
   ```powershell
   cd TutorMatch\pwa-tutorias
   npm install       # Solo la primera vez si no tienes node_modules
   npm run dev
   ```
2. Abre la URL local: **[http://localhost:5173/html/index.html](http://localhost:5173/html/index.html)**.

---

## 🔑 5. Cuentas de Prueba Oficiales (Documento EMI)

| Rol | Correo Institucional | Código SAGA (Contraseña) | Especialidad / Semestre |
| :--- | :--- | :--- | :--- |
| **Estudiante** | `ipinayav@est.emi.edu.bo` | `C11368-9` | 8vo Semestre · Ing. de Sistemas |
| **Docente Tutor** | `rmendoza@adm.emi.edu.bo` | `DOC-8821` | IA, Machine Learning, Automatización |
| **Docente Tutor** | `psoria@adm.emi.edu.bo` | `DOC-9412` | Arquitectura de Software, MVC, Cloud |
| **Docente Tutor** | `cfernandez@adm.emi.edu.bo` | `DOC-7319` | Bases de Datos, Ciberseguridad, Redes |

---

## 🐳 6. Servicios Orquestados en Docker Desktop

| Contenedor | Imagen | Puerto | Descripción |
| :--- | :--- | :--- | :--- |
| **`tutormatch_postgres`** | `postgres:15-alpine` | `5432:5432` | Base de datos relacional PostgreSQL con esquema relacional (`usuarios`, `docente_perfiles`, `proyectos_grado`, `proyecto_revisores`, `notificaciones`). |
| **`tutormatch_api`** | `Python 3.11-slim` | `8000:8000` | API REST en FastAPI con motor NLP y recarga en vivo (`--reload`). |

---

## 📁 7. Estructura de Carpetas del Proyecto

```text
Proyect_TutorMatch/
│
├── README.md                           # Documentación principal del sistema
├── readme_trabajados.md                # Bitácora cronológica de avances por fechas
├── diagramas/                          # Diagramas UML y de Arquitectura
├── documentacion/                      # Requisitos y especificaciones en Word/PDF
│
└── TutorMatch/
    ├── docker-compose.yml              # Orquestador Docker (PostgreSQL 15 + FastAPI)
    │
    ├── backend/                        # Backend API REST en Python
    │   ├── Dockerfile
    │   ├── requirements.txt            # FastAPI, Uvicorn, scikit-learn, psycopg2, pydantic
    │   ├── main.py                     # Enrutador principal de endpoints REST (/api/v1/...)
    │   ├── conexion.py                 # Conexión limpia a PostgreSQL
    │   ├── init_db/
    │   │   └── 01_init.sql             # Tablas: usuarios, docente_perfiles, proyectos_grado, proyecto_revisores
    │   └── servicios/
    │       ├── usuarios.py             # Login SAGA institucional y gestión de perfiles
    │       ├── recomendador_neuronal.py# NLP: Extracción de tokens, TF-IDF y afinidad semántica
    │       └── proyectos.py            # Gestión de propuestas, plazo 72h y asignación de revisores
    │
    └── pwa-tutorias/                   # Frontend PWA (React 18 + Vite + Tailwind CSS)
        ├── package.json
        ├── html/index.html             # Punto de entrada HTML
        ├── css/                        # Estilos y animaciones
        └── js/
            ├── components/
            │   ├── NeuralNetwork3D.jsx # Visualizador 3D frontal de la Red Neuronal (Three.js)
            │   ├── FlowPipeline.jsx    # Pipeline interactivo de 5 etapas
            │   └── Brand.jsx
            ├── pages/
            │   ├── public/             # Landing page con explicación del modelo y problemática
            │   ├── student/
            │   │   └── StudentPanel.jsx# Interfaz estudiante: red 3D, recálculo y subida de PDF
            │   └── tutor/
            │       └── TutorPanel.jsx  # Buzón de proyectos (72h), límite 3 pupilos, CV y horarios
            ├── store/                  # Estado de sesión y datos sincronizados
            └── utils/
                └── api.js              # Cliente fetch hacia la API REST
```

---

## 🛠️ Tecnologías Empleadas
* **Frontend:** React 18, Vite, Three.js, React Three Fiber, Tailwind CSS, Framer Motion, Anime.js, PWA Service Workers.
* **Backend:** Python 3.11, FastAPI, Uvicorn, Scikit-learn (NLP / Vectorización TF-IDF / Similitud Coseno), Pydantic, Psycopg2.
* **Base de Datos:** PostgreSQL 15 Alpine.
* **Infraestructura:** Docker Desktop, Docker Compose.
