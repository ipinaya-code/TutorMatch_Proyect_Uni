"""
dataset.py — Dataset personalizado de PyTorch y utilidades para
cargar, particionar y preparar los datos de entrenamiento a partir
del CSV de tutores especializados.
"""

import json
import random
from typing import Dict, List, Tuple

import pandas as pd
import torch
from torch.utils.data import Dataset

from app.config import CSV_PATH, MAX_SEQ_LENGTH, SEED, VAL_SPLIT
from app.preprocesamiento import (
    construir_vocabulario,
    limpiar_texto,
    pad_secuencia,
    tokens_a_indices,
)


# ────────────────────────────────────────────────────────────────
# LABEL ENCODER MANUAL  (sin sklearn para el guardado)
# ────────────────────────────────────────────────────────────────

def crear_label_encoder(etiquetas: List[str]) -> Tuple[Dict[str, int], Dict[int, str]]:
    """Crea un mapeo determinista etiqueta → índice y su inverso."""
    clases_unicas = sorted(set(etiquetas))
    etiqueta_a_idx = {e: i for i, e in enumerate(clases_unicas)}
    idx_a_etiqueta = {i: e for e, i in etiqueta_a_idx.items()}
    return etiqueta_a_idx, idx_a_etiqueta


def guardar_label_encoder(etiqueta_a_idx: Dict[str, int], ruta: str) -> None:
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(etiqueta_a_idx, f, ensure_ascii=False, indent=2)


def cargar_label_encoder(ruta: str) -> Tuple[Dict[str, int], Dict[int, str]]:
    with open(ruta, "r", encoding="utf-8") as f:
        etiqueta_a_idx = json.load(f)
    idx_a_etiqueta = {int(i): e for e, i in etiqueta_a_idx.items()}
    return etiqueta_a_idx, idx_a_etiqueta


# ────────────────────────────────────────────────────────────────
# MAPEO DE ESPECIALIDADES POR TUTOR
# ────────────────────────────────────────────────────────────────

def extraer_especialidades(df: pd.DataFrame) -> Dict[str, List[str]]:
    """Devuelve {nombre_tutor: [esp1, esp2, …]} desde el CSV."""
    mapa: Dict[str, List[str]] = {}
    for _, row in df.iterrows():
        tutor = row["Nombre_Tutor"].strip()
        if tutor not in mapa:
            esps = [e.strip() for e in row["Especialidad"].split(";")]
            mapa[tutor] = esps
    return mapa


def guardar_especialidades(mapa: Dict[str, List[str]], ruta: str) -> None:
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(mapa, f, ensure_ascii=False, indent=2)


def cargar_especialidades(ruta: str) -> Dict[str, List[str]]:
    with open(ruta, "r", encoding="utf-8") as f:
        return json.load(f)


# ────────────────────────────────────────────────────────────────
# DATASET DE PYTORCH
# ────────────────────────────────────────────────────────────────

class TutoresDataset(Dataset):
    """Dataset que entrega pares (tensor_titulo, etiqueta_tutor)."""

    def __init__(
        self,
        textos_tokenizados: List[List[str]],
        etiquetas: List[int],
        vocab: Dict[str, int],
        max_len: int = MAX_SEQ_LENGTH,
    ):
        self.datos: List[Tuple[torch.LongTensor, int]] = []
        for tokens, etiq in zip(textos_tokenizados, etiquetas):
            indices = tokens_a_indices(tokens, vocab)
            padded = pad_secuencia(indices, max_len)
            tensor = torch.LongTensor(padded)
            self.datos.append((tensor, etiq))

    def __len__(self) -> int:
        return len(self.datos)

    def __getitem__(self, idx: int) -> Tuple[torch.LongTensor, int]:
        return self.datos[idx]


# ────────────────────────────────────────────────────────────────
# FUNCIÓN PRINCIPAL DE CARGA Y PARTICIÓN
# ────────────────────────────────────────────────────────────────

def cargar_y_preparar_datos(
    csv_path: str = CSV_PATH,
    val_split: float = VAL_SPLIT,
    seed: int = SEED,
) -> Tuple[
    TutoresDataset,
    TutoresDataset,
    Dict[str, int],
    Dict[str, int],
    Dict[int, str],
    Dict[str, List[str]],
    int,
]:
    """Carga el CSV, construye vocabulario, divide train/val y
    devuelve los datasets de PyTorch junto con metadatos.

    Returns:
        (train_ds, val_ds, vocab, etiq_a_idx, idx_a_etiq,
         mapa_especialidades, num_clases)
    """
    df = pd.read_csv(csv_path)

    # Limpiar y tokenizar todos los títulos
    titulos_raw = df["Titulo_Proyecto"].tolist()
    titulos_tokenizados = [limpiar_texto(t) for t in titulos_raw]

    # Construir vocabulario determinista (orden de aparición en el CSV)
    vocab = construir_vocabulario(titulos_tokenizados)

    # Label encoding
    tutores = df["Nombre_Tutor"].str.strip().tolist()
    etiq_a_idx, idx_a_etiq = crear_label_encoder(tutores)
    etiquetas_int = [etiq_a_idx[t] for t in tutores]

    # Mapa de especialidades
    mapa_esp = extraer_especialidades(df)

    # Partición train/val estratificada y determinista
    indices = list(range(len(titulos_tokenizados)))
    random.seed(seed)
    random.shuffle(indices)

    corte = int(len(indices) * (1 - val_split))
    idx_train = sorted(indices[:corte])
    idx_val = sorted(indices[corte:])

    tokens_train = [titulos_tokenizados[i] for i in idx_train]
    etiq_train = [etiquetas_int[i] for i in idx_train]
    tokens_val = [titulos_tokenizados[i] for i in idx_val]
    etiq_val = [etiquetas_int[i] for i in idx_val]

    train_ds = TutoresDataset(tokens_train, etiq_train, vocab)
    val_ds = TutoresDataset(tokens_val, etiq_val, vocab)

    num_clases = len(etiq_a_idx)

    return (train_ds, val_ds, vocab, etiq_a_idx, idx_a_etiq,
            mapa_esp, num_clases)

