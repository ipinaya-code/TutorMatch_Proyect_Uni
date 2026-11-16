"""
recomendar.py — Interfaz de inferencia (consola + API REST con FastAPI).

Modos de uso:
  1) Consola interactiva:  python recomendar.py
  2) API REST:             python recomendar.py --api
     → POST /recomendar  {"titulo": "..."}

Carga el modelo entrenado y todos los artefactos, y permite hacer
consultas de recomendación de tutores.
"""

import argparse
import json
import os
import sys

# Forzar UTF-8 en Windows para evitar errores con emojis
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import torch

from app.config import (
    ESPECIALIDADES_PATH,
    ESTADO_DOCENTES_PATH,
    LABEL_ENCODER_PATH,
    MODELO_PATH,
    SEED,
    VOCABULARIO_PATH,
)
from app.reproducibilidad import fijar_semillas

# Fijar semillas para inferencia determinista
fijar_semillas(SEED)

from app.dataset import cargar_label_encoder, cargar_especialidades
from app.modelo import ClasificadorTutores
from app.motor_recomendacion import (
    cargar_estado_docentes,
    formatear_resultado,
    recomendar_tutores,
)
from app.preprocesamiento import cargar_vocabulario


# ────────────────────────────────────────────────────────────────
# CARGA DE ARTEFACTOS
# ────────────────────────────────────────────────────────────────

def cargar_modelo_y_artefactos():
    """Carga todos los artefactos necesarios para inferencia."""
    # Verificar que existen los archivos
    archivos_requeridos = [
        MODELO_PATH, VOCABULARIO_PATH, LABEL_ENCODER_PATH, ESPECIALIDADES_PATH,
    ]
    for ruta in archivos_requeridos:
        if not os.path.exists(ruta):
            print(f"❌ Error: No se encontró el archivo '{ruta}'.")
            print("   Ejecuta primero: python entrenar.py")
            sys.exit(1)

    # Vocabulario
    vocab = cargar_vocabulario(VOCABULARIO_PATH)

    # Label encoder
    etiq_a_idx, idx_a_etiq = cargar_label_encoder(LABEL_ENCODER_PATH)

    # Especialidades
    mapa_esp = cargar_especialidades(ESPECIALIDADES_PATH)

    # Estado de docentes (cupos)
    estado = cargar_estado_docentes(ESTADO_DOCENTES_PATH)

    # Modelo
    checkpoint = torch.load(MODELO_PATH, map_location="cpu", weights_only=True)
    modelo = ClasificadorTutores(
        vocab_size=checkpoint["vocab_size"],
        embedding_dim=checkpoint["embedding_dim"],
        num_filtros=checkpoint["num_filtros"],
        hidden_dim=checkpoint["hidden_dim"],
        num_clases=checkpoint["num_clases"],
        dropout=checkpoint["dropout"],
        pad_idx=0,
    )
    modelo.load_state_dict(checkpoint["model_state_dict"])
    modelo.eval()

    print("✅ Modelo y artefactos cargados correctamente.")
    return modelo, vocab, etiq_a_idx, idx_a_etiq, mapa_esp, estado


# ────────────────────────────────────────────────────────────────
# MODO CONSOLA INTERACTIVA
# ────────────────────────────────────────────────────────────────

def modo_consola(modelo, vocab, etiq_a_idx, idx_a_etiq, mapa_esp, estado):
    """Bucle interactivo para probar títulos por consola."""
    print("\n" + "═" * 70)
    print("  MODO CONSOLA — Escribe un título de proyecto y presiona Enter")
    print("  (escribe 'salir' para terminar)")
    print("═" * 70)

    while True:
        print()
        titulo = input("📝 Título del proyecto: ").strip()
        if titulo.lower() in ("salir", "exit", "q", "quit"):
            print("👋 ¡Hasta luego!")
            break
        if not titulo:
            print("⚠  Por favor ingresa un título válido.")
            continue

        # Recargar estado de docentes por si cambió
        estado_actual = cargar_estado_docentes(ESTADO_DOCENTES_PATH)

        resultado = recomendar_tutores(
            titulo=titulo,
            modelo=modelo,
            vocab=vocab,
            idx_a_etiqueta=idx_a_etiq,
            mapa_especialidades=mapa_esp,
            estado_docentes=estado_actual,
        )

        print(formatear_resultado(resultado, titulo))


# ────────────────────────────────────────────────────────────────
# MODO API REST (FastAPI)
# ────────────────────────────────────────────────────────────────

def crear_app_api(modelo, vocab, etiq_a_idx, idx_a_etiq, mapa_esp):
    """Crea y retorna la aplicación FastAPI."""
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field

    app = FastAPI(
        title="API de Recomendación de Tutores",
        description=(
            "Sistema inteligente que recomienda tutores para proyectos "
            "de grado de Ingeniería de Sistemas basado en redes neuronales."
        ),
        version="1.0.0",
    )

    class TituloRequest(BaseModel):
        titulo: str = Field(
            ...,
            min_length=5,
            description="Título tentativo del proyecto de grado.",
            json_schema_extra={
                "examples": [
                    "Sistema web de reconocimiento de cancer a traves de redes neuronales con base de datos PostgreSQL"
                ]
            },
        )

    class TutorRecomendado(BaseModel):
        puesto: int
        nombre: str
        afinidad_porcentaje: float
        probabilidad_raw: float
        especialidades: list
        cupos_disponibles: int

    class RecomendacionResponse(BaseModel):
        titulo: str
        recomendaciones: list
        areas_cubiertas: list

    @app.get("/")
    def root():
        return {
            "mensaje": "API de Recomendación de Tutores activa",
            "uso": "POST /recomendar con {\"titulo\": \"...\"}",
        }

    @app.get("/estado-docentes")
    def get_estado():
        estado = cargar_estado_docentes(ESTADO_DOCENTES_PATH)
        return estado

    @app.post("/recomendar", response_model=RecomendacionResponse)
    def post_recomendar(req: TituloRequest):
        # Recargar estado de docentes
        estado_actual = cargar_estado_docentes(ESTADO_DOCENTES_PATH)

        resultado = recomendar_tutores(
            titulo=req.titulo,
            modelo=modelo,
            vocab=vocab,
            idx_a_etiqueta=idx_a_etiq,
            mapa_especialidades=mapa_esp,
            estado_docentes=estado_actual,
        )

        if not resultado:
            raise HTTPException(
                status_code=404,
                detail="No se encontraron tutores disponibles para este título.",
            )

        areas = set()
        for r in resultado:
            areas.update(r["especialidades"])

        return RecomendacionResponse(
            titulo=req.titulo,
            recomendaciones=resultado,
            areas_cubiertas=sorted(areas),
        )

    return app


# ────────────────────────────────────────────────────────────────
# PUNTO DE ENTRADA
# ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Sistema de Recomendación de Tutores — Inferencia"
    )
    parser.add_argument(
        "--api",
        action="store_true",
        help="Iniciar en modo API REST (FastAPI + Uvicorn)",
    )
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host para el servidor API (por defecto: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Puerto para el servidor API (por defecto: 8000)",
    )
    args = parser.parse_args()

    # Cargar artefactos
    modelo, vocab, etiq_a_idx, idx_a_etiq, mapa_esp, estado = (
        cargar_modelo_y_artefactos()
    )

    if args.api:
        import uvicorn
        app = crear_app_api(modelo, vocab, etiq_a_idx, idx_a_etiq, mapa_esp)
        print(f"\n🌐 Iniciando API REST en http://{args.host}:{args.port}")
        print(f"   Documentación interactiva: http://{args.host}:{args.port}/docs")
        uvicorn.run(app, host=args.host, port=args.port)
    else:
        modo_consola(modelo, vocab, etiq_a_idx, idx_a_etiq, mapa_esp, estado)


if __name__ == "__main__":
    main()

