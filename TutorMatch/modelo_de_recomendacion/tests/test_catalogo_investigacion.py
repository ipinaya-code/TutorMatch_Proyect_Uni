"""
test_catalogo_investigacion.py — Suite de pruebas con el Catálogo Oficial de Temas de Investigación y Desarrollo.
Verifica que los títulos externos clasifiquen con tutores pertinentes y mantengan balance multidisciplinario.
"""

import unittest
import torch

from app.config import (
    ESPECIALIDADES_PATH,
    ESTADO_DOCENTES_PATH,
    LABEL_ENCODER_PATH,
    MAX_PUPILOS,
    MODELO_PATH,
    VOCABULARIO_PATH,
)
from app.dataset import cargar_especialidades, cargar_label_encoder
from app.modelo import ClasificadorTutores
from app.motor_recomendacion import cargar_estado_docentes, recomendar_tutores
from app.preprocesamiento import cargar_vocabulario


class TestCatalogoInvestigacion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
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

    def test_evaluacion_integral_catalogo_titulos(self):
        casos = [
            (
                "1.1 Diagnostico Medico CNN",
                "Sistema de Diagnostico Medico Asistido mediante Redes Neuronales Convolucionales y Aprendizaje Federado",
                "Ing. Marcelo Quiroga",
            ),
            (
                "2.1 Zero Trust Microservicios",
                "Diseno e Implementacion de una Arquitectura Zero Trust Automatizada para Entornos de Microservicios Hibridos",
                "Ing. Luis Arce",
            ),
            (
                "2.2 Deteccion Intrusiones UEBA",
                "Sistema de Deteccion y Respuesta a Intrusiones en Tiempo Real Basado en Analisis de Comportamiento de Usuarios y Entidades UEBA",
                "Ing. Oscar Telleria",
            ),
            (
                "2.3 Criptografia Post-Cuantica",
                "Evaluacion y Migracion de Protocolos de Seguridad Web hacia Criptografia Post-Cuantica PQC",
                "Lic. Natalia Gomez",
            ),
            (
                "3.1 Trafico Urbano Edge IoT",
                "Plataforma de Gestion Inteligente de Trafico Urbano mediante Edge Computing y Redes 5G LoRaWAN",
                "Lic. Fernando Pinto",
            ),
            (
                "4.2 Chaos Engineering Kubernetes",
                "Plataforma de Ingenieria de Caos Chaos Engineering Automatizada en Tuberias CI CD para Garantizar la Alta Disponibilidad en Clusteres de Kubernetes",
                "Lic. Pamela Suarez",
            ),
            (
                "5.2 Identidad Digital SSI zk-SNARKs",
                "Arquitectura de Identidad Digital Autosoberana SSI con Pruebas de Conocimiento Cero Zero-Knowledge Proofs para Tramites Gubernamentales",
                "Lic. Natalia Gomez",
            ),
            (
                "7.1 Realidad Mixta Simulador",
                "Entorno de Realidad Mixta Colaborativo para el Entrenamiento Quirurgico o Mantenimiento Industrial Remoto",
                "Ing. Claudia Urena",
            ),
            (
                "7.2 BCI Dispositivos Domoticos",
                "Interfaz Cerebro-Computadora BCI No Invasiva para el Control de Dispositivos Domoticos por Personas con Discapacidad Motora",
                "Lic. Fernando Pinto",
            ),
            (
                "8.1 Optimizacion Rutas Viajante",
                "Optimizacion de Rutas Logisticas Complejas Problema del Viajante Dinamico mediante Algoritmos Hibridos Clasico-Cuanticos",
                "Ing. Martin Lopez",
            ),
        ]

        for nombre_caso, titulo, tutor_esperado in casos:
            with self.subTest(caso=nombre_caso):
                res = recomendar_tutores(
                    titulo=titulo,
                    modelo=self.modelo,
                    vocab=self.vocab,
                    idx_a_etiqueta=self.idx_a_etiq,
                    mapa_especialidades=self.mapa_esp,
                    estado_docentes=self.estado_docentes,
                    top_k=3,
                )
                self.assertEqual(len(res), 3, "Debe retornar un Top 3")
                self.assertEqual(
                    res[0]["nombre"],
                    tutor_esperado,
                    f"Puesto 1 debe ser {tutor_esperado}",
                )

                # Verificar que los cupos respeten el maximo
                for r in res:
                    self.assertGreaterEqual(r["cupos_disponibles"], 1)
                    self.assertLessEqual(r["cupos_disponibles"], MAX_PUPILOS)

                # Verificar balance multidisciplinario (sin redundancia en top 3)
                nombres = [r["nombre"] for r in res]
                self.assertEqual(
                    len(set(nombres)), 3, "No deben repetirse tutores en el Top 3"
                )


if __name__ == "__main__":
    unittest.main()

