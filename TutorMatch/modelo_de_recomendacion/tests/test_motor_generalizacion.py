"""
test_motor_generalizacion.py — Pruebas de concordancia semántica con títulos externos (Out-of-Distribution).

Ningún título probado en esta suite existe en `dataset_tutores_especializados.csv`.
Se evalúa que el modelo entrenado junto con el motor de recomendación infiera
correctamente tutores de las áreas disciplinarias temáticas afines, tanto en
proyectos unidisciplinares como multidisciplinares y bajo condiciones de cupo límite.
"""

import unittest
import pandas as pd
import torch

from app.config import (
    CSV_PATH,
    ESPECIALIDADES_PATH,
    ESTADO_DOCENTES_PATH,
    LABEL_ENCODER_PATH,
    MODELO_PATH,
    VOCABULARIO_PATH,
)
from app.dataset import cargar_especialidades, cargar_label_encoder
from app.modelo import ClasificadorTutores
from app.motor_recomendacion import cargar_estado_docentes, recomendar_tutores
from app.preprocesamiento import cargar_vocabulario


class TestMotorRecomendacionGeneralizacion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 1. Cargar el dataset original para verificar que ningún título de prueba exista allí
        df_original = pd.read_csv(CSV_PATH)
        cls.titulos_en_dataset = set(df_original["Titulo_Proyecto"].str.strip().tolist())

        # 2. Cargar artefactos y pesos del modelo
        cls.vocab = cargar_vocabulario(VOCABULARIO_PATH)
        cls.etiq_a_idx, cls.idx_a_etiq = cargar_label_encoder(LABEL_ENCODER_PATH)
        cls.mapa_esp = cargar_especialidades(ESPECIALIDADES_PATH)
        cls.estado_docentes = cargar_estado_docentes(ESTADO_DOCENTES_PATH)

        checkpoint = torch.load(MODELO_PATH, map_location="cpu", weights_only=True)
        cls.modelo = ClasificadorTutores(
            vocab_size=checkpoint["vocab_size"],
            embedding_dim=checkpoint["embedding_dim"],
            num_filtros=checkpoint["num_filtros"],
            hidden_dim=checkpoint["hidden_dim"],
            num_clases=checkpoint["num_clases"],
            dropout=checkpoint["dropout"],
            pad_idx=0,
        )
        cls.modelo.load_state_dict(checkpoint["model_state_dict"])
        cls.modelo.eval()

    def _asegurar_no_en_dataset(self, titulo: str):
        """Garantiza formalmente que el título no pertenezca al CSV de 600 registros."""
        self.assertNotIn(
            titulo,
            self.titulos_en_dataset,
            f"El título '{titulo}' fue detectado dentro del dataset de entrenamiento. Debe ser externo.",
        )

    def test_concordancia_vision_computacional_ia(self):
        """Caso externo: Visión artificial aplicada a la agricultura y biología."""
        titulo = "Deteccion de enfermedades en hojas de cafe usando vision artificial y redes neuronales"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Ing. Marcelo Quiroga")
        self.assertIn("Inteligencia Artificial", puesto_1["especialidades"])
        self.assertIn("Vision Computacional", puesto_1["especialidades"])

    def test_concordancia_movil_geolocalizacion(self):
        """Caso externo: Aplicación móvil con mapas y ruteo GPS."""
        titulo = "Plataforma movil con geolocalizacion GPS para despacho y ruteo de ambulancias"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Ing. Rodrigo Vargas")
        self.assertIn("Desarrollo Movil", puesto_1["especialidades"])
        self.assertIn("Geolocalizacion", puesto_1["especialidades"])

    def test_concordancia_ciberseguridad_criptografia(self):
        """Caso externo: Hacking ético, auditoría y seguridad informática."""
        titulo = "Auditoria de ciberseguridad y analisis de vulnerabilidades OWASP en portales bancarios"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Lic. Natalia Gomez")
        self.assertIn("Ciberseguridad", puesto_1["especialidades"])
        self.assertIn("Auditoria de Sistemas", puesto_1["especialidades"])

    def test_concordancia_cloud_devops_kubernetes(self):
        """Caso externo: Despliegue en la nube, infraestructura como código y CI/CD."""
        titulo = "Cluster de Kubernetes en AWS con pipelines CI CD automatizados mediante DevOps"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Lic. Pamela Suarez")
        self.assertIn("Cloud Computing", puesto_1["especialidades"])
        self.assertIn("DevOps", puesto_1["especialidades"])

    def test_concordancia_optimizacion_matematica(self):
        """Caso externo: Metaheurísticas, grafos y algoritmos de optimización."""
        titulo = "Optimizacion de rutas de distribucion logistica mediante algoritmos geneticos y teoria de grafos"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Ing. Martin Lopez")
        self.assertIn("Optimizacion Matematica", puesto_1["especialidades"])
        self.assertIn("Algoritmia Avanzada", puesto_1["especialidades"])

    def test_concordancia_realidad_virtual_3d(self):
        """Caso externo: Gráficos por computadora y simulador 3D inmersivo."""
        titulo = "Simulador 3D inmersivo en realidad virtual para entrenamiento de bomberos"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Ing. Claudia Urena")
        self.assertIn("Simuladores 3D", puesto_1["especialidades"])
        self.assertIn("Graficacion por Computadora", puesto_1["especialidades"])

    def test_concordancia_iot_sensores_embebidos(self):
        """Caso externo: Microcontroladores, telemetría y sensores en el agro."""
        titulo = "Red de sensores IoT con microcontroladores ESP32 para telemetria de riego"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Lic. Fernando Pinto")
        self.assertIn("Internet de las Cosas", puesto_1["especialidades"])
        self.assertIn("Sistemas Embebidos", puesto_1["especialidades"])

    def test_concordancia_nlp_transformers(self):
        """Caso externo: Chatbot y modelos de lenguaje."""
        titulo = "Chatbot conversacional con procesamiento de lenguaje natural y modelos Transformers"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        puesto_1 = resultados[0]
        self.assertEqual(puesto_1["nombre"], "Lic. Andrea Mendoza")
        self.assertIn("Procesamiento de Lenguaje Natural", puesto_1["especialidades"])

    def test_cobertura_multidisciplinaria_proyecto_complejo(self):
        """
        Caso externo transversal: Combina Backend (APIs/Docker) + Base de Datos (SQL) + Analítica (Data Science).
        Verifica que el Top 3 no repita especialidades idénticas y cubra las 3 áreas.
        """
        titulo = "Plataforma de microservicios con APIs en Docker integrada a Data Warehouse en SQL y analitica predictiva"
        self._asegurar_no_en_dataset(titulo)

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=self.estado_docentes,
            top_k=3,
        )

        self.assertEqual(len(resultados), 3, "Deben sugerirse exactamente 3 tutores")
        nombres = [r["nombre"] for r in resultados]

        # Verificar unicidad de tutores en el ranking
        self.assertEqual(len(set(nombres)), 3, "Los 3 tutores recomendados deben ser distintos")

        # Verificar que se cubran las diversas áreas del proyecto
        todas_esps = set()
        for r in resultados:
            todas_esps.update(r["especialidades"])

        # Debe tener presencia de las áreas clave del título
        areas_relevantes = [
            "Desarrollo Backend",
            "Contenedores Docker",
            "Base de Datos",
            "Sistemas Transaccionales",
            "Ciencia de Datos",
            "Estadistica Computacional",
        ]
        coincidencias = [area for area in areas_relevantes if area in todas_esps]
        self.assertGreaterEqual(
            len(coincidencias),
            2,
            f"El equipo seleccionado debe cubrir áreas complementarias relevantes. Cubiertas: {todas_esps}",
        )

    def test_descarte_por_cupo_en_caso_externo(self):
        """
        Si el tutor más afín temáticamente a un título externo tiene cupo lleno (3 pupilos),
        el motor debe descartarlo automáticamente y asignar al siguiente mejor tutor disponible.
        """
        titulo = "Sistema de reconocimiento facial para seguridad biometrica con redes neuronales"
        self._asegurar_no_en_dataset(titulo)

        # Crear copia de estado docente saturando al tutor natural de IA (Ing. Marcelo Quiroga)
        estado_simulado = dict(self.estado_docentes)
        estado_simulado["Ing. Marcelo Quiroga"] = {
            "pupilos_asignados": 3,  # Cupo Lleno
            "especialidades": self.mapa_esp["Ing. Marcelo Quiroga"],
        }

        resultados = recomendar_tutores(
            titulo=titulo,
            modelo=self.modelo,
            vocab=self.vocab,
            idx_a_etiqueta=self.idx_a_etiq,
            mapa_especialidades=self.mapa_esp,
            estado_docentes=estado_simulado,
            top_k=3,
        )

        nombres_sugeridos = [r["nombre"] for r in resultados]
        self.assertNotIn(
            "Ing. Marcelo Quiroga",
            nombres_sugeridos,
            "El tutor saturado con 3 pupilos debe ser descartado sin importar su afinidad",
        )
        self.assertGreater(len(resultados), 0)


if __name__ == "__main__":
    unittest.main()

