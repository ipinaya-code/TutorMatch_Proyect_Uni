-- ==============================================================
-- BASE DE DATOS TUTORMATCH — EMI COCHABAMBA
-- Sistema Recomendador con Redes Neuronales para Proyectos de Grado
-- Población: Ingeniería de Sistemas (8vo y 9no semestre)
-- Roles: Estudiantes, Docentes (Tutores), Revisores
-- ==============================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,      -- Ejm: ipinayav@est.emi.edu.bo o docente@adm.emi.edu.bo
    codigo_saga VARCHAR(50) NOT NULL,        -- Ejm: C11368-9 (usado como contraseña o credencial oficial)
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('estudiante', 'docente', 'revisor')),
    carrera VARCHAR(100) DEFAULT 'Ingeniería de Sistemas',
    semestre INT DEFAULT 8,                  -- Estudiantes de 8vo o 9no
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfil y Especialidades del Docente / Revisor
-- Registra cursos que dicta, áreas de experiencia y temas donde destaca
CREATE TABLE IF NOT EXISTS docente_perfiles (
    id SERIAL PRIMARY KEY,
    docente_id INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cursos_dictados TEXT,                    -- Cursos/materias asignadas (ej: Inteligencia Artificial, Ing. de Software)
    especialidades TEXT NOT NULL,            -- Palabras clave/áreas: "IA, Automatización, Redes, Cloud, Machine Learning"
    experiencia_anios INT DEFAULT 5,
    biografia TEXT,
    activo_como_tutor BOOLEAN DEFAULT TRUE,
    activo_como_revisor BOOLEAN DEFAULT TRUE
);

-- 3. Proyectos de Grado (Propuestas / Tesis)
CREATE TABLE IF NOT EXISTS proyectos_grado (
    id SERIAL PRIMARY KEY,
    estudiante_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo_tentativo TEXT NOT NULL,          -- Ejm: "Sistema de Automatización con IA para Restaurante Armando Arquitectura MVC"
    palabras_clave TEXT,                     -- Palabras clave extraídas por NLP/Red Neuronal: "IA, arquitectura, automatización"
    pdf_documento_url VARCHAR(255),          -- Archivo PDF con la propuesta formal enviada por el estudiante
    docente_tutor_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(30) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado_a_tutor', 'aceptado', 'rechazado', 'expirado_72h')),
    fecha_envio TIMESTAMP,                   -- Momento en que se envía el PDF al tutor
    fecha_limite_72h TIMESTAMP,              -- fecha_envio + 72 horas de plazo
    fecha_respuesta TIMESTAMP,
    observacion_tutor TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Revisores Recomendados y Designados para el Proyecto
-- Se recomiendan y asignan automáticamente cuando el docente tutor acepta el proyecto
CREATE TABLE IF NOT EXISTS proyecto_revisores (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL REFERENCES proyectos_grado(id) ON DELETE CASCADE,
    revisor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    afinidad_score NUMERIC(5, 2) DEFAULT 0.0, -- Score de compatibilidad neuronal con el tema
    estado VARCHAR(30) DEFAULT 'recomendado' CHECK (estado IN ('recomendado', 'asignado', 'confirmado')),
    asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_proyecto_revisor UNIQUE (proyecto_id, revisor_id)
);

-- 5. Buzón de Notificaciones por Correo / Sistema
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    proyecto_id INT REFERENCES proyectos_grado(id) ON DELETE CASCADE,
    asunto VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    enviado_a_email VARCHAR(120),
    leido BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- DATOS INICIALES (DOCENTES Y ESTUDIANTES EMI)
-- Credenciales según especificación: Correo institucional + Código SAGA
-- ==============================================================

INSERT INTO usuarios (nombre, email, codigo_saga, password_hash, rol, semestre)
VALUES
    -- Docentes / Tutores
    ('Ing. Roberto Mendoza', 'rmendoza@adm.emi.edu.bo', 'DOC-8821', 'DOC-8821', 'docente', 10),
    ('Ing. Patricia Soria', 'psoria@adm.emi.edu.bo', 'DOC-9412', 'DOC-9412', 'docente', 10),
    ('Ing. Carlos Fernández', 'cfernandez@adm.emi.edu.bo', 'DOC-7319', 'DOC-7319', 'docente', 10),
    ('Ing. Andrea Arce', 'aarce@adm.emi.edu.bo', 'DOC-6204', 'DOC-6204', 'docente', 10),
    -- Estudiante de 8vo/9no semestre (ejemplo oficial del PDF)
    ('Iver Piñaya Vargas', 'ipinayav@est.emi.edu.bo', 'C11368-9', 'C11368-9', 'estudiante', 8)
ON CONFLICT (email) DO NOTHING;

-- Perfiles y Especialidades de los Docentes
INSERT INTO docente_perfiles (docente_id, cursos_dictados, especialidades, experiencia_anios)
VALUES
    (1, 'Inteligencia Artificial, Sistemas Expertos, Robótica', 'IA, Inteligencia Artificial, Machine Learning, Redes Neuronales, Automatización, Python', 12),
    (2, 'Ingeniería de Software, Arquitectura de Software, Metodologías Ágiles', 'Arquitectura de Software, MVC, Microservicios, Cloud Computing, DevOps, Patrones de Diseño', 9),
    (3, 'Bases de Datos, Seguridad Informática, Auditoría de Sistemas', 'Bases de Datos, SQL, Ciberseguridad, Blockchain, Redes, Gestión de Información', 15),
    (4, 'Desarrollo Web, Dispositivos Móviles, Interacción Humano-Computador', 'Desarrollo Web, PWA, Frontend, Mobile Apps, UX/UI, Full Stack', 8)
ON CONFLICT (docente_id) DO NOTHING;
