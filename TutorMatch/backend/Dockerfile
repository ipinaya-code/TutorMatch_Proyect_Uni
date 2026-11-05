# Usamos una imagen ligera oficial de Python
FROM python:3.11-slim

# Evita que Python escriba archivos .pyc y fuerza salida por consola directa
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos lista de dependencias e instalamos
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del backend
COPY . /app/

# Exponemos el puerto de la API
EXPOSE 8000

# Comando para iniciar el servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

