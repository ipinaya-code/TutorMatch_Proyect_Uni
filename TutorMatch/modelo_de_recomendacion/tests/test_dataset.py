"""
test_dataset.py — Valida la integridad, esquema y balance del dataset y estado de tutores.
"""

import json
import os
import unittest
import pandas as pd

from app.config import CSV_PATH, ESTADO_DOCENTES_PATH, MAX_PUPILOS


class TestDatasetIntegridad(unittest.TestCase):
    def setUp(self):
        self.assertTrue(os.path.exists(CSV_PATH), f"El archivo CSV no existe en {CSV_PATH}")
        self.df = pd.read_csv(CSV_PATH)

    def test_columnas_exactas(self):
        columnas_esperadas = ["Titulo_Proyecto", "Especialidad", "Nombre_Tutor"]
        self.assertListEqual(list(self.df.columns), columnas_esperadas)

    def test_cantidad_registros(self):
        self.assertEqual(len(self.df), 600, "El dataset debe contener exactamente 600 registros")

    def test_sin_valores_nulos(self):
        self.assertEqual(self.df.isnull().sum().sum(), 0, "No debe haber valores nulos en el dataset")

    def test_docentes_unicos_y_balanceados(self):
        tutores = self.df["Nombre_Tutor"].unique()
        self.assertEqual(len(tutores), 15, "Deben existir exactamente 15 docentes únicos")
        conteo = self.df["Nombre_Tutor"].value_counts()
        for tutor, cant in conteo.items():
            self.assertEqual(cant, 40, f"El tutor {tutor} debe tener exactamente 40 registros")

    def test_especialidades_formato(self):
        for esp in self.df["Especialidad"]:
            sub_areas = [s.strip() for s in esp.split(";") if s.strip()]
            self.assertGreaterEqual(len(sub_areas), 2, "Cada tutor debe dominar al menos 2 áreas")
            self.assertLessEqual(len(sub_areas), 4, "Cada tutor no debe exceder 4 áreas")

    def test_estado_docentes_cupos(self):
        self.assertTrue(os.path.exists(ESTADO_DOCENTES_PATH), "El archivo estado_docentes.json no existe")
        with open(ESTADO_DOCENTES_PATH, "r", encoding="utf-8") as f:
            estado = json.load(f)

        self.assertEqual(len(estado), 15, "El estado debe contener a los 15 docentes")
        for tutor, datos in estado.items():
            self.assertIn("pupilos_asignados", datos)
            self.assertIn("especialidades", datos)
            self.assertGreaterEqual(datos["pupilos_asignados"], 0)
            self.assertLessEqual(datos["pupilos_asignados"], MAX_PUPILOS)


if __name__ == "__main__":
    unittest.main()

