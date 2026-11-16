-- Sincroniza las especialidades oficiales en instalaciones existentes.
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS codigo_saga VARCHAR(50);

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios
    ADD CONSTRAINT usuarios_rol_check
    CHECK (rol IN ('estudiante', 'docente', 'revisor', 'tutor', 'coordinador'));

UPDATE usuarios
SET rol = 'docente'
WHERE rol = 'tutor';

CREATE TABLE IF NOT EXISTS docente_perfiles (
    id SERIAL PRIMARY KEY,
    docente_id INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cursos_dictados TEXT,
    especialidades TEXT NOT NULL,
    pupilos_asignados INT DEFAULT 0,
    cupo_maximo INT DEFAULT 3,
    experiencia_anios INT DEFAULT 10,
    activo_como_tutor BOOLEAN DEFAULT TRUE,
    activo_como_revisor BOOLEAN DEFAULT TRUE
);

INSERT INTO usuarios (nombre, email, codigo_saga, password_hash, rol, semestre)
VALUES
    ('Ing. Marcelo Quiroga', 'mquiroga@adm.emi.edu.bo', 'DOC-1001', 'DOC-1001', 'docente', 10),
    ('Ing. Roberto Mendoza', 'rmendoza@adm.emi.edu.bo', 'DOC-1002', 'DOC-1002', 'docente', 10),
    ('Ing. Patricia Soria', 'psoria@adm.emi.edu.bo', 'DOC-1003', 'DOC-1003', 'docente', 10),
    ('Ing. Carlos Arce', 'carce@adm.emi.edu.bo', 'DOC-1004', 'DOC-1004', 'docente', 10),
    ('Ing. Valeria Torrico', 'vtorrico@adm.emi.edu.bo', 'DOC-1005', 'DOC-1005', 'docente', 10),
    ('Ing. Fernando Rojas', 'frojas@adm.emi.edu.bo', 'DOC-1006', 'DOC-1006', 'docente', 10),
    ('Ing. Andrea Morales', 'amorales@adm.emi.edu.bo', 'DOC-1007', 'DOC-1007', 'docente', 10),
    ('Lic. Gabriela Paz', 'gpaz@adm.emi.edu.bo', 'DOC-1008', 'DOC-1008', 'docente', 10),
    ('Ing. Hugo Zeballos', 'hzeballos@adm.emi.edu.bo', 'DOC-1009', 'DOC-1009', 'docente', 10),
    ('Ing. Claudia Medina', 'cmedina@adm.emi.edu.bo', 'DOC-1010', 'DOC-1010', 'docente', 10),
    ('Ing. Diego Flores', 'dflores@adm.emi.edu.bo', 'DOC-1011', 'DOC-1011', 'docente', 10),
    ('Ing. Paola Vargas', 'pvargas@adm.emi.edu.bo', 'DOC-1012', 'DOC-1012', 'docente', 10),
    ('Ing. Sergio Camacho', 'scamacho@adm.emi.edu.bo', 'DOC-1013', 'DOC-1013', 'docente', 10),
    ('Ing. Lucía Benítez', 'lbenitez@adm.emi.edu.bo', 'DOC-1014', 'DOC-1014', 'docente', 10),
    ('Ing. Javier Navarro', 'jnavarro@adm.emi.edu.bo', 'DOC-1015', 'DOC-1015', 'docente', 10)
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    codigo_saga = EXCLUDED.codigo_saga,
    password_hash = EXCLUDED.password_hash,
    rol = EXCLUDED.rol;

INSERT INTO docente_perfiles (docente_id, cursos_dictados, especialidades, pupilos_asignados)
SELECT
    u.id,
    CASE u.email
        WHEN 'mquiroga@adm.emi.edu.bo' THEN 'Inteligencia Artificial, Visión por Computadora'
        WHEN 'rmendoza@adm.emi.edu.bo' THEN 'Desarrollo Web, Arquitectura de Software'
        WHEN 'psoria@adm.emi.edu.bo' THEN 'Ciberseguridad, Redes de Comunicación'
        WHEN 'carce@adm.emi.edu.bo' THEN 'Sistemas Embebidos, Robótica'
        WHEN 'vtorrico@adm.emi.edu.bo' THEN 'Minería de Datos, Machine Learning'
        WHEN 'frojas@adm.emi.edu.bo' THEN 'Sistemas Distribuidos, Cloud'
        WHEN 'amorales@adm.emi.edu.bo' THEN 'Gestión de Proyectos TI, Metodologías Ágiles'
        WHEN 'gpaz@adm.emi.edu.bo' THEN 'Bases de Datos I y II, Big Data'
        WHEN 'hzeballos@adm.emi.edu.bo' THEN 'Desarrollo Móvil Multiplataforma'
        WHEN 'cmedina@adm.emi.edu.bo' THEN 'Informática Médica, Bioinformática'
        WHEN 'dflores@adm.emi.edu.bo' THEN 'Sistemas Distribuidos, Criptografía'
        WHEN 'pvargas@adm.emi.edu.bo' THEN 'Computación Gráfica, Videojuegos'
        WHEN 'scamacho@adm.emi.edu.bo' THEN 'Automatización y Control, SCADA'
        WHEN 'lbenitez@adm.emi.edu.bo' THEN 'Modelos de Lenguaje, Chatbots'
        WHEN 'jnavarro@adm.emi.edu.bo' THEN 'Calidad de Software, Auditoría'
    END,
    CASE u.email
        WHEN 'mquiroga@adm.emi.edu.bo' THEN 'Inteligencia Artificial, Visión por Computadora, Redes Neuronales'
        WHEN 'rmendoza@adm.emi.edu.bo' THEN 'Desarrollo Web, Fullstack, Arquitectura de Software'
        WHEN 'psoria@adm.emi.edu.bo' THEN 'Ciberseguridad, Redes, Hacking Ético, Infraestructura'
        WHEN 'carce@adm.emi.edu.bo' THEN 'Internet de las Cosas (IoT), Robótica, Sistemas Embebidos'
        WHEN 'vtorrico@adm.emi.edu.bo' THEN 'Ciencia de Datos, Machine Learning, Análisis Estadístico'
        WHEN 'frojas@adm.emi.edu.bo' THEN 'Cloud Computing, DevOps, Microservicios, Kubernetes'
        WHEN 'amorales@adm.emi.edu.bo' THEN 'Gestión de Proyectos TI, Metodologías Ágiles, Scrum, ITIL'
        WHEN 'gpaz@adm.emi.edu.bo' THEN 'Bases de Datos, Big Data, SQL/NoSQL, Minería de Datos'
        WHEN 'hzeballos@adm.emi.edu.bo' THEN 'Desarrollo Móvil (Android/iOS), Flutter, React Native'
        WHEN 'cmedina@adm.emi.edu.bo' THEN 'Bioinformática, Sistemas de Salud Digital, Telemedicina'
        WHEN 'dflores@adm.emi.edu.bo' THEN 'Sistemas Distribuidos, Blockchain, Criptografía Aplicada'
        WHEN 'pvargas@adm.emi.edu.bo' THEN 'Realidad Virtual, Realidad Aumentada, Videojuegos'
        WHEN 'scamacho@adm.emi.edu.bo' THEN 'Automatización Industrial, PLC, SCADA, Domótica'
        WHEN 'lbenitez@adm.emi.edu.bo' THEN 'Procesamiento de Lenguaje Natural (NLP), Chatbots, LLMs'
        WHEN 'jnavarro@adm.emi.edu.bo' THEN 'Auditoría de Sistemas, Calidad de Software, Testing QA'
    END,
    0
FROM usuarios u
WHERE u.email LIKE '%@adm.emi.edu.bo'
ON CONFLICT (docente_id) DO UPDATE SET
    cursos_dictados = EXCLUDED.cursos_dictados,
    especialidades = EXCLUDED.especialidades,
    pupilos_asignados = EXCLUDED.pupilos_asignados;

