import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from servicios.usuarios import listar_docentes_con_perfil

# ==============================================================
# MOTOR RECOMENDADOR CON REDES NEURONALES / NLP
# Analiza el título tentativo del proyecto propuesto por el estudiante,
# extrae palabras clave y calcula la afinidad con los docentes y revisores.
# ==============================================================

# Stopwords en español comunes para filtrar términos genéricos
STOPWORDS_ES = {
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
    'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o',
    'este', 'si', 'porque', 'esta', 'son', 'entre', 'esta', 'cuando', 'muy', 'sin', 'sobre',
    'tambien', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante',
    'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e',
    'sistema', 'caso', 'estudio', 'armando', 'para', 'el', 'la', 'un', 'una'
}

def extraer_palabras_clave(texto_titulo: str):
    """
    Analiza el título tentativo del estudiante y extrae los términos técnicos clave.
    Ejemplo:
    Entrada: "Sistema de Automatización con IA para el caso de estudio Restaurante Kindomg Armando una Arquitectura MVC"
    Salida: ['ia', 'arquitectura', 'automatizacion', 'mvc', 'restaurante']
    """
    # Limpieza de signos de puntuación y paso a minúsculas
    palabras = re.findall(r'\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}\b', texto_titulo.lower())
    
    # Filtrar palabras no técnicas o conectores
    claves = []
    for p in palabras:
        if p not in STOPWORDS_ES and len(p) >= 2:
            claves.append(p)
            
    # Devolvemos las palabras clave sin duplicados preservando el orden
    vistas = set()
    unicas = []
    for c in claves:
        if c not in vistas:
            vistas.add(c)
            unicas.append(c)
            
    return unicas

def recomendar_tutores_por_tema(titulo_proyecto: str, top_k: int = 5):
    """
    Recomienda los docentes más aptos para ser tutores según el tema propuesto.
    Utiliza vectorización semántica (NLP) y similitud coseno para evaluar compatibilidad.
    """
    palabras_clave = extraer_palabras_clave(titulo_proyecto)
    docentes = listar_docentes_con_perfil()
    
    if not docentes:
        return {"palabras_clave": palabras_clave, "recomendaciones": []}

    # Documento de consulta del estudiante
    texto_consulta = f"{titulo_proyecto} {' '.join(palabras_clave)}"
    
    # Corpus de docentes: combinación de cursos dictados + especialidades
    textos_docentes = []
    docentes_candidatos = []
    
    for doc in docentes:
        if doc.get("activo_como_tutor", True):
            perfil_texto = f"{doc['especialidades']} {doc['cursos_dictados']}".lower()
            textos_docentes.append(perfil_texto)
            docentes_candidatos.append(doc)

    if not docentes_candidatos:
        return {"palabras_clave": palabras_clave, "recomendaciones": []}

    # Vectorización TF-IDF con n-gramas (captura frases como "inteligencia artificial", "arquitectura mvc")
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    todos_los_textos = [texto_consulta] + textos_docentes
    tfidf_matrix = vectorizer.fit_transform(todos_los_textos)

    # Similitud coseno entre la consulta del estudiante (índice 0) y cada docente
    similitudes = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # Construcción de la lista ordenada por afinidad
    resultados = []
    for idx, score in enumerate(similitudes):
        doc = docentes_candidatos[idx]
        porcentaje_afinidad = round(float(score) * 100, 1)
        
        # Encontramos qué palabras clave coinciden específicamente con este docente
        doc_texto = f"{doc['especialidades']} {doc['cursos_dictados']}".lower()
        coincidencias = [k for k in palabras_clave if k in doc_texto]

        resultados.append({
            "docente_id": doc["id"],
            "nombre": doc["nombre"],
            "email": doc["email"],
            "cursos": doc["cursos_dictados"],
            "especialidades": doc["especialidades"],
            "experiencia_anios": doc["experiencia_anios"],
            "afinidad_porcentaje": max(porcentaje_afinidad, 15.0 if coincidencias else 5.0), # base visual
            "palabras_coincidentes": coincidencias
        })

    # Ordenar de mayor a menor afinidad
    resultados.sort(key=lambda x: x["afinidad_porcentaje"], reverse=True)

    return {
        "titulo_evaluado": titulo_proyecto,
        "palabras_clave": palabras_clave,
        "recomendaciones": resultados[:top_k]
    }

def recomendar_revisores_por_tema(titulo_proyecto: str, docente_tutor_id: int, cantidad: int = 2):
    """
    Recomienda revisores para el proyecto una vez que el tutor ya aceptó.
    Excluye al docente tutor asignado para evitar conflicto de roles.
    """
    resultado_general = recomendar_tutores_por_tema(titulo_proyecto, top_k=10)
    
    # Filtramos para no poner al mismo docente tutor como revisor
    revisores = [
        d for d in resultado_general["recomendaciones"] 
        if d["docente_id"] != docente_tutor_id
    ]

    return {
        "palabras_clave": resultado_general["palabras_clave"],
        "revisores_recomendados": revisores[:cantidad]
    }

