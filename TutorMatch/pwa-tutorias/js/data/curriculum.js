// Malla curricular OFICIAL: Plan de estudios 2024-2028, Ingeniería de Sistemas, EMI Cochabamba.
// Cada semestre tiene sus propias materias: [código, nombre, área].
export const INSTITUTION = 'Escuela Militar de Ingeniería (EMI) — Cochabamba'
export const CAREER = 'Ingeniería de Sistemas'
export const PLAN = 'Plan de estudios 2024-2028'

const B = 'Básicas', I = 'Instrumentales', M = 'Militar', G = 'Graduación', E = 'Electiva'
const A1 = 'Área 1: Tecnologías de Información, Software e IA'
const A2 = 'Área 2: Modelado y Simulación de Sistemas'
const A3 = 'Área 3: Tecnologías de Comunicación, Redes y Seguridad'
const A4 = 'Área 4: Sistemas de Gestión Empresarial'

const SEM = [
  [['LBAT-01-01-01', 'Álgebra', B], ['LBAT-01-01-02', 'Cálculo I', B], ['LBAT-01-01-03', 'Programación I', B], ['LBAT-01-01-04', 'Física I', B], ['LBAT-01-01-05', 'Química Aplicada', B]],
  [['LBAT-02-01-06', 'Álgebra Lineal y Teoría Matricial', B], ['LBAT-02-01-07', 'Cálculo II', B], ['LBAT-02-01-08', 'Programación II', B], ['LBAT-02-01-09', 'Física II', B], ['LBAT-02-01-10', 'Estadística I', B],
    ['LBAT-02-01-11', 'Componentes, Instrumentación y Arquitectura de Computadoras', B]],
  [['LSIS-03-02-12', 'Programación III', I], ['LSIS-03-02-13', 'Física III', I], ['LSIS-03-02-14', 'Dibujo para Ingeniería', I], ['LSIS-03-02-15', 'Ecuaciones Diferenciales', I], ['LSIS-03-02-16', 'Estadística II', I],
    ['LSIS-03-02-17', 'Análisis y Diseño de Sistemas Basados en Microcontroladores', I], ['LSIS-03-02-18', 'Metodología de la Investigación', I], ['MIL-1', 'Materia Militar 1', M]],
  [['LSIS-04-02-19', 'Estructura de Datos', I], ['LSIS-04-02-20', 'Base de Datos I', I], ['LSIS-04-02-21', 'Redes de Computadoras I', I], ['LSIS-04-02-22', 'Métodos Numéricos', I],
    ['LSIS-04-02-23', 'Administración de Sistemas Operativos y Servidores', I], ['LSIS-04-02-24', 'Investigación Operativa I', I], ['MIL-2', 'Materia Militar 2', M]],
  [['LSIS-05-03-25', 'Ingeniería de Sistemas I', I], ['LSIS-05-03-26', 'Programación Avanzada', I], ['LSIS-05-03-27', 'Base de Datos II', I], ['LSIS-05-03-28', 'Sistemas de Información I', I],
    ['LSIS-05-03-29', 'Taller de Programación', I], ['LSIS-05-03-30', 'Redes de Computadoras II', I], ['LSIS-05-03-31', 'Investigación Operativa II', I], ['MIL-3', 'Materia Militar 3', M]],
  [['LSIS-06-03-32', 'Inteligencia Artificial', A1], ['LSIS-06-03-33', 'Ingeniería de Sistemas II', A2], ['LSIS-06-03-34', 'Business Intelligence y Big Data', A1], ['LSIS-06-03-35', 'Redes Avanzadas de Nueva Generación', A3],
    ['LSIS-06-03-36', 'Sistemas de Información II', A1], ['LSIS-06-03-37', 'Desarrollo de Aplicaciones Móviles', A1], ['MIL-4', 'Materia Militar 4', M]],
  [['LSIS-07-04-38', 'Inteligencia Artificial Aplicada', A1], ['LSIS-07-04-39', 'Internet de las Cosas', A3], ['LSIS-07-04-40', 'Ingeniería de Software', A1], ['LSIS-07-04-41', 'Seguridad de Sistemas', A3],
    ['LSIS-07-04-42', 'Sistemas Económicos', A4], ['LSIS-07-04-43', 'Robótica', A2], ['MIL-5', 'Materia Militar 5', M]],
  [['LSIS-08-04-44', 'Arquitectura de Microservicios y Desarrollo Ágil', A1], ['LSIS-08-04-45', 'Modelación y Simulación de Sistemas', A2], ['LSIS-08-04-46', 'Informática Forense', A3],
    ['LSIS-08-04-47', 'Ingeniería Legal', A4], ['LSIS-08-04-48', 'Gobierno Electrónico y Diseño Organizacional', A4], ['LSIS-08-04-49', 'Preparación y Evaluación de Proyectos', A4], ['MIL-6', 'Materia Militar 6', M]],
  [['LSIS-09-05-50', 'Gestión de Calidad', A1], ['LSIS-09-05-51', 'Ciencia de Datos', A1], ['LSIS-09-05-52', 'Realidad Virtual y Aumentada', A2], ['LSIS-09-05-53', 'Trabajo de Grado I', G], ['MIL-7', 'Materia Militar 7', M]],
  [['LSIS-10-05-54', 'Auditoría de Sistemas', A3], ['LSIS-10-05-55', 'Sistemas de Administración, Gestión y Organización Empresarial', A4], ['LSIS-10-05-56', 'Trabajo de Grado II', G],
    ['LSIS-10-05-57', 'Inteligencia Artificial y TIC en Ingeniería', E], ['MIL-8', 'Materia Militar 8', M]],
]

// [horas semanales, horas semestrales] por semestre (carga total: 6.000 h)
export const LOAD = [[33, 660], [31, 620], [36, 720], [32, 640], [36, 720], [30, 600], [31, 620], [28, 560], [22, 440], [21, 420]]
export const SEMESTERS = SEM.length
export const buildCatalog = () => SEM.flatMap((rows, i) => rows.map(([code, name, area]) => ({ code, name, semester: i + 1, area })))
// Las materias militares y el trabajo de grado no se ofrecen como tutoría.
export const isTutorable = (s) => s.area !== M && s.area !== G
