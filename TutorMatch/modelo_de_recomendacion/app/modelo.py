"""
modelo.py — Arquitectura de la red neuronal para clasificación de
títulos de proyecto → tutor recomendado.

Arquitectura: Embedding → Conv1D multi‑kernel → MaxPool → LSTM →
             Fully Connected → Softmax

Justificación:
  • La capa de Embedding transforma los índices del vocabulario en
    vectores densos de dimensión `embedding_dim`.
  • Tres filtros Conv1D con kernels de tamaño 2, 3 y 4 capturan
    n‑gramas de distintas longitudes (bigramas, trigramas, 4‑gramas),
    detectando patrones locales del título.
  • MaxPooling sobre la dimensión temporal extrae la activación más
    fuerte de cada filtro.
  • Una capa LSTM bidireccional captura dependencias secuenciales
    globales del título.
  • La cabeza de clasificación (FC → ReLU → Dropout → FC) proyecta
    la representación concatenada al espacio de clases (tutores).
"""

import torch
import torch.nn as nn


class ClasificadorTutores(nn.Module):
    """Red neuronal híbrida CNN + LSTM para clasificación de texto."""

    def __init__(
        self,
        vocab_size: int,
        embedding_dim: int,
        num_filtros: int,
        hidden_dim: int,
        num_clases: int,
        dropout: float = 0.3,
        pad_idx: int = 0,
    ):
        super().__init__()

        # ── Embedding ──
        self.embedding = nn.Embedding(
            num_embeddings=vocab_size,
            embedding_dim=embedding_dim,
            padding_idx=pad_idx,
        )

        # ── Conv1D multi‑kernel (n‑gramas) ──
        self.conv2 = nn.Conv1d(embedding_dim, num_filtros, kernel_size=2, padding=0)
        self.conv3 = nn.Conv1d(embedding_dim, num_filtros, kernel_size=3, padding=0)
        self.conv4 = nn.Conv1d(embedding_dim, num_filtros, kernel_size=4, padding=0)

        self.relu = nn.ReLU()
        self.dropout_cnn = nn.Dropout(dropout)

        # ── LSTM bidireccional ──
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=1,
            batch_first=True,
            bidirectional=True,
        )

        # ── Cabeza de clasificación ──
        # Entrada: 3 × num_filtros (CNN) + 2 × hidden_dim (LSTM bidi)
        feat_dim = 3 * num_filtros + 2 * hidden_dim
        self.fc1 = nn.Linear(feat_dim, hidden_dim)
        self.dropout_fc = nn.Dropout(dropout)
        self.fc2 = nn.Linear(hidden_dim, num_clases)

    # ────────────────────────────────────────────────────────────
    # Inicialización determinista de pesos
    # ────────────────────────────────────────────────────────────
    def inicializar_pesos(self) -> None:
        """Inicializa pesos con Xavier Uniform para reproducibilidad."""
        for name, param in self.named_parameters():
            if "weight" in name and param.dim() >= 2:
                nn.init.xavier_uniform_(param)
            elif "bias" in name:
                nn.init.zeros_(param)
        # El padding vector del embedding debe ser cero
        with torch.no_grad():
            self.embedding.weight[0].fill_(0)

    # ────────────────────────────────────────────────────────────
    # Forward
    # ────────────────────────────────────────────────────────────
    def forward(self, x: torch.LongTensor) -> torch.Tensor:
        """
        Args:
            x: (batch, seq_len) — índices de tokens.
        Returns:
            logits: (batch, num_clases) — puntuaciones sin normalizar.
        """
        # (batch, seq_len, emb_dim)
        emb = self.embedding(x)

        # ── Rama CNN ──
        # Conv1d espera (batch, channels, seq_len) → transponer
        emb_t = emb.permute(0, 2, 1)  # (batch, emb_dim, seq_len)

        c2 = self.relu(self.conv2(emb_t))  # (batch, num_filtros, seq-1)
        c3 = self.relu(self.conv3(emb_t))  # (batch, num_filtros, seq-2)
        c4 = self.relu(self.conv4(emb_t))  # (batch, num_filtros, seq-3)

        # Max‑pool global sobre la dimensión temporal
        p2 = c2.max(dim=2).values  # (batch, num_filtros)
        p3 = c3.max(dim=2).values
        p4 = c4.max(dim=2).values

        cnn_out = self.dropout_cnn(torch.cat([p2, p3, p4], dim=1))
        # → (batch, 3 * num_filtros)

        # ── Rama LSTM ──
        lstm_out, (hn, _) = self.lstm(emb)
        # hn: (2, batch, hidden_dim) → concatenar ambas direcciones
        lstm_feat = torch.cat([hn[0], hn[1]], dim=1)  # (batch, 2*hidden)

        # ── Concatenar y clasificar ──
        combined = torch.cat([cnn_out, lstm_feat], dim=1)
        out = self.relu(self.fc1(combined))
        out = self.dropout_fc(out)
        logits = self.fc2(out)  # (batch, num_clases)

        return logits

