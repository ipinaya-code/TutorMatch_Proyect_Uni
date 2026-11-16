"""
reproducibilidad.py — Fija TODAS las semillas y activa el modo
determinista de PyTorch para garantizar resultados idénticos en
cualquier computadora (ejecución en CPU).
"""

import os
import random

import numpy as np
import torch


def fijar_semillas(seed: int = 42) -> None:
    """Fija las semillas de random, numpy y torch, y activa el
    modo completamente determinista de PyTorch."""
    # Semillas de Python y NumPy
    random.seed(seed)
    np.random.seed(seed)

    # Semillas de PyTorch
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

    # Forzar algoritmos deterministas
    torch.use_deterministic_algorithms(True)

    # Variables de entorno para evitar no‑determinismo en bibliotecas
    os.environ["PYTHONHASHSEED"] = str(seed)
    os.environ["CUBLAS_WORKSPACE_CONFIG"] = ":4096:8"

