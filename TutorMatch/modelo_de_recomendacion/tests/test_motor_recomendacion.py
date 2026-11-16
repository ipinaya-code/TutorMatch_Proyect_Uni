"""
test_motor_recomendacion.py — Valida las reglas de negocio del motor de recomendación:
1. Filtro estricto de cupos (máximo 3 pupilos).
2. Balance multidisciplinario y deduplicación de áreas.
3. Top 3 consistente.
"""

import unittest
import torch
import torch.nn as nn

from app.motor_recomendacion import (
    cupos_disponibles,
    docente_tiene_cupo,
    recomendar_tutores,
)


class DummyModelo(nn.Module):
    """Modelo simulado determinista para test unitario."""
    def __init__(self, logits_fijos: torch.Tensor):
        super().__init__()
        self.logits = logits_fijos

    def forward(self, x):
        batch = x.shape[0]
        return self.logits.repeat(batch, 1)


class TestMotorRecomendacion(unittest.TestCase):
    def setUp(self):
        self.vocab = {"<PAD>": 0, "<UNK>": 1, "sistema": 2, "web": 3, "ia": 4}
        self.idx_a_etiqueta = {
            0: "Tutor IA 1",
            1: "Tutor IA 2 (Misma Especialidad)",
            2: "Tutor Web",
            3: "Tutor Base Datos",
            4: "Tutor Sin Cupo",
        }
        self.mapa_especialidades = {
            "Tutor IA 1": ["Inteligencia Artificial", "Vision Computacional"],
            "Tutor IA 2 (Misma Especialidad)": ["Inteligencia Artificial", "Vision Computacional"],
            "Tutor Web": ["Desarrollo Web", "Frontend"],
            "Tutor Base Datos": ["Base de Datos", "PostgreSQL"],
            "Tutor Sin Cupo": ["Inteligencia Artificial", "Deep Learning"],
        }
        self.estado_docentes = {
            "Tutor IA 1": {"pupilos_asignados": 1, "especialidades": []},
            "Tutor IA 2 (Misma Especialidad)": {"pupilos_asignados": 0, "especialidades": []},
            "Tutor Web": {"pupilos_asignados": 2, "especialidades": []},
            "Tutor Base Datos": {"pupilos_asignados": 0, "especialidades": []},
            "Tutor Sin Cupo": {"pupilos_asignados": 3, "especialidades": []},  # LLENO
        }

    def test_filtro_cupos(self):
        self.assertTrue(docente_tiene_cupo(self.estado_docentes, "Tutor IA 1"))
        self.assertFalse(docente_tiene_cupo(self.estado_docentes, "Tutor Sin Cupo"))
        self.assertEqual(cupos_disponibles(self.estado_docentes, "Tutor Web"), 1)
        self.assertEqual(cupos_disponibles(self.estado_docentes, "Tutor Sin Cupo"), 0)

    def test_descarte_tutor_sin_cupo_en_recomendacion(self):
        # Simular logits donde 'Tutor Sin Cupo' tiene la máxima probabilidad
        logits = torch.tensor([[1.0, 2.0, 3.0, 4.0, 10.0]])
        modelo = DummyModelo(logits)

        resultados = recomendar_tutores(
            titulo="Proyecto de prueba",
            modelo=modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiqueta,
            mapa_especialidades=self.mapa_especialidades,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        nombres_recomendados = [r["nombre"] for r in resultados]
        self.assertNotIn("Tutor Sin Cupo", nombres_recomendados, "Un tutor con 3 cupos debe ser descartado")

    def test_balanceo_multidisciplinario(self):
        # Tutor IA 1 (0) y Tutor IA 2 (1) tienen logits altos, pero son de la misma especialidad
        # Tutor Web (2) y Base Datos (3) tienen logits menores pero complementan las áreas
        logits = torch.tensor([[8.0, 7.5, 6.0, 5.0, -10.0]])
        modelo = DummyModelo(logits)

        resultados = recomendar_tutores(
            titulo="Sistema web con IA y Base de Datos",
            modelo=modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiqueta,
            mapa_especialidades=self.mapa_especialidades,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        self.assertEqual(len(resultados), 3)
        # El puesto 1 debe ser Tutor IA 1 por mejor puntuación
        self.assertEqual(resultados[0]["nombre"], "Tutor IA 1")
        # El puesto 2 NO debe ser Tutor IA 2 porque repite especialidad; debe priorizar Tutor Web
        self.assertEqual(resultados[1]["nombre"], "Tutor Web")
        # El puesto 3 debe ser Tutor Base Datos
        self.assertEqual(resultados[2]["nombre"], "Tutor Base Datos")


if __name__ == "__main__":
    unittest.main()

