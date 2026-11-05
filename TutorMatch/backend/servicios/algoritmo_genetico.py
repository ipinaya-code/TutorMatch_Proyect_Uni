import math
import random
from conexion import obtener_conexion

# ==============================================================
# CONFIGURACIÓN POR DEFECTO DEL ALGORITMO GENÉTICO
# ==============================================================
PARAMETROS_DEFECTO = {
    "poblacion_tamano": 60,      # Número de soluciones por generación
    "generaciones": 100,         # Número máximo de iteraciones
    "tasa_cruce": 0.8,           # Probabilidad de cruzar dos padres (80%)
    "tasa_mutacion": 0.12,       # Probabilidad de mutación por gen (12%)
    "elitismo": 2,               # Las mejores 2 soluciones pasan directo
    "peso_nota": 3.0,            # Prioridad: mejor nota del tutor
    "peso_balance": 2.0,         # Prioridad: distribuir carga entre tutores
    "peso_carrera": 1.0,         # Prioridad: misma carrera
    "peso_semestre": 1.0,        # Prioridad: tutor en semestre superior
    "penalizacion_dura": 50.0    # Castigo severo por choque de horarios o exceso de cupo
}


# ==============================================================
# 1. PASO: RECOLECCIÓN DE DATOS DESDE POSTGRESQL
# ==============================================================
def recolectar_datos_para_algoritmo():
    """
    Obtiene de la base de datos:
    1. Las solicitudes que están 'pendientes'.
    2. Los tutores disponibles con sus materias aprobadas y disponibilidades.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # 1. Solicitudes pendientes
    cursor.execute("""
        SELECT s.id, s.estudiante_id, s.materia_id, u.carrera, u.semestre
        FROM solicitudes_tutoria s
        JOIN usuarios u ON s.estudiante_id = u.id
        WHERE s.estado = 'pendiente'
        ORDER BY s.id ASC;
    """)
    solicitudes = cursor.fetchall()

    # 2. Tutores disponibles
    cursor.execute("""
        SELECT id, nombre, carrera, semestre
        FROM usuarios
        WHERE rol = 'tutor';
    """)
    tutores = cursor.fetchall()

    # 3. Materias que imparte cada tutor con su nota
    cursor.execute("""
        SELECT tutor_id, materia_id, calificacion_obtenida
        FROM tutor_materias;
    """)
    tutor_materias = cursor.fetchall()

    cursor.close()
    conexion.close()

    return {
        "solicitudes": solicitudes,
        "tutores": tutores,
        "tutor_materias": tutor_materias
    }


# ==============================================================
# 2. PASO: CONSTRUIR CANDIDATOS VÁLIDOS POR SOLICITUD
# ==============================================================
def construir_candidatos(datos):
    """
    Para cada solicitud pendiente, encuentra qué tutores pueden dictar la materia.
    """
    solicitudes = datos["solicitudes"]
    tutores = {t["id"]: t for t in datos["tutores"]}
    
    # Mapeo: (tutor_id, materia_id) -> calificacion
    notas = {(tm["tutor_id"], tm["materia_id"]): tm["calificacion_obtenida"] for tm in datos["tutor_materias"]}

    candidatos_por_solicitud = []
    indices_con_candidatos = []

    for i, sol in enumerate(solicitudes):
        candidatos = []
        for t_id, tutor in tutores.items():
            # ¿El tutor imparte esta materia?
            calif = notas.get((t_id, sol["materia_id"]))
            
            # Si no hay registro explícito, pero es tutor, le damos nota base 70 para probar
            if calif is None:
                calif = 70
                
            if calif >= 70:
                candidatos.append({
                    "tutor_id": t_id,
                    "tutor_nombre": tutor["nombre"],
                    "nota": calif,
                    "misma_carrera": 1 if tutor["carrera"] == sol["carrera"] else 0,
                    "tutor_superior": 1 if tutor["semestre"] > sol["semestre"] else 0
                })
                
        candidatos_por_solicitud.append(candidatos)
        if len(candidatos) > 0:
            indices_con_candidatos.append(i)

    return {
        "solicitudes": solicitudes,
        "tutores": datos["tutores"],
        "candidatos": candidatos_por_solicitud,
        "indices_validos": indices_con_candidatos
    }


# ==============================================================
# 3. PASO: EVALUACIÓN DE FITNESS (CALIDAD DE UNA ASIGNACIÓN)
# ==============================================================
def evaluar_fitness(individuo, problema, params):
    """
    Calcula la aptitud (fitness) de una solución:
    - Suma puntos por: notas altas, misma carrera, semestre superior y distribución pareja.
    - Resta puntos fuertes por: sobrecarga excesiva de un tutor (restricción dura).
    """
    conflictos = 0
    suma_notas = 0
    suma_carrera = 0
    suma_semestre = 0
    carga_por_tutor = {}

    for pos, gen_idx in enumerate(individuo):
        sol_idx = problema["indices_validos"][pos]
        candidato = problema["candidatos"][sol_idx][gen_idx]
        t_id = candidato["tutor_id"]

        # Control de carga por tutor (límite saludable: 4 tutorías simultáneas)
        carga_por_tutor[t_id] = carga_por_tutor.get(t_id, 0) + 1
        if carga_por_tutor[t_id] > 4:
            conflictos += 1

        suma_notas += candidato["nota"] / 100.0
        suma_carrera += candidato["misma_carrera"]
        suma_semestre += candidato["tutor_superior"]

    n = max(len(individuo), 1)

    # Cálculo de dispersión (desviación estándar) para balancear la carga
    cargas = list(carga_por_tutor.values())
    if len(cargas) > 0:
        promedio_carga = sum(cargas) / len(cargas)
        varianza = sum((c - promedio_carga) ** 2 for c in cargas) / len(cargas)
        desviacion = math.sqrt(varianza)
    else:
        desviacion = 0.0

    # Puntuación suave (soft score) de 0 a 100
    peso_total = params["peso_nota"] + params["peso_balance"] + params["peso_carrera"] + params["peso_semestre"]
    puntaje_suave = (
        (params["peso_nota"] * (suma_notas / n)) +
        (params["peso_balance"] * (1.0 / (1.0 + desviacion))) +
        (params["peso_carrera"] * (suma_carrera / n)) +
        (params["peso_semestre"] * (suma_semestre / n))
    ) * (100.0 / peso_total)

    # Fitness total = Puntuación - Penalización por conflictos
    fitness = puntaje_suave - (params["penalizacion_dura"] * conflictos)

    return {
        "fitness": fitness,
        "conflictos": conflictos,
        "puntaje_suave": puntaje_suave
    }


# ==============================================================
# 4. PASO: OPERADORES GENÉTICOS (Selección, Cruce y Mutación)
# ==============================================================
def seleccion_por_torneo(poblacion_evaluada, k=3):
    """
    Elige al mejor individuo entre 'k' participantes al azar.
    """
    participantes = random.sample(poblacion_evaluada, k)
    mejor = max(participantes, key=lambda x: x["fitness"])
    return list(mejor["individuo"])

def cruzar_individuos(padre1, padre2, tasa_cruce):
    """
    Cruce en un punto: combina partes del padre 1 y padre 2.
    """
    if random.random() > tasa_cruce or len(padre1) <= 1:
        return list(padre1)
    
    punto_corte = random.randint(1, len(padre1) - 1)
    hijo = padre1[:punto_corte] + padre2[punto_corte:]
    return hijo

def mutar_individuo(individuo, problema, tasa_mutacion):
    """
    Altera aleatoriamente el tutor asignado a una solicitud con una probabilidad dada.
    """
    for pos in range(len(individuo)):
        if random.random() < tasa_mutacion:
            sol_idx = problema["indices_validos"][pos]
            cantidad_candidatos = len(problema["candidatos"][sol_idx])
            if cantidad_candidatos > 1:
                individuo[pos] = random.randint(0, cantidad_candidatos - 1)
    return individuo


# ==============================================================
# 5. PASO: FUNCIÓN PRINCIPAL DE EJECUCIÓN (OPTIMIZACIÓN)
# ==============================================================
def ejecutar_algoritmo_genetico(params_personalizados=None):
    """
    Ejecuta el ciclo evolutivo completo y devuelve el mejor plan de asignación.
    """
    params = PARAMETROS_DEFECTO.copy()
    if params_personalizados:
        params.update(params_personalizados)

    datos = recolectar_datos_para_algoritmo()
    if not datos["solicitudes"]:
        return {"mensaje": "No hay solicitudes pendientes para optimizar", "asignaciones": []}

    problema = construir_candidatos(datos)
    total_genes = len(problema["indices_validos"])

    if total_genes == 0:
        return {"mensaje": "No hay candidatos compatibles disponibles", "asignaciones": []}

    # Crear población inicial aleatoria
    poblacion = []
    for _ in range(params["poblacion_tamano"]):
        individuo = [
            random.randint(0, len(problema["candidatos"][problema["indices_validos"][j]]) - 1)
            for j in range(total_genes)
        ]
        poblacion.append(individuo)

    mejor_solucion_historica = None

    # Ciclo de generaciones
    for generacion in range(params["generaciones"]):
        # Evaluar aptitud de toda la población
        evaluados = []
        for ind in poblacion:
            resultado = evaluar_fitness(ind, problema, params)
            evaluados.append({
                "individuo": ind,
                "fitness": resultado["fitness"],
                "conflictos": resultado["conflictos"],
                "puntaje": resultado["puntaje_suave"]
            })

        # Ordenar de mejor a peor
        evaluados.sort(key=lambda x: x["fitness"], reverse=True)

        if mejor_solucion_historica is None or evaluados[0]["fitness"] > mejor_solucion_historica["fitness"]:
            mejor_solucion_historica = evaluados[0]

        # Elitismo: preservamos a los mejores
        nueva_poblacion = [list(e["individuo"]) for e in evaluados[:params["elitismo"]]]

        # Generar descendencia hasta completar el tamaño de población
        while len(nueva_poblacion) < params["poblacion_tamano"]:
            padre_a = seleccion_por_torneo(evaluados)
            padre_b = seleccion_por_torneo(evaluados)
            hijo = cruzar_individuos(padre_a, padre_b, params["tasa_cruce"])
            hijo = mutar_individuo(hijo, problema, params["tasa_mutacion"])
            nueva_poblacion.append(hijo)

        poblacion = nueva_poblacion

    # Decodificar la mejor solución encontrada en un plan entendible
    plan_asignaciones = []
    mejor_ind = mejor_solucion_historica["individuo"]

    for pos, gen_idx in enumerate(mejor_ind):
        sol_idx = problema["indices_validos"][pos]
        solicitud = problema["solicitudes"][sol_idx]
        candidato = problema["candidatos"][sol_idx][gen_idx]

        plan_asignaciones.append({
            "solicitud_id": solicitud["id"],
            "estudiante_id": solicitud["estudiante_id"],
            "materia_id": solicitud["materia_id"],
            "tutor_id": candidato["tutor_id"],
            "tutor_nombre": candidato["tutor_nombre"],
            "justificacion": f"Nota {candidato['nota']} en la materia · {'Misma carrera' if candidato['misma_carrera'] else 'Otra carrera'}"
        })

    return {
        "resumen": {
            "fitness_obtenido": round(mejor_solucion_historica["fitness"], 2),
            "conflictos": mejor_solucion_historica["conflictos"],
            "calidad_porcentaje": round(mejor_solucion_historica["puntaje"], 2),
            "total_asignadas": len(plan_asignaciones)
        },
        "asignaciones": plan_asignaciones
    }


def aplicar_plan_en_base_de_datos(asignaciones):
    """
    Toma el resultado del algoritmo genético y actualiza la tabla 'solicitudes_tutoria'
    en PostgreSQL cambiando el estado a 'asignada' y fijando el tutor.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    actualizados = 0
    for item in asignaciones:
        cursor.execute("""
            UPDATE solicitudes_tutoria
            SET tutor_id = %s, estado = 'asignada'
            WHERE id = %s AND estado = 'pendiente';
        """, (item["tutor_id"], item["solicitud_id"]))
        actualizados += cursor.rowcount

    conexion.commit()
    cursor.close()
    conexion.close()
    return actualizados

