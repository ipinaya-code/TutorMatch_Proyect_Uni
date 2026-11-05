"""Genera los diagramas principales de TutorMatch en formato PNG.

Uso:
    python diagramas/generar_diagramas.py

Los archivos se escriben en diagramas/actualizados. El contenido refleja el
estado actual del proyecto: PWA React con IndexedDB, API FastAPI, PostgreSQL
y optimización mediante algoritmo genético.
"""

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Ellipse, Polygon


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "actualizados"
BLUE = "#2563eb"
CYAN = "#0891b2"
GREEN = "#16a34a"
ORANGE = "#ea580c"
PURPLE = "#7c3aed"
GRAY = "#475569"
LIGHT = "#f8fafc"
GRID = "#cbd5e1"


def canvas(title, size=(16, 9)):
    fig, ax = plt.subplots(figsize=size)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 9)
    ax.axis("off")
    ax.set_title(title, fontsize=20, fontweight="bold", color="#0f172a", pad=18)
    return fig, ax


def box(ax, x, y, w, h, text, color=BLUE, fill="#eff6ff", fontsize=11):
    patch = FancyBboxPatch(
        (x, y), w, h, boxstyle="round,pad=0.025,rounding_size=0.08",
        linewidth=1.8, edgecolor=color, facecolor=fill,
    )
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            fontsize=fontsize, color="#0f172a", wrap=True)


def arrow(ax, start, end, label=None, color=GRAY, style="-|>", curve=0):
    patch = FancyArrowPatch(
        start, end, arrowstyle=style, mutation_scale=14, linewidth=1.5,
        color=color, connectionstyle=f"arc3,rad={curve}",
    )
    ax.add_patch(patch)
    if label:
        mx = (start[0] + end[0]) / 2
        my = (start[1] + end[1]) / 2
        ax.text(mx, my + 0.16, label, ha="center", va="center",
                fontsize=9, color=color, bbox={"fc": "white", "ec": "none", "pad": 1})


def save(fig, name):
    OUTPUT.mkdir(exist_ok=True)
    fig.savefig(OUTPUT / name, dpi=180, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def arquitectura():
    fig, ax = canvas("TutorMatch — Arquitectura actual")
    box(ax, 0.5, 6.0, 3.2, 1.4, "Usuario\nEstudiante · Tutor · Coordinador", ORANGE, "#fff7ed")
    box(ax, 4.5, 5.7, 3.2, 2.0, "PWA React + Vite\nTailwind CSS\nAppShell y paneles por rol", BLUE)
    box(ax, 4.5, 2.9, 3.2, 1.7, "Persistencia local\nIndexedDB · Service Worker\nModo offline y cola pendiente", CYAN, "#ecfeff")
    box(ax, 9.0, 5.7, 3.2, 2.0, "API REST FastAPI\nAutenticación · usuarios\nmaterias · solicitudes", GREEN, "#f0fdf4")
    box(ax, 9.0, 2.9, 3.2, 1.7, "Algoritmo genético\nCandidatos · fitness\nasignación · balance de carga", PURPLE, "#faf5ff")
    box(ax, 13.0, 4.4, 2.4, 1.8, "PostgreSQL\n6 tablas\nintegridad referencial", ORANGE, "#fff7ed")
    arrow(ax, (3.7, 6.7), (4.5, 6.7), "usa")
    arrow(ax, (7.7, 6.7), (9.0, 6.7), "HTTP / JSON")
    arrow(ax, (6.1, 5.7), (6.1, 4.6), "offline")
    arrow(ax, (9.0, 3.75), (7.7, 3.75), "simulación")
    arrow(ax, (12.2, 6.7), (13.0, 5.5), "SQL")
    arrow(ax, (12.2, 3.75), (13.0, 5.0), "guarda plan")
    ax.text(8, 1.0, "Estado actual: el frontend funciona localmente; la API y PostgreSQL están preparadas para integración.",
            ha="center", fontsize=11, color=GRAY)
    save(fig, "01_arquitectura_actual.png")


def casos_de_uso():
    fig, ax = canvas("TutorMatch — Casos de uso principales")
    ax.add_patch(FancyBboxPatch((3.0, 0.8), 10.0, 7.2, boxstyle="round,pad=0.02",
                                linewidth=2, edgecolor=BLUE, facecolor="#f8fbff"))
    ax.text(8, 7.7, "Sistema TutorMatch", ha="center", fontsize=13, fontweight="bold", color=BLUE)
    actors = [("Estudiante", 1.3, 5.9), ("Tutor", 1.3, 3.9), ("Coordinador", 1.3, 1.9)]
    for label, x, y in actors:
        ax.add_patch(Ellipse((x, y + 0.35), 0.35, 0.45, facecolor="#fff7ed", edgecolor=ORANGE, lw=1.5))
        ax.plot([x, x, x - 0.25, x + 0.25], [y + 0.1, y - 0.45, y - 0.8, y - 0.8], color=ORANGE, lw=1.5)
        ax.text(x, y - 1.1, label, ha="center", fontsize=10)
    use_cases = [
        ("Iniciar sesión /\nregistrarse", 4.0, 6.4, 1.8, 0),
        ("Solicitar tutoría", 7.0, 6.4, 1.8, 0),
        ("Consultar agenda", 10.0, 6.4, 1.8, 0),
        ("Configurar\n disponibilidad", 4.0, 4.2, 1.8, 1),
        ("Aceptar o\nrechazar solicitud", 7.0, 4.2, 1.8, 1),
        ("Registrar asistencia\ny valoración", 10.0, 4.2, 1.8, 1),
        ("Ejecutar asignación\nautomática", 4.8, 2.0, 2.2, 2),
        ("Gestionar usuarios\ny materias", 8.0, 2.0, 2.2, 2),
        ("Supervisar métricas", 11.0, 2.0, 1.8, 2),
    ]
    for text, x, y, w, role in use_cases:
        box(ax, x, y, w, 0.95, text, [BLUE, GREEN, PURPLE][role], "#ffffff", 9)
    for end in [(4.0, 6.9), (7.0, 6.9), (10.0, 6.9)]:
        arrow(ax, (1.55, 6.0), end, color=GRAY, style="-")
    for end in [(4.0, 4.7), (7.0, 4.7), (10.0, 4.7)]:
        arrow(ax, (1.55, 4.0), end, color=GRAY, style="-")
    for end in [(4.8, 2.45), (8.0, 2.45), (11.0, 2.45)]:
        arrow(ax, (1.55, 2.0), end, color=GRAY, style="-")
    save(fig, "02_casos_de_uso.png")


def tabla(ax, x, y, w, h, title, fields, color):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02",
                                linewidth=1.8, edgecolor=color, facecolor="white"))
    ax.add_patch(FancyBboxPatch((x, y + h - 0.48), w, 0.48, boxstyle="round,pad=0.02",
                                linewidth=0, facecolor=color))
    ax.text(x + w / 2, y + h - 0.24, title, ha="center", va="center",
            color="white", fontsize=10, fontweight="bold")
    for i, field in enumerate(fields):
        ax.text(x + 0.12, y + h - 0.78 - i * 0.32, field, fontsize=8.5, color="#1e293b")


def entidad_relacion():
    fig, ax = canvas("TutorMatch — Modelo entidad-relación")
    tabla(ax, 0.4, 5.1, 3.0, 2.5, "USUARIOS", ["PK id", "nombre, email", "password_hash", "rol, carrera", "semestre"], BLUE)
    tabla(ax, 4.4, 5.1, 3.0, 2.5, "MATERIAS", ["PK id", "codigo", "nombre", "semestre", "es_tutorable"], GREEN)
    tabla(ax, 8.4, 5.1, 3.2, 2.5, "DISPONIBILIDADES", ["PK id", "FK tutor_id", "dia_semana", "hora_inicio", "hora_fin"], CYAN)
    tabla(ax, 0.4, 1.3, 3.6, 2.6, "TUTOR_MATERIAS", ["PK id", "FK tutor_id", "FK materia_id", "calificacion_obtenida"], PURPLE)
    tabla(ax, 5.0, 1.3, 3.8, 2.6, "SOLICITUDES_TUTORIA", ["PK id", "FK estudiante_id", "FK materia_id", "FK tutor_id", "estado"], ORANGE)
    tabla(ax, 10.0, 1.3, 3.1, 2.6, "EVALUACIONES", ["PK id", "FK solicitud_id", "calificacion 1..5", "comentario"], GREEN)
    for start, end, label in [
        ((3.4, 6.0), (4.4, 6.0), "1:N"),
        ((3.4, 2.8), (5.0, 2.8), "1:N"),
        ((2.2, 5.1), (2.2, 3.9), "1:N"),
        ((5.9, 5.1), (2.9, 3.9), "1:N"),
        ((7.4, 5.1), (6.9, 3.9), "1:N"),
        ((8.8, 2.6), (10.0, 2.6), "1:1"),
        ((10.0, 6.0), (8.8, 3.2), "1:N"),
    ]:
        arrow(ax, start, end, label, color=GRAY, style="-|>")
    save(fig, "03_modelo_entidad_relacion.png")


def secuencia():
    fig, ax = canvas("TutorMatch — Secuencia de asignación automática")
    participants = [("Estudiante", 1.2), ("PWA / Store", 4.0), ("API FastAPI", 7.0),
                    ("Algoritmo genético", 10.0), ("PostgreSQL", 13.2)]
    for label, x in participants:
        ax.text(x, 7.8, label, ha="center", fontsize=10, fontweight="bold")
        ax.plot([x, x], [1.0, 7.5], color=GRID, linestyle="--")
    messages = [
        (7.0, 6.9, 4.0, "1. Selecciona materia y solicita tutoría"),
        (4.0, 6.1, 7.0, "2. POST /api/v1/solicitudes"),
        (7.0, 5.3, 13.2, "3. Lee solicitudes, tutores y materias"),
        (7.0, 4.5, 10.0, "4. Ejecuta simulación de asignación"),
        (10.0, 3.7, 7.0, "5. Devuelve candidatos y fitness"),
        (7.0, 2.9, 13.2, "6. Guarda asignaciones aplicadas"),
        (7.0, 2.1, 4.0, "7. Respuesta con tutor y horario"),
        (4.0, 1.3, 1.2, "8. Muestra agenda y notificaciones"),
    ]
    for source, y, target, label in messages:
        arrow(ax, (source, y), (target, y), label, color=BLUE, curve=0)
    save(fig, "04_secuencia_asignacion.png")


def actividades():
    fig, ax = canvas("TutorMatch — Actividades del ciclo de tutoría")
    lanes = [("Estudiante", 0.5, 3.0, ORANGE), ("Sistema TutorMatch", 5.3, 5.0, BLUE), ("Tutor", 12.0, 3.0, GREEN)]
    for label, x, w, color in lanes:
        ax.add_patch(FancyBboxPatch((x, 0.8), w, 6.8, boxstyle="round,pad=0.02",
                                    linewidth=1.5, edgecolor=color, facecolor="#ffffff"))
        ax.text(x + w / 2, 7.3, label, ha="center", fontsize=11, fontweight="bold", color=color)
    steps = [
        (1.0, 5.7, "Seleccionar materia"),
        (1.0, 3.8, "Enviar solicitud"),
        (5.8, 5.7, "Validar datos"),
        (5.8, 4.3, "Buscar candidatos"),
        (5.8, 2.9, "Asignar tutor y horario"),
        (5.8, 1.5, "Notificar participantes"),
        (12.5, 4.3, "Revisar disponibilidad"),
        (12.5, 2.4, "Confirmar sesión"),
    ]
    for x, y, text in steps:
        color = ORANGE if x < 3 else GREEN if x > 10 else BLUE
        box(ax, x, y, 2.4 if x < 3 else 3.8 if x < 10 else 2.0, 0.8, text, color, "#f8fafc", 9)
    for start, end in [
        ((2.2, 5.7), (2.2, 4.6)), ((2.2, 4.0), (5.8, 6.1)),
        ((7.7, 5.7), (7.7, 5.1)), ((7.7, 4.3), (7.7, 3.7)),
        ((7.7, 2.9), (7.7, 2.3)), ((9.6, 1.9), (12.5, 4.7)),
        ((13.5, 4.3), (13.5, 3.2)),
    ]:
        arrow(ax, start, end, color=GRAY)
    save(fig, "05_actividades_ciclo_tutoria.png")


def despliegue():
    fig, ax = canvas("TutorMatch — Diagrama de despliegue actual")
    box(ax, 0.7, 5.4, 3.0, 1.6, "Navegador / celular\nPWA React\nService Worker + IndexedDB", BLUE)
    box(ax, 5.0, 5.4, 3.0, 1.6, "Hosting estático\nBuild de Vite\nHTML, CSS y JS", CYAN, "#ecfeff")
    box(ax, 9.3, 5.4, 3.0, 1.6, "Contenedor backend\nFastAPI + Uvicorn\nDocker", GREEN, "#f0fdf4")
    box(ax, 13.0, 5.4, 2.2, 1.6, "PostgreSQL\nBase de datos", ORANGE, "#fff7ed")
    arrow(ax, (3.7, 6.2), (5.0, 6.2), "HTTPS")
    arrow(ax, (8.0, 6.2), (9.3, 6.2), "REST / JSON")
    arrow(ax, (12.3, 6.2), (13.0, 6.2), "SQL")
    box(ax, 5.0, 2.3, 3.0, 1.6, "Almacenamiento local\nCaché offline\nCambios pendientes", PURPLE, "#faf5ff")
    box(ax, 9.3, 2.3, 3.0, 1.6, "Motor de optimización\nAlgoritmo genético\nSimular / aplicar", PURPLE, "#faf5ff")
    arrow(ax, (2.2, 5.4), (6.2, 3.9), "persiste offline", color=PURPLE)
    arrow(ax, (10.8, 5.4), (10.8, 3.9), "ejecuta", color=PURPLE)
    ax.text(8, 1.1, "Pendiente para producción: autenticación segura, correo/push y sincronización offline real.",
            ha="center", fontsize=11, color=GRAY)
    save(fig, "06_despliegue_actual.png")


def main():
    arquitectura()
    casos_de_uso()
    entidad_relacion()
    secuencia()
    actividades()
    despliegue()
    print(f"Diagramas generados en: {OUTPUT}")


if __name__ == "__main__":
    main()
