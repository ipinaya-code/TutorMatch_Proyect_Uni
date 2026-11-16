"""
config.py — Constantes y configuración centralizada del proyecto.
Soporta lectura directa de variables de entorno (.env) con fallbacks.
"""

import os
from pathlib import Path


def _cargar_env_manual(ruta_env: str) -> None:
    """Carga variables desde un archivo .env si existe sin requerir dependencias externas."""
    if not os.path.exists(ruta_env):
        return
    with open(ruta_env, "r", encoding="utf-8") as f:
        for linea in f:
            linea = linea.strip()
            if not linea or linea.startswith("#") or "=" not in linea:
                continue
            clave, valor = linea.split("=", 1)
            clave = clave.strip()
            valor = valor.strip().strip("'").strip('"')
            if clave not in os.environ:
                os.environ[clave] = valor


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_cargar_env_manual(os.path.join(BASE_DIR, ".env"))

# ────────────────────────────────────────────────────────────────
# SEMILLA GLOBAL
# ────────────────────────────────────────────────────────────────
SEED = int(os.getenv("SEED", "42"))

# ────────────────────────────────────────────────────────────────
# RUTAS DE ARCHIVOS
# ────────────────────────────────────────────────────────────────
DATA_DIR = os.path.join(BASE_DIR, "datos")
ARTEFACTOS_DIR = os.path.join(BASE_DIR, "artefactos")

CSV_PATH = os.path.join(DATA_DIR, "dataset_tutores_especializados.csv")
ESTADO_DOCENTES_PATH = os.path.join(DATA_DIR, "estado_docentes.json")

MODELO_PATH = os.path.join(ARTEFACTOS_DIR, "modelo_tutores.pth")
VOCABULARIO_PATH = os.path.join(ARTEFACTOS_DIR, "vocabulario.json")
LABEL_ENCODER_PATH = os.path.join(ARTEFACTOS_DIR, "label_encoder.json")
ESPECIALIDADES_PATH = os.path.join(ARTEFACTOS_DIR, "especialidades_por_tutor.json")
METRICAS_PATH = os.path.join(ARTEFACTOS_DIR, "metricas_entrenamiento.json")

# ────────────────────────────────────────────────────────────────
# HIPERPARÁMETROS DEL MODELO
# ────────────────────────────────────────────────────────────────
MAX_SEQ_LENGTH = int(os.getenv("MAX_SEQ_LENGTH", "35"))
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "64"))
HIDDEN_DIM = int(os.getenv("HIDDEN_DIM", "128"))
NUM_FILTROS_CNN = int(os.getenv("NUM_FILTROS_CNN", "64"))
DROPOUT = float(os.getenv("DROPOUT", "0.3"))
LEARNING_RATE = float(os.getenv("LEARNING_RATE", "0.001"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "32"))
EPOCHS = int(os.getenv("EPOCHS", "80"))
VAL_SPLIT = float(os.getenv("VAL_SPLIT", "0.15"))

# ────────────────────────────────────────────────────────────────
# RECOMENDACIÓN
# ────────────────────────────────────────────────────────────────
TOP_K = int(os.getenv("TOP_K", "3"))
MAX_PUPILOS = int(os.getenv("MAX_PUPILOS", "3"))
UMBRAL_RELEVANCIA = float(os.getenv("UMBRAL_RELEVANCIA", "0.02"))

# ────────────────────────────────────────────────────────────────
# SERVIDOR API
# ────────────────────────────────────────────────────────────────
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
