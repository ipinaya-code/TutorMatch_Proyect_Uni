-- Flujo de propuestas a un máximo de dos docentes.
CREATE TABLE IF NOT EXISTS proyectos_grado (
    id SERIAL PRIMARY KEY,
    estudiante_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo_tentativo TEXT NOT NULL,
    palabras_clave TEXT,
    pdf_documento_url VARCHAR(255),
    grupo_propuesta_id UUID,
    docente_tutor_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(30) DEFAULT 'borrador',
    fecha_envio TIMESTAMP,
    fecha_limite_72h TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    observacion_tutor TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proyecto_revisores (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL REFERENCES proyectos_grado(id) ON DELETE CASCADE,
    revisor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    afinidad_score NUMERIC(5, 2) DEFAULT 0.0,
    estado VARCHAR(30) DEFAULT 'asignado',
    asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_proyecto_revisor UNIQUE (proyecto_id, revisor_id)
);

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

ALTER TABLE proyectos_grado
    ADD COLUMN IF NOT EXISTS grupo_propuesta_id UUID;

ALTER TABLE proyectos_grado
    DROP CONSTRAINT IF EXISTS proyectos_grado_estado_check;

ALTER TABLE proyectos_grado
    ADD CONSTRAINT proyectos_grado_estado_check
    CHECK (estado IN (
        'borrador',
        'enviado_a_tutor',
        'aceptado',
        'rechazado',
        'expirado_72h',
        'revisor_asignado'
    ));

CREATE INDEX IF NOT EXISTS idx_proyectos_grupo_propuesta
    ON proyectos_grado(grupo_propuesta_id);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_no_leidas
    ON notificaciones(usuario_id, leido, creado_en DESC);
