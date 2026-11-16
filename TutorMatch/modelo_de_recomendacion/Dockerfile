# ─────────────────────────────────────────────────────────────
# Dockerfile — Sistema de Recomendación de Tutores
# Imagen base ligera con PyTorch CPU para máxima compatibilidad.
# ─────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Evitar prompts interactivos y configurar encoding
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=42 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch==2.1.2 --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt && \
    pip cache purge

# Copiar código fuente
COPY app/ ./app/
COPY entrenar.py .
COPY recomendar.py .

# Crear directorios para datos y artefactos (se montan como volúmenes)
RUN mkdir -p /app/datos /app/artefactos

# Puerto de la API
EXPOSE 8000

# Comando por defecto: entrenar + iniciar API
CMD ["sh", "-c", "python entrenar.py && python recomendar.py --api"]
