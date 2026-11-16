// Catálogo oficial de datos individualizados por cada uno de los 15 docentes tutores
// Especialidades exactas según la lista oficial del catálogo TutorMatch EMI

export const PERFILES_Y_HORARIOS_DOCENTES = {

  'mquiroga@adm.emi.edu.bo': {
    id: 1,
    nombre: 'Ing. Marcelo Quiroga',
    codigo_saga: 'DOC-1001',
    experienciaLaboral: '14 años de trayectoria en docencia universitaria e investigación aplicada. Especialista en Visión Artificial, Deep Learning y Automatización Inteligente. Asesor de más de 25 proyectos de grado en Inteligencia Artificial y Robótica.',
    materiasDestacadas: ['Inteligencia Artificial', 'Visión por Computadora', 'Redes Neuronales'],
    certificados: [
      { id: 1, titulo: 'Deep Learning Specialization (DeepLearning.AI / Coursera)', anio: '2023' },
      { id: 2, titulo: 'Certified Computer Vision Professional (OpenCV University)', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Docencia para Educación Superior (EMI)', anio: '2019' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '07:30 - 09:45', materia: 'Inteligencia Artificial', curso: '8vo Semestre A', aula: 'Laboratorio de IA 1' },
      { dia: 'Miércoles',hora: '07:30 - 09:45', materia: 'Inteligencia Artificial', curso: '8vo Semestre A', aula: 'Laboratorio de IA 1' },
      { dia: 'Jueves',   hora: '10:00 - 12:15', materia: 'Visión Computacional',    curso: '9no Semestre B', aula: 'Aula Magna 3' },
      { dia: 'Viernes',  hora: '08:15 - 10:30', materia: 'Taller de Grado I',       curso: '8vo Semestre',   aula: 'Sala de Grado' }
    ]
  },

  'rmendoza@adm.emi.edu.bo': {
    id: 2,
    nombre: 'Ing. Roberto Mendoza',
    codigo_saga: 'DOC-1002',
    experienciaLaboral: '12 años como arquitecto de software y consultor Fullstack. Líder técnico en proyectos web escalables con microfrontends, NestJS, React y arquitecturas orientadas a eventos.',
    materiasDestacadas: ['Desarrollo Web', 'Fullstack', 'Arquitectura de Software'],
    certificados: [
      { id: 1, titulo: 'Certified Solutions Architect – Software Architecture', anio: '2023' },
      { id: 2, titulo: 'Professional Full-Stack Developer Certificate (Meta)', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Desarrollo Web y Cloud Native (EMI)', anio: '2020' }
    ],
    horarios: [
      { dia: 'Lunes',   hora: '10:00 - 12:15', materia: 'Arquitectura de Software',    curso: '8vo Semestre A', aula: 'Lab de Software 1' },
      { dia: 'Martes',  hora: '07:30 - 09:45', materia: 'Desarrollo Web Fullstack',    curso: '7mo Semestre B', aula: 'Lab de Software 2' },
      { dia: 'Jueves',  hora: '10:00 - 12:15', materia: 'Arquitectura de Software',    curso: '8vo Semestre A', aula: 'Lab de Software 1' },
      { dia: 'Viernes', hora: '14:00 - 16:15', materia: 'Desarrollo Web Avanzado',     curso: '8vo Semestre B', aula: 'Lab de Software 3' }
    ]
  },

  'psoria@adm.emi.edu.bo': {
    id: 3,
    nombre: 'Ing. Patricia Soria',
    codigo_saga: 'DOC-1003',
    experienciaLaboral: '11 años en seguridad ofensiva y defensiva. Líder de equipos de respuesta a incidentes (CSIRT). Certificada en Hacking Ético, análisis de malware y seguridad perimetral.',
    materiasDestacadas: ['Ciberseguridad', 'Redes', 'Hacking Ético', 'Infraestructura'],
    certificados: [
      { id: 1, titulo: 'Certified Ethical Hacker (CEH v12 – EC-Council)', anio: '2023' },
      { id: 2, titulo: 'CompTIA Security+ SY0-701 Specialist', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Ciberseguridad y Análisis Forense (EMI)', anio: '2021' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '14:00 - 16:15', materia: 'Hacking Ético y Pentesting',         curso: '9no Semestre A', aula: 'Lab de Ciberseguridad' },
      { dia: 'Martes',   hora: '10:00 - 12:15', materia: 'Seguridad en Redes',                 curso: '8vo Semestre B', aula: 'Lab de Redes y Telecom' },
      { dia: 'Miércoles',hora: '14:00 - 16:15', materia: 'Hacking Ético y Pentesting',         curso: '9no Semestre A', aula: 'Lab de Ciberseguridad' },
      { dia: 'Viernes',  hora: '10:00 - 12:15', materia: 'Gestión de Incidentes de Seguridad', curso: '9no Semestre B', aula: 'Aula Magna 2' }
    ]
  },

  'carce@adm.emi.edu.bo': {
    id: 4,
    nombre: 'Ing. Carlos Arce',
    codigo_saga: 'DOC-1004',
    experienciaLaboral: '15 años en diseño de hardware embebido, robótica móvil autónoma y despliegue de redes IoT industriales y agrícolas.',
    materiasDestacadas: ['Internet de las Cosas (IoT)', 'Robótica', 'Sistemas Embebidos'],
    certificados: [
      { id: 1, titulo: 'Specialist in Embedded Systems & Real-Time OS (UC Irvine)', anio: '2023' },
      { id: 2, titulo: 'Robotics Software Engineer Nanodegree (Udacity)', anio: '2021' },
      { id: 3, titulo: 'Diplomado en Automatización y Mecatrónica (EMI)', anio: '2019' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '07:30 - 09:45', materia: 'Internet de las Cosas (IoT)', curso: '8vo Semestre A', aula: 'Lab de IoT y Hardware' },
      { dia: 'Martes',   hora: '14:00 - 16:15', materia: 'Robótica Aplicada',           curso: '9no Semestre A', aula: 'Taller de Mecatrónica' },
      { dia: 'Miércoles',hora: '07:30 - 09:45', materia: 'Internet de las Cosas (IoT)', curso: '8vo Semestre A', aula: 'Lab de IoT y Hardware' },
      { dia: 'Jueves',   hora: '14:00 - 16:15', materia: 'Sistemas Embebidos',           curso: '7mo Semestre B', aula: 'Lab de IoT y Hardware' }
    ]
  },

  'vtorrico@adm.emi.edu.bo': {
    id: 5,
    nombre: 'Ing. Valeria Torrico',
    codigo_saga: 'DOC-1005',
    experienciaLaboral: '10 años en analítica predictiva y Machine Learning aplicado a salud, finanzas y logística. Experta en modelos supervisados/no supervisados y pipelines de datos.',
    materiasDestacadas: ['Ciencia de Datos', 'Machine Learning', 'Análisis Estadístico'],
    certificados: [
      { id: 1, titulo: 'IBM Data Science Professional Certificate', anio: '2023' },
      { id: 2, titulo: 'Machine Learning Specialization (Stanford Online – Andrew Ng)', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Bioestadística y Big Data (EMI)', anio: '2020' }
    ],
    horarios: [
      { dia: 'Martes',   hora: '07:30 - 09:45', materia: 'Ciencia de Datos',               curso: '8vo Semestre B', aula: 'Lab de Software 3' },
      { dia: 'Miércoles',hora: '10:00 - 12:15', materia: 'Machine Learning',                curso: '8vo Semestre A', aula: 'Lab de IA 2' },
      { dia: 'Jueves',   hora: '07:30 - 09:45', materia: 'Ciencia de Datos',               curso: '8vo Semestre B', aula: 'Lab de Software 3' },
      { dia: 'Viernes',  hora: '07:30 - 09:45', materia: 'Análisis Estadístico Multivariado', curso: '7mo Semestre A', aula: 'Aula 204' }
    ]
  },

  'frojas@adm.emi.edu.bo': {
    id: 6,
    nombre: 'Ing. Fernando Rojas',
    codigo_saga: 'DOC-1006',
    experienciaLaboral: '13 años como ingeniero Cloud & DevOps. Especialista en orquestación con Kubernetes, infraestructura como código (Terraform) y pipelines CI/CD de alta resiliencia.',
    materiasDestacadas: ['Cloud Computing', 'DevOps', 'Microservicios', 'Kubernetes'],
    certificados: [
      { id: 1, titulo: 'AWS Certified Solutions Architect – Professional', anio: '2024' },
      { id: 2, titulo: 'Certified Kubernetes Administrator (CKA – CNCF)', anio: '2022' },
      { id: 3, titulo: 'HashiCorp Certified: Terraform Associate', anio: '2021' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '10:00 - 12:15', materia: 'Cloud Computing & Virtualización', curso: '8vo Semestre A', aula: 'Lab Cloud & Redes' },
      { dia: 'Miércoles',hora: '14:00 - 16:15', materia: 'Microservicios y DevOps',          curso: '9no Semestre B', aula: 'Lab Cloud & Redes' },
      { dia: 'Jueves',   hora: '10:00 - 12:15', materia: 'Cloud Computing & Virtualización', curso: '8vo Semestre A', aula: 'Lab Cloud & Redes' },
      { dia: 'Viernes',  hora: '14:00 - 16:15', materia: 'Contenedores y Kubernetes',        curso: '9no Semestre A', aula: 'Lab de Cómputo 4' }
    ]
  },

  'amorales@adm.emi.edu.bo': {
    id: 7,
    nombre: 'Ing. Andrea Morales',
    codigo_saga: 'DOC-1007',
    experienciaLaboral: '12 años como Scrum Master certificada y consultora en transformación digital ágil. Especialista en ITIL, gestión de portafolios de TI y adopción de metodologías ágiles en organizaciones.',
    materiasDestacadas: ['Gestión de Proyectos TI', 'Metodologías Ágiles', 'Scrum', 'ITIL'],
    certificados: [
      { id: 1, titulo: 'Project Management Professional (PMP – PMI)', anio: '2023' },
      { id: 2, titulo: 'Certified ScrumMaster (CSM – Scrum Alliance)', anio: '2022' },
      { id: 3, titulo: 'ITIL 4 Foundation Certificate in IT Service Management', anio: '2020' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '07:30 - 09:45', materia: 'Gestión de Proyectos TI',         curso: '8vo Semestre B', aula: 'Aula Magna 4' },
      { dia: 'Martes',   hora: '10:00 - 12:15', materia: 'Metodologías Ágiles de Desarrollo',curso: '7mo Semestre A', aula: 'Aula 201' },
      { dia: 'Miércoles',hora: '07:30 - 09:45', materia: 'Gestión de Proyectos TI',         curso: '8vo Semestre B', aula: 'Aula Magna 4' },
      { dia: 'Jueves',   hora: '14:00 - 16:15', materia: 'Calidad y Gobernanza de TI',      curso: '9no Semestre A', aula: 'Aula 302' }
    ]
  },

  'gpaz@adm.emi.edu.bo': {
    id: 8,
    nombre: 'Lic. Gabriela Paz',
    codigo_saga: 'DOC-1008',
    experienciaLaboral: '14 años administrando bases de datos transaccionales y almacenes Big Data. Docente titular de Bases de Datos I y II. Experta en SQL, NoSQL y arquitecturas Lambda para datos masivos.',
    materiasDestacadas: ['Bases de Datos', 'Big Data', 'SQL/NoSQL', 'Minería de Datos'],
    certificados: [
      { id: 1, titulo: 'Oracle Certified Professional: Database Administrator', anio: '2023' },
      { id: 2, titulo: 'PostgreSQL Advanced DBA & Performance Tuning (EnterpriseDB)', anio: '2022' },
      { id: 3, titulo: 'MongoDB Certified Developer Associate', anio: '2021' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '07:30 - 09:45', materia: 'Bases de Datos I',                    curso: '5to Semestre A', aula: 'Lab de Cómputo 1' },
      { dia: 'Martes',   hora: '10:00 - 12:15', materia: 'Bases de Datos II (Big Data)',         curso: '7mo Semestre A', aula: 'Lab de Cómputo 2' },
      { dia: 'Miércoles',hora: '07:30 - 09:45', materia: 'Bases de Datos I',                    curso: '5to Semestre A', aula: 'Lab de Cómputo 1' },
      { dia: 'Jueves',   hora: '10:00 - 12:15', materia: 'Sistemas NoSQL y Almacenamiento Dist.',curso: '8vo Semestre B', aula: 'Aula Magna 2' }
    ]
  },

  'hzeballos@adm.emi.edu.bo': {
    id: 9,
    nombre: 'Ing. Hugo Zeballos',
    codigo_saga: 'DOC-1009',
    experienciaLaboral: '11 años desarrollando aplicaciones nativas y multiplataforma para Android e iOS. Experto en Flutter, integración con hardware móvil (Bluetooth, NFC, GPS) y arquitectura Clean.',
    materiasDestacadas: ['Desarrollo Móvil (Android/iOS)', 'Flutter', 'React Native'],
    certificados: [
      { id: 1, titulo: 'Google Associate Android Developer', anio: '2023' },
      { id: 2, titulo: 'Flutter & Dart Certified Application Developer', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Computación Móvil y Ubicua (EMI)', anio: '2020' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '14:00 - 16:15', materia: 'Programación Móvil I',               curso: '7mo Semestre B', aula: 'Lab de Software 2' },
      { dia: 'Martes',   hora: '07:30 - 09:45', materia: 'Desarrollo Multiplataforma (Flutter)',curso: '8vo Semestre A', aula: 'Lab de Cómputo 3' },
      { dia: 'Miércoles',hora: '14:00 - 16:15', materia: 'Programación Móvil I',               curso: '7mo Semestre B', aula: 'Lab de Software 2' },
      { dia: 'Viernes',  hora: '10:00 - 12:15', materia: 'Desarrollo Móvil Avanzado',          curso: '9no Semestre B', aula: 'Lab de Cómputo 2' }
    ]
  },

  'cmedina@adm.emi.edu.bo': {
    id: 10,
    nombre: 'Ing. Claudia Medina',
    codigo_saga: 'DOC-1010',
    experienciaLaboral: '10 años en Bioinformática aplicada, procesamiento de imágenes médicas (DICOM) e interoperabilidad sanitaria HL7/FHIR. Investigadora de salud digital en entornos con recursos limitados.',
    materiasDestacadas: ['Bioinformática', 'Sistemas de Salud Digital', 'Telemedicina'],
    certificados: [
      { id: 1, titulo: 'Health Informatics & Telemedicine Specialist (Johns Hopkins)', anio: '2023' },
      { id: 2, titulo: 'Certificado en Bioinformática Computacional y Genómica', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Tecnologías para la Salud (EMI)', anio: '2021' }
    ],
    horarios: [
      { dia: 'Martes',   hora: '10:00 - 12:15', materia: 'Bioinformática y Salud Digital',   curso: '8vo Semestre B', aula: 'Lab de Software 3' },
      { dia: 'Miércoles',hora: '07:30 - 09:45', materia: 'Telemedicina e Interoperabilidad', curso: '9no Semestre A', aula: 'Aula 205' },
      { dia: 'Jueves',   hora: '10:00 - 12:15', materia: 'Bioinformática y Salud Digital',   curso: '8vo Semestre B', aula: 'Lab de Software 3' },
      { dia: 'Viernes',  hora: '07:30 - 09:45', materia: 'Procesamiento de Imágenes Médicas',curso: '9no Semestre B', aula: 'Lab de IA 1' }
    ]
  },

  'dflores@adm.emi.edu.bo': {
    id: 11,
    nombre: 'Ing. Diego Flores',
    codigo_saga: 'DOC-1011',
    experienciaLaboral: '12 años en Sistemas Distribuidos de alto rendimiento, consensos descentralizados y Smart Contracts (Solidity/Rust). Experto en criptografía aplicada y protocolos de red P2P.',
    materiasDestacadas: ['Sistemas Distribuidos', 'Blockchain', 'Criptografía Aplicada'],
    certificados: [
      { id: 1, titulo: 'Certified Blockchain Solutions Architect (CBSA)', anio: '2023' },
      { id: 2, titulo: 'Applied Cryptography & Distributed Systems (MIT Professional)', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Seguridad de la Información (EMI)', anio: '2020' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '07:30 - 09:45', materia: 'Sistemas Distribuidos',      curso: '8vo Semestre A', aula: 'Lab Cloud & Redes' },
      { dia: 'Miércoles',hora: '07:30 - 09:45', materia: 'Sistemas Distribuidos',      curso: '8vo Semestre A', aula: 'Lab Cloud & Redes' },
      { dia: 'Jueves',   hora: '14:00 - 16:15', materia: 'Blockchain y Criptografía',  curso: '9no Semestre A', aula: 'Aula Magna 3' },
      { dia: 'Sábado',   hora: '08:30 - 11:45', materia: 'Taller de Smart Contracts',  curso: '9no Semestre B', aula: 'Lab de Software 2' }
    ]
  },

  'pvargas@adm.emi.edu.bo': {
    id: 12,
    nombre: 'Ing. Paola Vargas',
    codigo_saga: 'DOC-1012',
    experienciaLaboral: '9 años desarrollando experiencias inmersivas XR (VR/AR), motores gráficos Unity/Unreal Engine, modelado procedural 3D y diseño de videojuegos serios para educación.',
    materiasDestacadas: ['Realidad Virtual', 'Realidad Aumentada', 'Videojuegos'],
    certificados: [
      { id: 1, titulo: 'Unity Certified Programmer & XR Specialist', anio: '2023' },
      { id: 2, titulo: 'Master en Arte y Diseño de Videojuegos 3D (UPC)', anio: '2021' },
      { id: 3, titulo: 'Diplomado en Gamificación Educativa (EMI)', anio: '2020' }
    ],
    horarios: [
      { dia: 'Martes',   hora: '07:30 - 09:45', materia: 'Realidad Virtual y Aumentada',    curso: '8vo Semestre B', aula: 'Laboratorio XR 3D' },
      { dia: 'Miércoles',hora: '10:00 - 12:15', materia: 'Motores de Videojuegos',          curso: '7mo Semestre A', aula: 'Lab de Diseño y Render' },
      { dia: 'Jueves',   hora: '07:30 - 09:45', materia: 'Realidad Virtual y Aumentada',    curso: '8vo Semestre B', aula: 'Laboratorio XR 3D' },
      { dia: 'Viernes',  hora: '10:00 - 12:15', materia: 'Simulación Gráfica e Interactiva',curso: '9no Semestre A', aula: 'Laboratorio XR 3D' }
    ]
  },

  'scamacho@adm.emi.edu.bo': {
    id: 13,
    nombre: 'Ing. Sergio Camacho',
    codigo_saga: 'DOC-1013',
    experienciaLaboral: '16 años integrando plantas industriales con PLCs Siemens/Allen-Bradley, diseñando interfaces SCADA/HMI y redes industriales Modbus/Profibus para manufactura y energía.',
    materiasDestacadas: ['Automatización Industrial', 'PLC', 'SCADA', 'Domótica'],
    certificados: [
      { id: 1, titulo: 'Siemens Certified Automation Engineer (TIA Portal v18)', anio: '2023' },
      { id: 2, titulo: 'Especialista en Sistemas SCADA e Industria 4.0 (Festo)', anio: '2021' },
      { id: 3, titulo: 'Diplomado en Instrumentación y Control de Procesos (EMI)', anio: '2019' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '10:00 - 12:15', materia: 'Automatización Industrial',   curso: '8vo Semestre A', aula: 'Lab de Control y PLC' },
      { dia: 'Martes',   hora: '14:00 - 16:15', materia: 'Sistemas SCADA y Telemetría', curso: '9no Semestre B', aula: 'Lab de Control y PLC' },
      { dia: 'Miércoles',hora: '10:00 - 12:15', materia: 'Automatización Industrial',   curso: '8vo Semestre A', aula: 'Lab de Control y PLC' },
      { dia: 'Viernes',  hora: '14:00 - 16:15', materia: 'Domótica e Inmótica',         curso: '8vo Semestre B', aula: 'Taller de Mecatrónica' }
    ]
  },

  'lbenitez@adm.emi.edu.bo': {
    id: 14,
    nombre: 'Ing. Lucía Benítez',
    codigo_saga: 'DOC-1014',
    experienciaLaboral: '11 años en Inteligencia Artificial Generativa, modelos de lenguaje (LLMs), arquitecturas RAG e ingeniería de prompts para aplicaciones empresariales y educativas.',
    materiasDestacadas: ['Procesamiento de Lenguaje Natural (NLP)', 'Chatbots', 'LLMs'],
    certificados: [
      { id: 1, titulo: 'Generative AI with Large Language Models (DeepLearning.AI / AWS)', anio: '2024' },
      { id: 2, titulo: 'NLP Specialist Certification (Stanford Online)', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Tecnologías Cognitivas para Educación (EMI)', anio: '2021' }
    ],
    horarios: [
      { dia: 'Lunes',    hora: '14:00 - 16:15', materia: 'Procesamiento de Lenguaje Natural (NLP)', curso: '8vo Semestre B', aula: 'Lab de IA 2' },
      { dia: 'Miércoles',hora: '14:00 - 16:15', materia: 'Chatbots y Sistemas Conversacionales',    curso: '9no Semestre A', aula: 'Lab de IA 1' },
      { dia: 'Jueves',   hora: '07:30 - 09:45', materia: 'IA Generativa y LLMs',                   curso: '9no Semestre B', aula: 'Aula Magna 1' },
      { dia: 'Viernes',  hora: '10:00 - 12:15', materia: 'Procesamiento de Lenguaje Natural (NLP)', curso: '8vo Semestre B', aula: 'Lab de IA 2' }
    ]
  },

  'jnavarro@adm.emi.edu.bo': {
    id: 15,
    nombre: 'Ing. Javier Navarro',
    codigo_saga: 'DOC-1015',
    experienciaLaboral: '14 años liderando aseguramiento de calidad (QA), testing automatizado (Cypress, Selenium, JMeter) y auditoría de sistemas bajo normas ISO/IEC 25010 y CMMI nivel 3.',
    materiasDestacadas: ['Auditoría de Sistemas', 'Calidad de Software', 'Testing QA'],
    certificados: [
      { id: 1, titulo: 'ISTQB Certified Tester – Advanced Level (CTAL)', anio: '2023' },
      { id: 2, titulo: 'Certified Information Systems Auditor (CISA – ISACA)', anio: '2022' },
      { id: 3, titulo: 'Diplomado en Calidad y Seguridad de Software (EMI)', anio: '2020' }
    ],
    horarios: [
      { dia: 'Lunes',   hora: '10:00 - 12:15', materia: 'Auditoría de Sistemas',               curso: '9no Semestre A', aula: 'Aula Magna 2' },
      { dia: 'Martes',  hora: '07:30 - 09:45', materia: 'Calidad de Software y Testing',       curso: '8vo Semestre A', aula: 'Lab de Software 1' },
      { dia: 'Jueves',  hora: '07:30 - 09:45', materia: 'Calidad de Software y Testing',       curso: '8vo Semestre A', aula: 'Lab de Software 1' },
      { dia: 'Viernes', hora: '07:30 - 09:45', materia: 'Pruebas Automatizadas de Rendimiento',curso: '8vo Semestre B', aula: 'Lab de Software 3' }
    ]
  }
}

// Función helper para obtener el perfil y horarios de un docente por email
export function obtenerDatosDocente(docenteEmail) {
  const emailNorm = (docenteEmail || '').trim().toLowerCase()
  if (PERFILES_Y_HORARIOS_DOCENTES[emailNorm]) {
    return PERFILES_Y_HORARIOS_DOCENTES[emailNorm]
  }
  for (const [correo, datos] of Object.entries(PERFILES_Y_HORARIOS_DOCENTES)) {
    if (emailNorm.includes(correo.split('@')[0])) {
      return datos
    }
  }
  // Fallback al primero si no hay coincidencia
  return PERFILES_Y_HORARIOS_DOCENTES['mquiroga@adm.emi.edu.bo']
}
