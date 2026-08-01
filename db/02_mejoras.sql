-- =========================================================
-- MEJORAS NECESARIAS PARA QUE EL SISTEMA FUNCIONE
-- =========================================================

-- 1) La tabla "usuario" (login) no tenía relación con "estudiante",
--    así que al iniciar sesión no se podía saber de quién eran los
--    datos académicos. Se agrega la relación y un rol:
ALTER TABLE usuario ADD COLUMN id_estudiante INT REFERENCES estudiante (id_estudiante);
ALTER TABLE usuario ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'estudiante';

UPDATE usuario SET id_estudiante = 1 WHERE username = 'Israel Espinoza';

-- 2) La contraseña estaba en texto plano ("202403150").
--    Se reemplaza por su hash bcrypt (el usuario sigue ingresando
--    "202403150" al iniciar sesión; solo se guarda de forma segura).
UPDATE usuario SET password = '$2b$10$rIRoKi1AEWGzqh7cM1m2/e/2mN3lX52Sz2KMHD1hh/IHYIGpNOTku'
WHERE username = 'Israel Espinoza';

-- 3) Índices útiles para que las consultas sean rápidas
CREATE INDEX idx_inscripcion_estudiante ON inscripcion (id_estudiante);
CREATE INDEX idx_historial_estudiante ON historial_academico (id_estudiante);
CREATE INDEX idx_matricula_estudiante ON matricula (id_estudiante);
CREATE INDEX idx_malla_carrera ON malla_curricular (id_carrera);
