"""
entrenar.py — Script principal de entrenamiento.

Entrena la red neuronal ClasificadorTutores con el dataset de
600 registros, exporta el modelo (.pth), el vocabulario, el label
encoder, el mapa de especialidades y las métricas de entrenamiento.

Uso:
    python entrenar.py
"""

import json
import os
import sys
import time

# Forzar UTF-8 en Windows para evitar errores con emojis
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# ── Configuración y reproducibilidad ──
from app.config import (
    ARTEFACTOS_DIR,
    BATCH_SIZE,
    DROPOUT,
    EMBEDDING_DIM,
    EPOCHS,
    ESPECIALIDADES_PATH,
    HIDDEN_DIM,
    LABEL_ENCODER_PATH,
    LEARNING_RATE,
    MAX_SEQ_LENGTH,
    METRICAS_PATH,
    MODELO_PATH,
    NUM_FILTROS_CNN,
    SEED,
    VOCABULARIO_PATH,
)
from app.reproducibilidad import fijar_semillas

# IMPORTANTE: Fijar semillas ANTES de cualquier operación
fijar_semillas(SEED)

from app.dataset import (
    cargar_y_preparar_datos,
    guardar_label_encoder,
    guardar_especialidades,
)
from app.modelo import ClasificadorTutores
from app.preprocesamiento import guardar_vocabulario


def entrenar() -> None:
    """Función principal de entrenamiento."""
    print("=" * 70)
    print("  ENTRENAMIENTO — Sistema de Recomendación de Tutores")
    print("=" * 70)
    print(f"  Semilla: {SEED}")
    print(f"  Dispositivo: CPU (determinista)")
    print(f"  Epochs: {EPOCHS} | Batch size: {BATCH_SIZE} | LR: {LEARNING_RATE}")
    print("=" * 70)

    # ── Crear directorios ──
    os.makedirs(ARTEFACTOS_DIR, exist_ok=True)

    # ── Cargar y preparar datos ──
    print("\n📂 Cargando y preparando datos...")
    (train_ds, val_ds, vocab, etiq_a_idx, idx_a_etiq,
     mapa_esp, num_clases) = cargar_y_preparar_datos()

    print(f"   Vocabulario: {len(vocab)} tokens")
    print(f"   Clases (tutores): {num_clases}")
    print(f"   Entrenamiento: {len(train_ds)} muestras")
    print(f"   Validación: {len(val_ds)} muestras")

    # ── Guardar artefactos de preprocesamiento ──
    guardar_vocabulario(vocab, VOCABULARIO_PATH)
    guardar_label_encoder(etiq_a_idx, LABEL_ENCODER_PATH)
    guardar_especialidades(mapa_esp, ESPECIALIDADES_PATH)
    print("   ✅ Vocabulario, label encoder y especialidades guardados.")

    # ── DataLoaders ──
    # drop_last=False para no perder muestras; shuffle=False porque ya
    # barajamos al particionar (determinismo)
    g = torch.Generator()
    g.manual_seed(SEED)

    train_loader = DataLoader(
        train_ds,
        batch_size=BATCH_SIZE,
        shuffle=True,
        generator=g,
        drop_last=False,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=BATCH_SIZE,
        shuffle=False,
        drop_last=False,
    )

    # ── Crear modelo ──
    modelo = ClasificadorTutores(
        vocab_size=len(vocab),
        embedding_dim=EMBEDDING_DIM,
        num_filtros=NUM_FILTROS_CNN,
        hidden_dim=HIDDEN_DIM,
        num_clases=num_clases,
        dropout=DROPOUT,
        pad_idx=0,
    )
    # Inicializar pesos de forma determinista
    fijar_semillas(SEED)
    modelo.inicializar_pesos()

    total_params = sum(p.numel() for p in modelo.parameters())
    trainable = sum(p.numel() for p in modelo.parameters() if p.requires_grad)
    print(f"\n🧠 Modelo creado:")
    print(f"   Parámetros totales: {total_params:,}")
    print(f"   Parámetros entrenables: {trainable:,}")

    # ── Optimizador y función de pérdida ──
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(modelo.parameters(), lr=LEARNING_RATE)

    # ── Entrenamiento ──
    historial = {
        "train_loss": [],
        "val_loss": [],
        "train_acc": [],
        "val_acc": [],
    }

    mejor_val_acc = 0.0
    mejor_epoch = 0

    print("\n🚀 Iniciando entrenamiento...\n")
    inicio = time.time()

    for epoch in range(1, EPOCHS + 1):
        # ── Train ──
        modelo.train()
        total_loss = 0.0
        correctos = 0
        total = 0

        for batch_x, batch_y in train_loader:
            batch_y = batch_y.long()
            optimizer.zero_grad()
            logits = modelo(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * batch_x.size(0)
            preds = logits.argmax(dim=1)
            correctos += (preds == batch_y).sum().item()
            total += batch_x.size(0)

        train_loss = total_loss / total
        train_acc = correctos / total

        # ── Validación ──
        modelo.eval()
        val_total_loss = 0.0
        val_correctos = 0
        val_total = 0

        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_y = batch_y.long()
                logits = modelo(batch_x)
                loss = criterion(logits, batch_y)

                val_total_loss += loss.item() * batch_x.size(0)
                preds = logits.argmax(dim=1)
                val_correctos += (preds == batch_y).sum().item()
                val_total += batch_x.size(0)

        val_loss = val_total_loss / val_total
        val_acc = val_correctos / val_total

        historial["train_loss"].append(round(train_loss, 6))
        historial["val_loss"].append(round(val_loss, 6))
        historial["train_acc"].append(round(train_acc, 6))
        historial["val_acc"].append(round(val_acc, 6))

        # Guardar mejor modelo
        if val_acc > mejor_val_acc:
            mejor_val_acc = val_acc
            mejor_epoch = epoch
            torch.save({
                "model_state_dict": modelo.state_dict(),
                "vocab_size": len(vocab),
                "embedding_dim": EMBEDDING_DIM,
                "num_filtros": NUM_FILTROS_CNN,
                "hidden_dim": HIDDEN_DIM,
                "num_clases": num_clases,
                "dropout": DROPOUT,
                "max_seq_length": MAX_SEQ_LENGTH,
                "seed": SEED,
            }, MODELO_PATH)

        # Log cada 10 epochs
        if epoch % 10 == 0 or epoch == 1:
            print(
                f"  Epoch {epoch:3d}/{EPOCHS} │ "
                f"Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} │ "
                f"Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f}"
            )

    duracion = time.time() - inicio

    print(f"\n{'─' * 70}")
    print(f"  ✅ Entrenamiento completado en {duracion:.1f} segundos")
    print(f"  📈 Mejor validación: Acc = {mejor_val_acc:.4f} (epoch {mejor_epoch})")
    print(f"  💾 Modelo guardado en: {MODELO_PATH}")

    # ── Guardar métricas ──
    metricas = {
        "seed": SEED,
        "epochs": EPOCHS,
        "batch_size": BATCH_SIZE,
        "learning_rate": LEARNING_RATE,
        "mejor_val_acc": round(mejor_val_acc, 6),
        "mejor_epoch": mejor_epoch,
        "duracion_segundos": round(duracion, 2),
        "vocab_size": len(vocab),
        "num_clases": num_clases,
        "total_params": total_params,
        "historial": historial,
    }
    with open(METRICAS_PATH, "w", encoding="utf-8") as f:
        json.dump(metricas, f, ensure_ascii=False, indent=2)
    print(f"  📊 Métricas guardadas en: {METRICAS_PATH}")
    print("=" * 70)


if __name__ == "__main__":
    entrenar()

