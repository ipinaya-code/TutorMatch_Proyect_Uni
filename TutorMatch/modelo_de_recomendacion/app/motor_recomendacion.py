"""
motor_recomendacion.py — Motor de post-procesamiento que, dada la
salida Softmax de la red neuronal, produce un ranking Top‑3 de
tutores equilibrado, multidisciplinario y con filtro de cupos.
"""

import json
import os
from typing import Any, Dict, List, Tuple

import torch
import torch.nn.functional as F

from app.config import MAX_PUPILOS, TOP_K, UMBRAL_RELEVANCIA
from app.preprocesamiento import limpiar_texto, texto_a_tensor


# ────────────────────────────────────────────────────────────────
# GESTIÓN DE CUPOS (estado_docentes.json)
# ────────────────────────────────────────────────────────────────

def cargar_estado_docentes(ruta: str) -> Dict[str, Any]:
    """Carga el JSON de estado de cupos de los docentes."""
    if not os.path.exists(ruta):
        return {}
    with open(ruta, "r", encoding="utf-8") as f:
        return json.load(f)


def docente_tiene_cupo(estado: Dict[str, Any], nombre: str) -> bool:
    """True si el docente tiene menos de MAX_PUPILOS asignados."""
    info = estado.get(nombre, {})
    return info.get("pupilos_asignados", 0) < MAX_PUPILOS


def cupos_disponibles(estado: Dict[str, Any], nombre: str) -> int:
    """Retorna el número de cupos disponibles del docente."""
    info = estado.get(nombre, {})
    asignados = info.get("pupilos_asignados", 0)
    return max(0, MAX_PUPILOS - asignados)


# ────────────────────────────────────────────────────────────────
# ANÁLISIS DE SUB‑FRAGMENTOS (n‑gramas del título)
# ────────────────────────────────────────────────────────────────

def generar_subfragmentos(tokens: List[str], min_n: int = 2, max_n: int = 5) -> List[List[str]]:
    """Genera sub‑listas de tokens consecutivos (n‑gramas) para
    evaluar la afinidad del modelo con partes específicas del título."""
    fragmentos = []
    for n in range(min_n, min(max_n + 1, len(tokens) + 1)):
        for i in range(len(tokens) - n + 1):
            fragmentos.append(tokens[i : i + n])
    return fragmentos


# ────────────────────────────────────────────────────────────────
# MOTOR PRINCIPAL DE RECOMENDACIÓN
# ────────────────────────────────────────────────────────────────

def recomendar_tutores(
    titulo: str,
    modelo: torch.nn.Module,
    vocab: Dict[str, int],
    idx_a_etiqueta: Dict[int, str],
    mapa_especialidades: Dict[str, List[str]],
    estado_docentes: Dict[str, Any],
    top_k: int = TOP_K,
    umbral: float = UMBRAL_RELEVANCIA,
) -> List[Dict[str, Any]]:
    """
    Dado un título de proyecto, produce un ranking Top‑K equilibrado
    y multidisciplinario de tutores recomendados.

    Algoritmo:
    1. Obtener probabilidades globales del título completo (Softmax).
    2. Obtener probabilidades de sub‑fragmentos del título.
    3. Para cada tutor, calcular una puntuación combinada.
    4. Aplicar filtro de cupos (descartar ≥ 3 pupilos).
    5. Seleccionar Top 1 por afinidad global.
    6. Para puestos 2 y 3, penalizar tutores cuyas especialidades
       ya estén cubiertas, priorizando cobertura complementaria.
    """
    modelo.eval()

    # ── 1. Probabilidades globales ──
    tensor_titulo = texto_a_tensor(titulo, vocab).unsqueeze(0)
    with torch.no_grad():
        logits_global = modelo(tensor_titulo)
        probs_global = F.softmax(logits_global, dim=1).squeeze(0)

    # ── 2. Probabilidades por sub‑fragmentos ──
    tokens_titulo = limpiar_texto(titulo)
    fragmentos = generar_subfragmentos(tokens_titulo)

    # Acumular las probabilidades de cada fragmento
    probs_fragmentos = torch.zeros_like(probs_global)
    if fragmentos:
        for frag in fragmentos:
            from app.preprocesamiento import pad_secuencia, tokens_a_indices
            indices = tokens_a_indices(frag, vocab)
            padded = pad_secuencia(indices)
            t = torch.LongTensor(padded).unsqueeze(0)
            with torch.no_grad():
                logits_frag = modelo(t)
                p = F.softmax(logits_frag, dim=1).squeeze(0)
            probs_fragmentos += p
        probs_fragmentos /= len(fragmentos)

    # Puntuación combinada: 70 % global + 30 % sub‑fragmentos
    puntuacion = 0.7 * probs_global + 0.3 * probs_fragmentos

    # ── 3. Construir lista candidata con filtro de cupos y umbral ──
    candidatos = []
    for idx in range(len(puntuacion)):
        nombre = idx_a_etiqueta[idx]
        prob = puntuacion[idx].item()
        prob_global_val = probs_global[idx].item()

        if prob < umbral:
            continue
        if not docente_tiene_cupo(estado_docentes, nombre):
            continue

        candidatos.append({
            "nombre": nombre,
            "puntuacion": prob,
            "prob_global": prob_global_val,
            "especialidades": mapa_especialidades.get(nombre, []),
            "cupos_disponibles": cupos_disponibles(estado_docentes, nombre),
        })

    # Ordenar por puntuación descendente
    candidatos.sort(key=lambda c: c["puntuacion"], reverse=True)

    if not candidatos:
        return []

    # ── 4. Selección balanceada multidisciplinaria ──
    seleccionados: List[Dict[str, Any]] = []
    especialidades_cubiertas: set = set()

    for candidato in candidatos:
        if len(seleccionados) >= top_k:
            break

        esps_candidato = set(candidato["especialidades"])

        if len(seleccionados) == 0:
            # Puesto #1: el de mayor afinidad global
            seleccionados.append(candidato)
            especialidades_cubiertas.update(esps_candidato)
        else:
            # Puestos #2 y #3: priorizar especialidades complementarias
            esps_nuevas = esps_candidato - especialidades_cubiertas
            if esps_nuevas:
                # Aporta áreas nuevas → priorizar
                seleccionados.append(candidato)
                especialidades_cubiertas.update(esps_candidato)
            else:
                # No aporta áreas nuevas; lo consideramos solo si no
                # quedan candidatos con áreas complementarias
                pass

    # Si no llenamos top_k con candidatos complementarios, rellenar
    # con los de mayor puntuación restantes
    if len(seleccionados) < top_k:
        nombres_seleccionados = {s["nombre"] for s in seleccionados}
        for candidato in candidatos:
            if len(seleccionados) >= top_k:
                break
            if candidato["nombre"] not in nombres_seleccionados:
                seleccionados.append(candidato)
                nombres_seleccionados.add(candidato["nombre"])

    # ── 5. Formatear resultados ──
    resultados = []
    for i, sel in enumerate(seleccionados, 1):
        # Normalizar la puntuación al rango [0, 100] relativo al máx.
        max_punt = seleccionados[0]["puntuacion"] if seleccionados else 1.0
        afinidad_pct = (sel["puntuacion"] / max_punt) * 100 if max_punt > 0 else 0

        resultados.append({
            "puesto": i,
            "nombre": sel["nombre"],
            "afinidad_porcentaje": round(afinidad_pct, 2),
            "probabilidad_raw": round(sel["puntuacion"] * 100, 4),
            "especialidades": sel["especialidades"],
            "cupos_disponibles": sel["cupos_disponibles"],
        })

    return resultados


# ────────────────────────────────────────────────────────────────
# FORMATEO PARA IMPRESIÓN EN CONSOLA
# ────────────────────────────────────────────────────────────────

def formatear_resultado(resultado: List[Dict[str, Any]], titulo: str) -> str:
    """Genera una cadena legible con el resultado de la recomendación."""
    lineas = [
        "",
        "═" * 70,
        "  SISTEMA DE RECOMENDACIÓN DE TUTORES",
        "═" * 70,
        f"  Título del Proyecto:",
        f"  \"{titulo}\"",
        "─" * 70,
    ]

    if not resultado:
        lineas.append("  ⚠  No se encontraron tutores disponibles.")
        lineas.append("═" * 70)
        return "\n".join(lineas)

    for r in resultado:
        lineas.append(f"  🏅 Puesto #{r['puesto']}: {r['nombre']}")
        lineas.append(f"     Afinidad:       {r['afinidad_porcentaje']:.2f} %")
        lineas.append(f"     Prob. raw:      {r['probabilidad_raw']:.4f} %")
        lineas.append(f"     Especialidades: {', '.join(r['especialidades'])}")
        lineas.append(f"     Cupos libres:   {r['cupos_disponibles']} / {MAX_PUPILOS}")
        lineas.append("─" * 70)

    # Resumen de cobertura
    todas_esps = set()
    for r in resultado:
        todas_esps.update(r["especialidades"])
    lineas.append(f"  📚 Áreas cubiertas por el equipo recomendado:")
    for esp in sorted(todas_esps):
        lineas.append(f"     • {esp}")
    lineas.append("═" * 70)

    return "\n".join(lineas)

