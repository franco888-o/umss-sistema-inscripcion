-- =========================================================
-- ESQUEMA Y DATOS: Ingeniería Informática (un solo estudiante)
-- =========================================================

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR (50) NOT NULL,
    password VARCHAR (100) NOT NULL
);
CREATE TABLE facultad (
    id_facultad SERIAL PRIMARY KEY,
    nombre_facultad VARCHAR (100) NOT NULL
);
CREATE TABLE carrera (
    id_carrera SERIAL PRIMARY KEY,
    id_facultad INT REFERENCES facultad (id_facultad),
    nombre_carrera VARCHAR (100) NOT NULL,
    duracion_semestres INT NOT NULL
);
CREATE TABLE docente (
    id_docente SERIAL PRIMARY KEY,
    nombre_docente VARCHAR (50) NOT NULL,
    apellido_docente VARCHAR (50) NOT NULL,
    ci VARCHAR(20) NOT NULL,
    especialidad VARCHAR (100) NOT NULL,
    email VARCHAR (100) NOT NULL
);
CREATE TABLE materia (
    id_materia SERIAL PRIMARY KEY,
    id_carrera INT REFERENCES carrera (id_carrera),
    id_docente INT REFERENCES docente (id_docente),
    nombre_materia VARCHAR (100) NOT NULL,
    sigla VARCHAR (10)
);

CREATE TABLE malla_curricular (
    id_malla SERIAL PRIMARY KEY,
    id_carrera INT REFERENCES carrera (id_carrera),
    id_materia INT REFERENCES materia (id_materia),
    id_prerequisito INT REFERENCES materia (id_materia),
    semestre INT NOT NULL,
    es_obligatoria BOOLEAN DEFAULT TRUE
);
CREATE TABLE aula (
    id_aula SERIAL PRIMARY KEY,
    nombre_aula VARCHAR (50) NOT NULL,
    capacidad INT NOT NULL,
    edificio VARCHAR (50) NOT NULL
);
CREATE TABLE modalidad (
    id_modalidad SERIAL PRIMARY KEY,
    tipo VARCHAR (50) NOT NULL
);
CREATE TABLE estudiante (
    id_estudiante SERIAL PRIMARY KEY,
    id_carrera INT REFERENCES carrera (id_carrera),
    codigo_sis VARCHAR (20),
    nombre_estudiante VARCHAR (50) NOT NULL,
    apellido_estudiante VARCHAR (50) NOT NULL,
    ci VARCHAR (20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR (20) NOT NULL,
    correo_electronico VARCHAR (100) NOT NULL
);

CREATE TABLE grupo (
    id_grupo SERIAL PRIMARY KEY,
    id_materia INT REFERENCES materia (id_materia),
    id_docente INT REFERENCES docente (id_docente),
    id_aula INT REFERENCES aula (id_aula),
    id_modalidad INT REFERENCES modalidad (id_modalidad),
    nombre_grupo VARCHAR (20) NOT NULL,
    cupo_max INT NOT NULL,
    cupo_actual INT NOT NULL
);
CREATE TABLE horario (
    id_horario SERIAL PRIMARY KEY,
    id_grupo INT REFERENCES grupo (id_grupo),
    dia VARCHAR (15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);
CREATE TABLE matricula (
    id_matricula SERIAL PRIMARY KEY,
    id_estudiante INT REFERENCES estudiante (id_estudiante),
    monto_total DECIMAL (10,2) NOT NULL,
    estado VARCHAR (20) NOT NULL,
    gestion_semestre VARCHAR (20) NOT NULL
);
CREATE TABLE pagos_matricula (
    id_pago SERIAL PRIMARY KEY,
    id_matricula INT REFERENCES matricula (id_matricula),
    monto DECIMAL (10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    estado VARCHAR (20) NOT NULL
);
CREATE TABLE codigos_acceso (
    id_codigo SERIAL PRIMARY KEY,
    id_matricula INT REFERENCES matricula(id_matricula),
    codigo VARCHAR (50) NOT NULL,
    fecha_generacion DATE NOT NULL
);
CREATE TABLE inscripcion (
    id_inscripcion SERIAL PRIMARY KEY,
    id_estudiante INT REFERENCES estudiante (id_estudiante),
    id_grupo INT REFERENCES grupo (id_grupo),
    id_codigo_acceso INT REFERENCES codigos_acceso (id_codigo),
    tipo_inscripcion VARCHAR (30) NOT NULL,
    fecha_inscripcion DATE NOT NULL
);
CREATE TABLE historial_academico (
     id_historial SERIAL PRIMARY KEY,
     id_estudiante INT REFERENCES estudiante (id_estudiante),
     id_materia INT REFERENCES materia(id_materia),
     nota_final DECIMAL (5,2) NOT NULL,
     estado VARCHAR (20) NOT NULL,
     gestion_semestre VARCHAR (20) NOT NULL
);

-- Usuario único del sistema
INSERT INTO usuario (username, password) VALUES
('Israel Espinoza', '202403150');

INSERT INTO facultad (nombre_facultad) VALUES ('Facultad de Ciencias y Tecnología');

INSERT INTO carrera (id_facultad, nombre_carrera, duracion_semestres) VALUES
(1, 'Ingeniería Informática', 9);

INSERT INTO docente (nombre_docente, apellido_docente, ci, especialidad, email) VALUES
('Leticia', 'Blanco', '2948102', 'Introducción a la Programación', 'lblanco@fcyt.umss.edu.bo'),
('Corina', 'Flores Villarroel', '4589201', 'Programación y Estructura de Datos', 'cflores@fcyt.umss.edu.bo'),
('David', 'Escalera', '3310928', 'Algoritmos y Lenguajes Formales', 'descalera@fcyt.umss.edu.bo'),
('Rosemary', 'Torrico Bascopé', '5021943', 'Sistemas de Información', 'rtorrico@fcyt.umss.edu.bo'),
('Boris Marcelo', 'Calvo', '4123982', 'Ingeniería de Software', 'bcalvo@fcyt.umss.edu.bo'),
('Vladimir', 'Costas Jáuregui', '3982104', 'Sistemas Operativos y Redes', 'vcostas@fcyt.umss.edu.bo'),
('Marco Antonio', 'Montecinos', '4810293', 'Bases de Datos', 'mmontecinos@fcyt.umss.edu.bo'),
('Richard', 'Torres', '3819201', 'Inteligencia Artificial', 'rtorres@fcyt.umss.edu.bo'),
('Jorge Walter', 'Orellana', '2194810', 'Arquitectura de Computadoras', 'jorellana@fcyt.umss.edu.bo'),
('Carlos', 'Balderrama', '3102938', 'Cálculo y Análisis Matemático', 'cbalderrama@fcyt.umss.edu.bo'),
('Roberto', 'Torrico', '2830192', 'Álgebra y Estructuras Discretas', 'rtorrico_mat@fcyt.umss.edu.bo'),
('Marko', 'Andrade', '3029102', 'Física para la Computación', 'mandrade@fcyt.umss.edu.bo'),
('Hernán', 'Ugarte', '1928301', 'Modelos y Simulación de Sistemas', 'hugarte@fcyt.umss.edu.bo'),
('Grover', 'Guzmán', '2019283', 'Investigación Operativa', 'gguzman@fcyt.umss.edu.bo'),
('Ana', 'Rocabado', '3720194', 'Inglés Técnico', 'arocabado@fcyt.umss.edu.bo'),
('Fernando', 'Salazar', '2810394', 'Redes y Comunicaciones', 'fsalazar@fcyt.umss.edu.bo'),
('Patricia', 'Aguilar', '4029183', 'Interacción Humano-Computador', 'paguilar@fcyt.umss.edu.bo'),
('Freddy', 'Nogales', '3610294', 'Teoría de la Computación', 'fnogales@fcyt.umss.edu.bo'),
('Wilson', 'Céspedes', '2910384', 'Auditoría de Sistemas', 'wcespedes@fcyt.umss.edu.bo'),
('Grover', 'Rodríguez', '3810293', 'Graficación y Computación Visual', 'grodriguez@fcyt.umss.edu.bo');

INSERT INTO materia (id_carrera, id_docente, nombre_materia, sigla) VALUES
(1, 1, 'Álgebra I', 'INF101'),
(1, 2, 'Álgebra II', 'INF102'),
(1, 3, 'Lógica', 'INF103'),
(1, 4, 'Programación Funcional', 'INF104'),
(1, 5, 'Inteligencia Artificial I', 'INF105'),
(1, 6, 'Inteligencia Artificial II', 'INF106'),
(1, 7, 'Interacción Humano Computador', 'INF107'),
(1, 8, 'Electiva III', 'INF108'),
(1, 9, 'Inteligencia Artificial', 'INF109'),
(1, 10, 'Cálculo I', 'INF201'),
(1, 11, 'Cálculo II', 'INF202'),
(1, 12, 'Cálculo Numérico', 'INF203'),
(1, 13, 'Probabilidad y Estadística', 'INF204'),
(1, 14, 'Taller de Sistemas Operativos', 'INF205'),
(1, 15, 'Redes de Computadoras', 'INF206'),
(1, 16, 'Tecnología de Redes Avanzadas', 'INF207'),
(1, 17, 'Electiva IV', 'INF208'),
(1, 18, 'Redes y SW de Base', 'INF209'),
(1, 19, 'Física General', 'INF301'),
(1, 20, 'Arquitectura de Computadoras I', 'INF302'),
(1, 1, 'Arquitectura de Computadoras II', 'INF303'),
(1, 2, 'Taller de Programación Bajo Nivel', 'INF304'),
(1, 3, 'Teoría de Autómatas y Lenguajes Formales', 'INF305'),
(1, 4, 'Estructura y Semántica de Lenguajes de Programación', 'INF306'),
(1, 5, 'Electiva I', 'INF307'),
(1, 6, 'Electiva V', 'INF308'),
(1, 7, 'Teoría de la Computación', 'INF309'),
(1, 8, 'Inglés I', 'INF401'),
(1, 9, 'Inglés II', 'INF402'),
(1, 10, 'Organización y Métodos', 'INF403'),
(1, 11, 'Base de Datos I', 'INF404'),
(1, 12, 'Base de Datos II', 'INF405'),
(1, 13, 'Taller de Base de Datos', 'INF406'),
(1, 14, 'Electiva II', 'INF407'),
(1, 15, 'Electiva VI', 'INF408'),
(1, 16, 'Base de Datos', 'INF409'),
(1, 17, 'Introducción a la Programación', 'INF501'),
(1, 18, 'Elementos de Programación y Estructura de Datos', 'INF502'),
(1, 19, 'Métodos y Técnicas de Programación', 'INF503'),
(1, 20, 'Sistemas de Información I', 'INF504'),
(1, 1, 'Sistemas de Información II', 'INF505'),
(1, 2, 'Ingeniería de Software', 'INF506'),
(1, 3, 'Taller de Ingeniería de Software', 'INF507'),
(1, 4, 'Taller de Grado I', 'INF508'),
(1, 5, 'Taller de Grado II', 'INF509'),
(1, 6, 'Programación', 'INF601'),
(1, 7, 'Teoría de Grafos', 'INF602'),
(1, 8, 'Algoritmos Avanzados', 'INF603'),
(1, 9, 'Graficación por Computadora', 'INF604'),
(1, 10, 'Programación Web', 'INF605'),
(1, 11, 'Arquitectura de Software', 'INF606'),
(1, 12, 'Evaluación y Auditoría de Sistemas', 'INF607'),
(1, 13, 'Desarrollo de Ing. de Software', 'INF608');

-- La malla indica qué materia se debe aprobar (prerrequisito) para poder cursar la siguiente
INSERT INTO malla_curricular (id_carrera, id_materia, id_prerequisito, semestre, es_obligatoria) VALUES
(1, 1, NULL, 1, TRUE),
(1, 2, 1, 2, TRUE),
(1, 3, 2, 3, TRUE),
(1, 4, 3, 4, TRUE),
(1, 5, 4, 5, TRUE),
(1, 6, 5, 6, TRUE),
(1, 7, 6, 7, TRUE),
(1, 8, 7, 8, TRUE),
(1, 9, 8, 9, TRUE),
(1, 10, NULL, 1, TRUE),
(1, 11, 10, 2, TRUE),
(1, 12, 11, 3, TRUE),
(1, 13, 12, 4, TRUE),
(1, 14, 13, 5, TRUE),
(1, 15, 14, 6, TRUE),
(1, 16, 15, 7, TRUE),
(1, 17, 16, 8, TRUE),
(1, 18, 17, 9, TRUE),
(1, 19, NULL, 1, TRUE),
(1, 20, 19, 2, TRUE),
(1, 21, 20, 3, TRUE),
(1, 22, 21, 4, TRUE),
(1, 23, 22, 5, TRUE),
(1, 24, 23, 6, TRUE),
(1, 25, 24, 7, TRUE),
(1, 26, 25, 8, TRUE),
(1, 27, 26, 9, TRUE),
(1, 28, NULL, 1, TRUE),
(1, 29, 28, 2, TRUE),
(1, 30, 29, 3, TRUE),
(1, 31, 30, 4, TRUE),
(1, 32, 31, 5, TRUE),
(1, 33, 32, 6, TRUE),
(1, 34, 33, 7, TRUE),
(1, 35, 34, 8, TRUE),
(1, 36, 35, 9, TRUE),
(1, 37, NULL, 1, TRUE),
(1, 38, 37, 2, TRUE),
(1, 39, 38, 3, TRUE),
(1, 40, 39, 4, TRUE),
(1, 41, 40, 5, TRUE),
(1, 42, 41, 6, TRUE),
(1, 43, 42, 7, TRUE),
(1, 44, 43, 8, TRUE),
(1, 45, 44, 9, TRUE),
(1, 46, 37, 1, TRUE),
(1, 47, 46, 2, TRUE),
(1, 48, 47, 3, TRUE),
(1, 49, 48, 4, TRUE),
(1, 50, 49, 5, TRUE),
(1, 51, 50, 6, TRUE),
(1, 52, 51, 7, TRUE),
(1, 53, 52, 8, TRUE);

INSERT INTO aula (nombre_aula, capacidad, edificio) VALUES
('Aula 691B', 90, 'Edificio Electrónica'),
('Laboratorio 3', 45, 'Edificio MEM'),
('Aula 617', 60, 'Edificio Antiguo FCyT'),
('Laboratorio 5', 40, 'Edificio Electrónica'),
('Aula 512', 70, 'Edificio Antiguo FCyT');

INSERT INTO modalidad (tipo) VALUES
('Presencial'), ('Virtual'), ('Examen de Mesa');

INSERT INTO estudiante (id_carrera, codigo_sis, nombre_estudiante, apellido_estudiante, ci, fecha_nacimiento, telefono, correo_electronico) VALUES
(1, '202403150', 'Israel Franco', 'Espinoza Chocaita', '9876543', '2004-03-15', '+59170123456', 'israel.espinoza@est.umss.edu.bo');

INSERT INTO historial_academico (id_estudiante, id_materia, nota_final, estado, gestion_semestre) VALUES
(1, 1, 68, 'Aprobado', '1/2024'),
(1, 2, 61, 'Aprobado', '2/2024'),
(1, 3, 79, 'Aprobado', '1/2025'),
(1, 10, 59, 'Aprobado', '1/2024'),
(1, 11, 75, 'Aprobado', '2/2024'),
(1, 12, 69, 'Aprobado', '1/2025'),
(1, 19, 58, 'Aprobado', '1/2024'),
(1, 20, 74, 'Aprobado', '2/2024'),
(1, 21, 57, 'Aprobado', '1/2025'),
(1, 28, 72, 'Aprobado', '1/2024'),
(1, 29, 59, 'Aprobado', '2/2024'),
(1, 30, 59, 'Aprobado', '1/2025'),
(1, 37, 71, 'Aprobado', '1/2024'),
(1, 38, 86, 'Aprobado', '2/2024'),
(1, 39, 60, 'Aprobado', '1/2025'),
(1, 46, 64, 'Aprobado', '1/2024'),
(1, 47, 79, 'Aprobado', '2/2024'),
(1, 48, 90, 'Aprobado', '1/2025');

-- El estudiante todavía no tiene matrícula ni inscripción: debe pagar, obtener su
-- código de acceso e inscribirse él mismo desde la pantalla de Inscripción.
-- Se ofertan grupos para las materias del semestre 4 (siguiente semestre a cursar):
INSERT INTO grupo (id_materia, id_docente, id_aula, id_modalidad, nombre_grupo, cupo_max, cupo_actual) VALUES
(4, 4, 1, 1, 'Grupo 1', 45, 0),
(13, 13, 2, 1, 'Grupo 1', 45, 0),
(22, 2, 3, 1, 'Grupo 1', 45, 0),
(31, 11, 4, 1, 'Grupo 1', 45, 0),
(40, 20, 5, 1, 'Grupo 1', 45, 0),
(49, 9, 1, 1, 'Grupo 1', 45, 0);

INSERT INTO horario (id_grupo, dia, hora_inicio, hora_fin) VALUES
(1, 'Lunes', '07:15:00', '08:45:00'),
(1, 'Miércoles', '07:15:00', '08:45:00'),
(2, 'Martes', '08:45:00', '10:15:00'),
(2, 'Jueves', '08:45:00', '10:15:00'),
(3, 'Lunes', '10:15:00', '11:45:00'),
(3, 'Viernes', '10:15:00', '11:45:00'),
(4, 'Miércoles', '14:15:00', '15:45:00'),
(4, 'Viernes', '14:15:00', '15:45:00'),
(5, 'Martes', '15:45:00', '17:15:00'),
(5, 'Jueves', '15:45:00', '17:15:00'),
(6, 'Lunes', '17:15:00', '18:45:00'),
(6, 'Miércoles', '17:15:00', '18:45:00');

