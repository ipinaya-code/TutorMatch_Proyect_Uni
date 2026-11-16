from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

def crear_pdf():
    doc = SimpleDocTemplate("propuesta_tema.pdf", pagesize=letter,
                          rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=18)

    styles = getSampleStyleSheet()
    story = []

    # Estilo personalizado para títulos
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor='black'
    )

    # Estilo para subtítulos
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=10,
        spaceBefore=15,
        textColor='black'
    )

    # Estilo para texto normal
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=14
    )

    # Leer el archivo de texto
    with open("propuesta_tema.txt", "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.1*inch))
            continue

        # Líneas de separación (===)
        if line.startswith("=" * 60):
            story.append(Spacer(1, 0.1*inch))
            continue

        # Títulos principales (todo mayúsculas y al final)
        if line.isupper() and ":" in line:
            story.append(Paragraph(line, title_style))
        # Subtítulos (primera letra mayúscula y dos puntos)
        elif ":" in line and not line.startswith("-"):
            story.append(Paragraph(line, subtitle_style))
        # Listas (guión)
        elif line.startswith("-"):
            story.append(Paragraph(line, normal_style))
        # Texto normal
        else:
            story.append(Paragraph(line, normal_style))

    doc.build(story)
    print("PDF creado exitosamente: propuesta_tema.pdf")

if __name__ == "__main__":
    crear_pdf()
