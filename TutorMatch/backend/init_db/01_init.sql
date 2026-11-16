-- ==============================================================
-- BASE DE DATOS TUTORMATCH — EMI COCHABAMBA
-- Sistema Recomendador con Redes Neuronales PyTorch (CNN + BiLSTM)
-- Estudiantes Oficiales (Relación Nominal) y 15 Docentes Tutores
-- ==============================================================

-- 1. Tabla de Usuarios (Autenticación Institucional Única)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,       -- Correo institucional
    codigo_saga VARCHAR(50) NOT NULL,         -- Código SAGA oficial (usado como contraseña)
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('estudiante', 'docente', 'revisor')),
    carrera VARCHAR(100) DEFAULT 'Ingeniería de Sistemas',
    semestre INT DEFAULT 8,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfil y Especialidades del Docente (15 Docentes de la EMI)
CREATE TABLE IF NOT EXISTS docente_perfiles (
    id SERIAL PRIMARY KEY,
    docente_id INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cursos_dictados TEXT,
    especialidades TEXT NOT NULL,
    pupilos_asignados INT DEFAULT 0,          -- Máximo 3 pupilos según reglamento
    cupo_maximo INT DEFAULT 3,
    experiencia_anios INT DEFAULT 10,
    activo_como_tutor BOOLEAN DEFAULT TRUE,
    activo_como_revisor BOOLEAN DEFAULT TRUE
);

-- 3. Proyectos de Grado (Propuestas / Tesis)
CREATE TABLE IF NOT EXISTS proyectos_grado (
    id SERIAL PRIMARY KEY,
    estudiante_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo_tentativo TEXT NOT NULL,
    palabras_clave TEXT,
    pdf_documento_url VARCHAR(255),
    grupo_propuesta_id UUID,
    docente_tutor_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    estado VARCHAR(30) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado_a_tutor', 'aceptado', 'rechazado', 'expirado_72h', 'revisor_asignado')),
    fecha_envio TIMESTAMP,
    fecha_limite_72h TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    observacion_tutor TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Revisores del Proyecto (Designados automáticamente)
CREATE TABLE IF NOT EXISTS proyecto_revisores (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL REFERENCES proyectos_grado(id) ON DELETE CASCADE,
    revisor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    afinidad_score NUMERIC(5, 2) DEFAULT 0.0,
    estado VARCHAR(30) DEFAULT 'asignado',
    asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_proyecto_revisor UNIQUE (proyecto_id, revisor_id)
);

-- 5. Buzón de Notificaciones
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
-- INSERCIÓN DE LOS 15 DOCENTES OFICIALES (CATÁLOGO TUTORMATCH)
-- ==============================================================
INSERT INTO usuarios (id, nombre, email, codigo_saga, password_hash, rol, semestre)
VALUES
    (1, 'Ing. Marcelo Quiroga', 'mquiroga@adm.emi.edu.bo', 'DOC-1001', 'DOC-1001', 'docente', 10),
    (2, 'Ing. Roberto Mendoza', 'rmendoza@adm.emi.edu.bo', 'DOC-1002', 'DOC-1002', 'docente', 10),
    (3, 'Ing. Patricia Soria', 'psoria@adm.emi.edu.bo', 'DOC-1003', 'DOC-1003', 'docente', 10),
    (4, 'Ing. Carlos Arce', 'carce@adm.emi.edu.bo', 'DOC-1004', 'DOC-1004', 'docente', 10),
    (5, 'Ing. Valeria Torrico', 'vtorrico@adm.emi.edu.bo', 'DOC-1005', 'DOC-1005', 'docente', 10),
    (6, 'Ing. Fernando Rojas', 'frojas@adm.emi.edu.bo', 'DOC-1006', 'DOC-1006', 'docente', 10),
    (7, 'Ing. Andrea Morales', 'amorales@adm.emi.edu.bo', 'DOC-1007', 'DOC-1007', 'docente', 10),
    (8, 'Lic. Gabriela Paz', 'gpaz@adm.emi.edu.bo', 'DOC-1008', 'DOC-1008', 'docente', 10),
    (9, 'Ing. Hugo Zeballos', 'hzeballos@adm.emi.edu.bo', 'DOC-1009', 'DOC-1009', 'docente', 10),
    (10, 'Ing. Claudia Medina', 'cmedina@adm.emi.edu.bo', 'DOC-1010', 'DOC-1010', 'docente', 10),
    (11, 'Ing. Diego Flores', 'dflores@adm.emi.edu.bo', 'DOC-1011', 'DOC-1011', 'docente', 10),
    (12, 'Ing. Paola Vargas', 'pvargas@adm.emi.edu.bo', 'DOC-1012', 'DOC-1012', 'docente', 10),
    (13, 'Ing. Sergio Camacho', 'scamacho@adm.emi.edu.bo', 'DOC-1013', 'DOC-1013', 'docente', 10),
    (14, 'Ing. Lucía Benítez', 'lbenitez@adm.emi.edu.bo', 'DOC-1014', 'DOC-1014', 'docente', 10),
    (15, 'Ing. Javier Navarro', 'jnavarro@adm.emi.edu.bo', 'DOC-1015', 'DOC-1015', 'docente', 10)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    email = EXCLUDED.email,
    codigo_saga = EXCLUDED.codigo_saga;

-- Especialidades y cupos de los 15 docentes
INSERT INTO docente_perfiles (docente_id, cursos_dictados, especialidades, pupilos_asignados)
VALUES
    (1, 'Inteligencia Artificial, Visión por Computadora', 'Inteligencia Artificial, Visión por Computadora, Redes Neuronales', 0),
    (2, 'Desarrollo Web, Arquitectura de Software', 'Desarrollo Web, Fullstack, Arquitectura de Software', 0),
    (3, 'Ciberseguridad, Redes de Comunicación', 'Ciberseguridad, Redes, Hacking Ético, Infraestructura', 0),
    (4, 'Sistemas Embebidos, Robótica', 'Internet de las Cosas (IoT), Robótica, Sistemas Embebidos', 0),
    (5, 'Minería de Datos, Machine Learning', 'Ciencia de Datos, Machine Learning, Análisis Estadístico', 0),
    (6, 'Sistemas Distribuidos, Cloud', 'Cloud Computing, DevOps, Microservicios, Kubernetes', 0),
    (7, 'Gestión de Proyectos TI, Metodologías Ágiles', 'Gestión de Proyectos TI, Metodologías Ágiles, Scrum, ITIL', 0),
    (8, 'Bases de Datos I y II, Big Data', 'Bases de Datos, Big Data, SQL/NoSQL, Minería de Datos', 0),
    (9, 'Desarrollo Móvil Multiplataforma', 'Desarrollo Móvil (Android/iOS), Flutter, React Native', 0),
    (10, 'Informática Médica, Bioinformática', 'Bioinformática, Sistemas de Salud Digital, Telemedicina', 0),
    (11, 'Sistemas Distribuidos, Criptografía', 'Sistemas Distribuidos, Blockchain, Criptografía Aplicada', 0),
    (12, 'Computación Gráfica, Videojuegos', 'Realidad Virtual, Realidad Aumentada, Videojuegos', 0),
    (13, 'Automatización y Control, SCADA', 'Automatización Industrial, PLC, SCADA, Domótica', 0),
    (14, 'Modelos de Lenguaje, Chatbots', 'Procesamiento de Lenguaje Natural (NLP), Chatbots, LLMs', 0),
    (15, 'Calidad de Software, Auditoría', 'Auditoría de Sistemas, Calidad de Software, Testing QA', 0)
ON CONFLICT (docente_id) DO UPDATE SET
    especialidades = EXCLUDED.especialidades,
    cursos_dictados = EXCLUDED.cursos_dictados,
    pupilos_asignados = EXCLUDED.pupilos_asignados;

-- ==============================================================
-- INSERCIÓN DE ESTUDIANTES OFICIALES (RELACIÓN NOMINAL EMI)
-- Ingresan con su correo institucional y su Código SAGA
-- ==============================================================
INSERT INTO usuarios (nombre, email, codigo_saga, password_hash, rol, semestre)
VALUES
    ('Joaquin Rodrigo Ocampo Valdivia', 'jocampov@est.emi.edu.bo', 'C11550-9', 'C11550-9', 'estudiante', 8),
    ('Erlan Ostin Sanchez Yucra', 'esanchezy@est.emi.edu.bo', 'C11591-6', 'C11591-6', 'estudiante', 8),
    ('Maria del Carmen Villarpando Yucra', 'mvillarpandoy@est.emi.edu.bo', 'C11379-4', 'C11379-4', 'estudiante', 8),
    ('Juan Pablo Jimenez Siles', 'jjimenezs@est.emi.edu.bo', 'C11522-3', 'C11522-3', 'estudiante', 8),
    ('Sharaid Gabriela Cruz Serrano', 'scruzs@est.emi.edu.bo', 'C11424-3', 'C11424-3', 'estudiante', 8),
    ('Thiago Leonardo Sossa Chugar', 'tsossac@est.emi.edu.bo', 'C11627-0', 'C11627-0', 'estudiante', 8),
    ('Marcelo Fabricio Delgado Cardozo', 'mdelgadoc@est.emi.edu.bo', 'C11947-4', 'C11947-4', 'estudiante', 8),
    ('Richard Simon Vargas Cachi', 'rvargasc@est.emi.edu.bo', 'C11596-7', 'C11596-7', 'estudiante', 8),
    ('Carlos David Luna Arebalo', 'clunaa@est.emi.edu.bo', 'C10202-4', 'C10202-4', 'estudiante', 8),
    ('Carlos Daniel Ledezma Arias', 'cledezmaa@est.emi.edu.bo', 'C10170-2', 'C10170-2', 'estudiante', 8),
    ('Alexander Mamani Coyo', 'amamanic@est.emi.edu.bo', 'C9924-4', 'C9924-4', 'estudiante', 8),
    ('Nataly Karen Quispe Cordero', 'nquispec@est.emi.edu.bo', 'C11032-9', 'C11032-9', 'estudiante', 8),
    ('Elvin Andres Gutierrez Lozano', 'egutierrezl@est.emi.edu.bo', 'C11773-0', 'C11773-0', 'estudiante', 8),
    ('Lucio Alfredo Mercado Mendoza', 'lmercadom@est.emi.edu.bo', 'C10748-4', 'C10748-4', 'estudiante', 8),
    ('Rubi Natalie Carballo Saavedra', 'rcarballos@est.emi.edu.bo', 'C10797-2', 'C10797-2', 'estudiante', 8),
    ('Angel Gabriel Rocha Tarqui', 'arochat@est.emi.edu.bo', 'A26895-X', 'A26895-X', 'estudiante', 8),
    ('Dilan Itamar Muriel Vargas', 'dmurielv@est.emi.edu.bo', 'C11475-8', 'C11475-8', 'estudiante', 8),
    ('Juan Falcao Conde Casas', 'jcondec@est.emi.edu.bo', 'C11495-2', 'C11495-2', 'estudiante', 8),
    ('Yadir Dilan Llanque Canedo', 'yllanquec@est.emi.edu.bo', 'C11881-8', 'C11881-8', 'estudiante', 8),
    ('Marco Antonio Quintana Callejas', 'mquintanac@est.emi.edu.bo', 'C11613-0', 'C11613-0', 'estudiante', 8),
    ('Juan Rodolfo Murillo Rodriguez', 'jmurillor@est.emi.edu.bo', 'C11251-8', 'C11251-8', 'estudiante', 8),
    ('Damaris Dariane Muriel Altamirano', 'dmuriela@est.emi.edu.bo', 'C11389-1', 'C11389-1', 'estudiante', 8),
    ('George Pablo Zurita Gutierrez', 'gzuritag@est.emi.edu.bo', 'C11942-3', 'C11942-3', 'estudiante', 8),
    ('Jherson Adolfo Pinto Lujan', 'jpintol@est.emi.edu.bo', 'C11546-0', 'C11546-0', 'estudiante', 8),
    ('Wilson Oscar Gonzales Jimenez', 'wgonzalesj@est.emi.edu.bo', 'C11680-7', 'C11680-7', 'estudiante', 8),
    ('Nataly Nicole Crespo Arriarán', 'ncrespoa@est.emi.edu.bo', 'C11483-9', 'C11483-9', 'estudiante', 8),
    ('Iver Pinaya Verduguez', 'ipinayav@est.emi.edu.bo', 'C11368-9', 'C11368-9', 'estudiante', 8),
    ('Mariano Julian Herbas Quispe', 'mherbasq@est.emi.edu.bo', 'C9499-4', 'C9499-4', 'estudiante', 8),
    ('Leonel Aduviri Calizaya', 'laduviric@est.emi.edu.bo', 'C11515-0', 'C11515-0', 'estudiante', 8),
    ('Carlos Ronald Villca Calcina', 'cvillcac@est.emi.edu.bo', 'C10926-6', 'C10926-6', 'estudiante', 8),
    ('Kevin Carlos Portanda Lupa', 'kportandal@est.emi.edu.bo', 'C8597-5', 'C8597-5', 'estudiante', 8),
    ('Arian Alejandro Solís Rojas', 'asolisr@est.emi.edu.bo', 'C11612-2', 'C11612-2', 'estudiante', 8)
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    codigo_saga = EXCLUDED.codigo_saga,
    password_hash = EXCLUDED.password_hash;
