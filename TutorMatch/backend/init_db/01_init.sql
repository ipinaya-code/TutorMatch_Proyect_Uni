-- ==============================================================
-- BASE DE DATOS TUTORMATCH (PostgreSQL)
-- Tablas principales según Modelo Entidad-Relación y Requisitos
-- ==============================================================

-- 1. Tabla de Usuarios (Estudiantes, Tutores, Coordinadores)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('estudiante', 'tutor', 'coordinador')),
    carrera VARCHAR(100) DEFAULT 'Ingeniería de Sistemas',
    semestre INT DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Materias
CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    semestre INT NOT NULL,
    es_tutorable BOOLEAN DEFAULT TRUE
);

-- 3. Disponibilidad horaria de tutores
CREATE TABLE IF NOT EXISTS disponibilidades (
    id SERIAL PRIMARY KEY,
    tutor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL, -- Lunes, Martes, Miércoles, etc.
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

-- 4. Materias que imparte cada tutor
CREATE TABLE IF NOT EXISTS tutor_materias (
    id SERIAL PRIMARY KEY,
    tutor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    materia_id INT NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    calificacion_obtenida INT DEFAULT 70,
    CONSTRAINT uq_tutor_materia UNIQUE (tutor_id, materia_id)
);

-- 5. Solicitudes de Tutoría
CREATE TABLE IF NOT EXISTS solicitudes_tutoria (
    id SERIAL PRIMARY KEY,
    estudiante_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    materia_id INT NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    tutor_id INT REFERENCES usuarios(id) ON DELETE SET NULL, -- Se asigna manual o por algoritmo
    estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'asignada', 'completada', 'cancelada')),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- 6. Evaluaciones / Retroalimentación de la tutoría
CREATE TABLE IF NOT EXISTS evaluaciones (
    id SERIAL PRIMARY KEY,
    solicitud_id INT UNIQUE NOT NULL REFERENCES solicitudes_tutoria(id) ON DELETE CASCADE,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- DATOS INICIALES DE PRUEBA (SEED)
-- Credenciales de prueba: 1234
-- ==============================================================

INSERT INTO usuarios (nombre, email, password_hash, rol, semestre)
VALUES 
    ('Coordinador General', 'coord@emi.demo', '1234', 'coordinador', 1),
    ('Ana Rojas', 'ana@emi.demo', '1234', 'tutor', 7),
    ('Camila Vargas', 'camila@emi.demo', '1234', 'estudiante', 2)
ON CONFLICT (email) DO NOTHING;

INSERT INTO materias (codigo, nombre, semestre, es_tutorable)
VALUES 
    ('SIS-101', 'Programación Básica I', 1, TRUE),
    ('SIS-102', 'Cálculo I', 1, TRUE),
    ('SIS-201', 'Estructuras de Datos', 2, TRUE),
    ('SIS-301', 'Bases de Datos I', 3, TRUE)
ON CONFLICT (codigo) DO NOTHING;

