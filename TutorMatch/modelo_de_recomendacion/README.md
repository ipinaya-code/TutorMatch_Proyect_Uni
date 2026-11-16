# Sistema Inteligente de Recomendación de Tutores de Grado

Sistema de Machine Learning y Procesamiento de Lenguaje Natural (NLP) desarrollado en **PyTorch** y contenedorizado con **Docker**, diseñado para recomendar un equipo equilibrado de tutores para proyectos de grado en Ingeniería de Sistemas, garantizando **reproducibilidad determinista exacta** entre cualquier computadora.

---

## Características Principales

- **Reproducibilidad Exacta:** Fijación estricta de semillas (`seed=42`) en `random`, `numpy` y `torch.use_deterministic_algorithms(True)`, asegurando métricas, pesos de la red y particiones de datos idénticas en cualquier entorno (CPU).
- **NLP en Python Puro / PyTorch:** Limpieza, normalización NFD, eliminación de stopwords en español conservando términos técnicos críticos (`ia`, `web`, `sql`, `api`, `3d`, `red`, etc.) y construcción de vocabulario determinista con padding a tensor de longitud fija ($35$).
- **Arquitectura de Red Neuronal Híbrida:**
  - Capa de **Embedding** densa ($64$ dims).
  - Rama **CNN Multi-Kernel** (filtros de tamaño $2, 3$ y $4$) para detección de n-gramas locales.
  - Rama **LSTM Bidireccional** ($128$ unidades) para modelar dependencias secuenciales globales.
  - Clasificador denso con **Dropout** para mitigar overfitting.
- **Motor de Recomendación Multidisciplinario y de Disponibilidad:**
  - **Filtro estricto de cupos:** Máximo 3 pupilos por tutor consultando `estado_docentes.json`.
  - **Doble evaluación semántica:** Combina probabilidad global con análisis de sub-fragmentos del título.
  - **Balance de Especialidades:** Penaliza docentes redundantes en el Top 3 y prioriza perfiles complementarios que cubran todas las disciplinas involucradas en el proyecto.
- **Doble Modo de Inferencia:** Modo consola interactiva y servidor **API REST (FastAPI + Swagger)**.
- **Docker y Docker Compose:** Listo para desplegar con un solo comando.

---

## Estructura del Repositorio

```text
entrenamiento_modelo_IA/
├── .env                              # Variables de entorno activas
├── .env.example                      # Plantilla de variables de entorno
├── .gitignore                        # Reglas de exclusión para Git
├── .dockerignore                     # Optimización de contexto Docker
├── Dockerfile                        # Imagen Docker basada en python:3.11-slim
├── docker-compose.yml                # Orquestación con persistencia de volúmenes
├── requirements.txt                  # Dependencias con versiones fijadas
├── entrenar.py                       # Script principal de entrenamiento y exportación
├── recomendar.py                     # CLI interactivo y servidor API REST
├── app/                              # Módulos del sistema
│   ├── __init__.py
│   ├── config.py                     # Configuración central y lectura de .env
│   ├── reproducibilidad.py           # Fijación de semillas deterministas
│   ├── preprocesamiento.py           # Pipeline NLP en Python puro y PyTorch
│   ├── dataset.py                    # Dataset de PyTorch y DataLoaders
│   ├── modelo.py                     # Arquitectura CNN + BiLSTM
│   └── motor_recomendacion.py        # Post-procesamiento, cupos y balanceo
├── datos/                            # Datos y persistencia de estado
│   ├── dataset_tutores_especializados.csv # 600 registros / 15 tutores
│   └── estado_docentes.json          # Cupos asignados por docente
├── artefactos/                       # Pesos y artefactos generados
│   ├── modelo_tutores.pth            # Pesos del modelo PyTorch
│   ├── vocabulario.json              # Mapeo token -> ID
│   ├── label_encoder.json            # Mapeo tutor -> ID
│   ├── especialidades_por_tutor.json # Áreas de dominio por docente
│   └── metricas_entrenamiento.json   # Historial y precisión del entrenamiento
├── docs/                             # Documentación técnica y diagramas
│   └── diagramas_datos.md            # Diagramas de flujo y arquitectura Mermaid
└── tests/                            # Suite de pruebas unitarias
    ├── __init__.py
    ├── test_dataset.py               # Validación de integridad y balance del CSV
    ├── test_preprocesamiento.py      # Pruebas del pipeline NLP y tensores
    └── test_motor_recomendacion.py   # Validación de cupos y balance multidisciplinario
```

---

## Requisitos Previos

- **Python 3.11+**
- O alternativamente **Docker Desktop**

---

## Guía de Instalación y Uso Local

### 1. Clonar el repositorio y configurar variables de entorno
```bash
cp .env.example .env
```

### 2. Crear entorno virtual e instalar dependencias
```bash
python -m venv .venv

# En Windows (PowerShell):
.venv\Scripts\Activate.ps1

# En Linux/macOS:
source .venv/bin/activate

# Instalar PyTorch CPU y dependencias exactas:
pip install torch==2.1.2 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

### 3. Ejecutar la Suite de Pruebas Unitarias
Para validar que todo el sistema, datos y algoritmos cumplen con las especificaciones:
```bash
python -m unittest discover -s tests -p "test_*.py"
```

### 4. Entrenar el Modelo
Genera el modelo reproducibilidad determinista (`seed=42`) y guarda todos los artefactos:
```bash
python entrenar.py
```
*Salida esperada:*
- Exactitud en Train: **100%**
- Exactitud en Validación: **~74.4%**
- Artefactos exportados en `./artefactos/`

### 5. Probar Recomendaciones

#### Modo Consola Interactiva:
```bash
python recomendar.py
```

#### Modo Servidor API REST:
```bash
python recomendar.py --api
```
Una vez iniciado, accede a:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Ejecución con Docker (Producción)

Para compilar y levantar el servicio en un solo paso:

```bash
docker compose up --build
```

El contenedor:
1. Instala PyTorch CPU optimizado.
2. Ejecuta el entrenamiento determinista si no existen los artefactos.
3. Expone la API REST en el puerto `8000`.
4. Mantiene mapeados los volúmenes `./datos` y `./artefactos` para persistencia en tu disco local.

---

## Ejemplo de Inferencia y Salida

**Entrada:**
> *"Sistema web de reconocimiento de cáncer a través de redes neuronales con base de datos PostgreSQL"*

**Resultado entregado por el motor:**
```text
══════════════════════════════════════════════════════════════════════
  SISTEMA DE RECOMENDACIÓN DE TUTORES
══════════════════════════════════════════════════════════════════════
  Título del Proyecto:
  "Sistema web de reconocimiento de cáncer a través de redes neuronales con base de datos PostgreSQL"
──────────────────────────────────────────────────────────────────────
  🏅 Puesto #1: Ing. Valeria Paredes
     Afinidad:       100.00 %
     Prob. raw:      35.7201 %
     Especialidades: Desarrollo Web, Aplicaciones Web Progresivas, Interfaces de Usuario
     Cupos libres:   3 / 3
──────────────────────────────────────────────────────────────────────
  🏅 Puesto #2: Ing. Rodrigo Vargas
     Afinidad:       55.92 %
     Prob. raw:      19.9748 %
     Especialidades: Desarrollo Movil, Programacion Multiplataforma, Geolocalizacion
     Cupos libres:   2 / 3
──────────────────────────────────────────────────────────────────────
  🏅 Puesto #3: Ing. Marcelo Quiroga
     Afinidad:       52.63 %
     Prob. raw:      18.8004 %
     Especialidades: Inteligencia Artificial, Vision Computacional, Programacion
     Cupos libres:   2 / 3
──────────────────────────────────────────────────────────────────────
  📚 Áreas cubiertas por el equipo recomendado:
     • Aplicaciones Web Progresivas
     • Desarrollo Movil
     • Desarrollo Web
     • Geolocalizacion
     • Inteligencia Artificial
     • Interfaces de Usuario
     • Programacion
     • Programacion Multiplataforma
     • Vision Computacional
══════════════════════════════════════════════════════════════════════
```

---

## Endpoint API REST

### `POST /recomendar`
**Cuerpo de la petición:**
```json
{
  "titulo": "Sistema web de reconocimiento de cancer a traves de redes neuronales con base de datos PostgreSQL"
}
```

**Respuesta HTTP 200:**
```json
{
  "titulo": "Sistema web de reconocimiento de cancer a traves de redes neuronales con base de datos PostgreSQL",
  "recomendaciones": [
    {
      "puesto": 1,
      "nombre": "Ing. Valeria Paredes",
      "afinidad_porcentaje": 100.0,
      "probabilidad_raw": 35.7201,
      "especialidades": [
        "Desarrollo Web",
        "Aplicaciones Web Progresivas",
        "Interfaces de Usuario"
      ],
      "cupos_disponibles": 3
    },
    {
      "puesto": 2,
      "nombre": "Ing. Rodrigo Vargas",
      "afinidad_porcentaje": 55.92,
      "probabilidad_raw": 19.9748,
      "especialidades": [
        "Desarrollo Movil",
        "Programacion Multiplataforma",
        "Geolocalizacion"
      ],
      "cupos_disponibles": 2
    },
    {
      "puesto": 3,
      "nombre": "Ing. Marcelo Quiroga",
      "afinidad_porcentaje": 52.63,
      "probabilidad_raw": 18.8004,
      "especialidades": [
        "Inteligencia Artificial",
        "Vision Computacional",
        "Programacion"
      ],
      "cupos_disponibles": 2
    }
  ],
  "areas_cubiertas": [
    "Aplicaciones Web Progresivas",
    "Desarrollo Movil",
    "Desarrollo Web",
    "Geolocalizacion",
    "Inteligencia Artificial",
    "Interfaces de Usuario",
    "Programacion",
    "Programacion Multiplataforma",
    "Vision Computacional"
  ]
}
```

