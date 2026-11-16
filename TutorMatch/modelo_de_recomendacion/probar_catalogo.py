import torch
from app.config import (
    MODELO_PATH,
    VOCABULARIO_PATH,
    LABEL_ENCODER_PATH,
    ESPECIALIDADES_PATH,
    ESTADO_DOCENTES_PATH,
)
from app.preprocesamiento import cargar_vocabulario
from app.dataset import cargar_label_encoder, cargar_especialidades
from app.modelo import ClasificadorTutores
from app.motor_recomendacion import cargar_estado_docentes, recomendar_tutores

vocab = cargar_vocabulario(VOCABULARIO_PATH)
etiq_a_idx, idx_a_etiq = cargar_label_encoder(LABEL_ENCODER_PATH)
mapa_esp = cargar_especialidades(ESPECIALIDADES_PATH)
estado = cargar_estado_docentes(ESTADO_DOCENTES_PATH)

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

titulos = [
    ("1.1", "Sistema de Diagnóstico Médico Asistido mediante Redes Neuronales Convolucionales y Aprendizaje Federado"),
    ("1.2", "Arquitectura de Agentes Autónomos Basados en Modelos de Lenguaje Grande (LLMs) para la Automatización de Procesos Empresariales (RPA Cognitivo)"),
    ("1.3", "Mantenimiento Predictivo en Maquinaria Industrial utilizando Series Temporales y Aprendizaje por Refuerzo Profundo"),
    ("2.1", "Diseño e Implementación de una Arquitectura 'Zero Trust' Automatizada para Entornos de Microservicios Híbridos"),
    ("2.2", "Sistema de Detección y Respuesta a Intrusiones en Tiempo Real Basado en Análisis de Comportamiento de Usuarios y Entidades (UEBA)"),
    ("2.3", "Evaluación y Migración de Protocolos de Seguridad Web hacia Criptografía Post-Cuántica (PQC)"),
    ("3.1", "Plataforma de Gestión Inteligente de Tráfico Urbano mediante Edge Computing y Redes 5G/LoRaWAN"),
    ("3.2", "Gemelo Digital (Digital Twin) para la Optimización Energética y Monitoreo Estructural de Edificios Inteligentes"),
    ("4.1", "Framework para la Migración Automatizada de Sistemas Monolíticos Heredados (Legacy) hacia Arquitecturas Serverless y Basadas en Eventos"),
    ("4.2", "Plataforma de Ingeniería de Caos (Chaos Engineering) Automatizada en Tuberías CI/CD para Garantizar la Alta Disponibilidad en Clústeres de Kubernetes"),
    ("5.1", "Sistema de Trazabilidad e Integridad en la Cadena de Suministro Agroindustrial utilizando Contratos Inteligentes e IoT"),
    ("5.2", "Arquitectura de Identidad Digital Autosoberana (SSI) con Pruebas de Conocimiento Cero (Zero-Knowledge Proofs) para Trámites Gubernamentales"),
    ("6.1", "Arquitectura Data Mesh en Tiempo Real para la Detección de Fraude Financiero a Gran Escala"),
    ("6.2", "Motor de Recomendación Híbrido y Adaptativo en Tiempo Real para Plataformas de Comercio Electrónico o Educación (EdTech)"),
    ("7.1", "Entorno de Realidad Mixta Colaborativo para el Entrenamiento Quirúrgico o Mantenimiento Industrial Remoto"),
    ("7.2", "Interfaz Cerebro-Computadora (BCI) No Invasiva para el Control de Dispositivos Domóticos por Personas con Discapacidad Motora"),
    ("8.1", "Optimización de Rutas Logísticas Complejas (Problema del Viajante Dinámico) mediante Algoritmos Híbridos Clásico-Cuánticos"),
]

print(f"EVALUACIÓN DETALLADA DE LOS {len(titulos)} TÍTULOS DEL CATÁLOGO:\n")

for codigo, tit in titulos:
    res = recomendar_tutores(tit, modelo, vocab, idx_a_etiq, mapa_esp, estado, top_k=3)
    print(f"======================================================================")
    print(f"[{codigo}] {tit}")
    print(f"----------------------------------------------------------------------")
    todas_areas = set()
    for r in res:
        todas_areas.update(r["especialidades"])
        print(f"  Puesto #{r['puesto']}: {r['nombre']} (Afinidad: {r['afinidad_porcentaje']}%, Cupos libres: {r['cupos_disponibles']})")
        print(f"     Especialidades: {', '.join(r['especialidades'])}")
    print(f"  >> Áreas totales cubiertas por el equipo ({len(todas_areas)} áreas):")
    for a in sorted(todas_areas):
        print(f"     • {a}")
    print()

