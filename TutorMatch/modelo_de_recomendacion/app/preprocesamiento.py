"""
preprocesamiento.py — Limpieza de texto (NLP en español), construcción
de vocabulario indexado y conversión de títulos a tensores de longitud
fija.  No utiliza librerías externas de NLP: todo es Python puro +
PyTorch.
"""

import json
import re
import unicodedata
from typing import Dict, List, Tuple

import torch

from app.config import MAX_SEQ_LENGTH

# ────────────────────────────────────────────────────────────────
# STOPWORDS EN ESPAÑOL  (conjunto compacto; se excluyen términos
# técnicos clave que el modelo necesita conservar)
# ────────────────────────────────────────────────────────────────
STOPWORDS_ES = {
    "de", "del", "la", "las", "el", "los", "un", "una", "unos", "unas",
    "y", "o", "u", "e", "en", "con", "por", "para", "a", "al", "ante",
    "bajo", "como", "contra", "desde", "durante", "entre", "hacia",
    "hasta", "mediante", "segun", "sin", "sobre", "tras", "que", "es",
    "su", "sus", "se", "lo", "le", "les", "nos", "me", "mi", "mas",
    "pero", "si", "no", "ni", "ya", "muy", "este", "esta", "estos",
    "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "ser",
    "estar", "haber", "tener", "hacer", "poder", "deber", "ir",
    "saber", "ver", "dar", "cada", "todo", "toda", "todos", "todas",
    "otro", "otra", "otros", "otras", "mismo", "misma", "tal",
    "tan", "tanto", "cuando", "donde", "quien", "cual", "cuyo",
    "ha", "han", "fue", "son", "era", "fueron", "sido", "siendo",
}

# Términos técnicos cortos que NO deben eliminarse
TERMINOS_TECNICOS = {
    "web", "ia", "sql", "red", "api", "3d", "iot", "gps", "qr",
    "vpn", "tcp", "ip", "udp", "dns", "ssh", "ssl", "tls", "nfc",
    "rfid", "usb", "ram", "rom", "cpu", "gpu", "sdn", "lan", "wan",
    "vlan", "dhcp", "mqtt", "http", "grpc", "spa", "pwa", "ux", "ui",
    "erp", "crm", "etl", "olap", "acid", "jwt", "oauth", "sso",
    "ci", "cd", "mlops", "nlp", "ocr", "cnn", "rnn", "lstm", "bert",
    "yolo", "siem", "ids", "ips", "arp", "bgp", "ospf", "mpls",
    "qos", "dmarc", "spf", "dkim", "pdf", "csv", "json", "xml",
    "rest", "soap", "2d",
}

# ────────────────────────────────────────────────────────────────
# FUNCIONES DE LIMPIEZA DE TEXTO
# ────────────────────────────────────────────────────────────────

def quitar_acentos(texto: str) -> str:
    """Remueve acentos / diacríticos, conservando la ñ."""
    resultado = []
    for char in unicodedata.normalize("NFD", texto):
        cat = unicodedata.category(char)
        if cat == "Mn":  # Marca no-espaciadora (acento)
            continue
        resultado.append(char)
    return "".join(resultado)


def limpiar_texto(texto: str) -> List[str]:
    """Pipeline completo de limpieza de un título de proyecto.
    Devuelve una lista de tokens limpios."""
    texto = texto.lower()
    texto = quitar_acentos(texto)
    # Eliminar signos de puntuación (conservar alfanuméricos y espacios)
    texto = re.sub(r"[^a-z0-9\s]", " ", texto)
    # Colapsar espacios múltiples
    texto = re.sub(r"\s+", " ", texto).strip()

    tokens = texto.split()
    # Filtrar stopwords, pero conservar términos técnicos
    tokens_filtrados = [
        t for t in tokens
        if t in TERMINOS_TECNICOS or t not in STOPWORDS_ES
    ]
    return tokens_filtrados


# ────────────────────────────────────────────────────────────────
# VOCABULARIO
# ────────────────────────────────────────────────────────────────

PAD_TOKEN = "<PAD>"
UNK_TOKEN = "<UNK>"
PAD_IDX = 0
UNK_IDX = 1


def construir_vocabulario(corpus: List[List[str]]) -> Dict[str, int]:
    """Construye un vocabulario {token: índice} a partir de un corpus
    ya tokenizado.  Reserva <PAD>=0 y <UNK>=1."""
    vocab: Dict[str, int] = {PAD_TOKEN: PAD_IDX, UNK_TOKEN: UNK_IDX}
    idx = 2
    for tokens in corpus:
        for t in tokens:
            if t not in vocab:
                vocab[t] = idx
                idx += 1
    return vocab


def tokens_a_indices(tokens: List[str], vocab: Dict[str, int]) -> List[int]:
    """Convierte una lista de tokens en una lista de índices
    numéricos usando el vocabulario dado."""
    return [vocab.get(t, UNK_IDX) for t in tokens]


def pad_secuencia(indices: List[int], max_len: int = MAX_SEQ_LENGTH) -> List[int]:
    """Trunca o rellena con PAD_IDX para alcanzar `max_len`."""
    if len(indices) >= max_len:
        return indices[:max_len]
    return indices + [PAD_IDX] * (max_len - len(indices))


def texto_a_tensor(texto: str, vocab: Dict[str, int]) -> torch.LongTensor:
    """Pipeline completo: texto crudo → tensor de longitud fija."""
    tokens = limpiar_texto(texto)
    indices = tokens_a_indices(tokens, vocab)
    padded = pad_secuencia(indices)
    return torch.LongTensor(padded)


# ────────────────────────────────────────────────────────────────
# PERSISTENCIA DEL VOCABULARIO
# ────────────────────────────────────────────────────────────────

def guardar_vocabulario(vocab: Dict[str, int], ruta: str) -> None:
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)


def cargar_vocabulario(ruta: str) -> Dict[str, int]:
    with open(ruta, "r", encoding="utf-8") as f:
        return json.load(f)

