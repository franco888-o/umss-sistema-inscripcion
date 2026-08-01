const express = require('express');
const pool = require('../db');
const { requireEstudiante } = require('../middleware/auth');

const router = express.Router();

// GET /api/inscripcion/estado -> materias inscritas en la matrícula más reciente
router.get('/estado', requireEstudiante, async (req, res) => {
  const { id_estudiante } = req.session.usuario;
  try {
    const ultimaMatricula = await pool.query(
      `SELECT id_matricula, gestion_semestre FROM matricula
       WHERE id_estudiante = $1 ORDER BY id_matricula DESC LIMIT 1`,
      [id_estudiante]
    );

    if (ultimaMatricula.rows.length === 0) {
      return res.json({ gestion_semestre: null, materias: [] });
    }

    const { id_matricula, gestion_semestre } = ultimaMatricula.rows[0];

    const materias = await pool.query(
      `SELECT i.id_inscripcion, g.id_grupo, m.sigla, m.nombre_materia, g.nombre_grupo,
              d.nombre_docente, d.apellido_docente, a.nombre_aula, mo.tipo AS modalidad
       FROM inscripcion i
       JOIN codigos_acceso ca ON ca.id_codigo = i.id_codigo_acceso
       JOIN grupo g ON g.id_grupo = i.id_grupo
       JOIN materia m ON m.id_materia = g.id_materia
       JOIN docente d ON d.id_docente = g.id_docente
       JOIN aula a ON a.id_aula = g.id_aula
       JOIN modalidad mo ON mo.id_modalidad = g.id_modalidad
       WHERE i.id_estudiante = $1 AND ca.id_matricula = $2
       ORDER BY m.sigla ASC`,
      [id_estudiante, id_matricula]
    );

    res.json({
      gestion_semestre,
      materias: materias.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el estado de inscripción' });
  }
});

// POST /api/inscripcion/validar-codigo { codigo }
router.post('/validar-codigo', requireEstudiante, async (req, res) => {
  const { id_estudiante } = req.session.usuario;
  const { codigo } = req.body;

  if (!codigo) return res.status(400).json({ error: 'Ingrese un código de acceso' });

  try {
    const result = await pool.query(
      `SELECT ca.id_codigo, ca.id_matricula, mt.gestion_semestre
       FROM codigos_acceso ca
       JOIN matricula mt ON mt.id_matricula = ca.id_matricula
       WHERE ca.codigo = $1 AND mt.id_estudiante = $2`,
      [codigo, id_estudiante]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Código de acceso inválido para este estudiante' });
    }

    res.json({ ok: true, ...result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al validar el código' });
  }
});

// GET /api/inscripcion/materias-disponibles -> malla del estudiante + grupos ofertados por materia
router.get('/materias-disponibles', requireEstudiante, async (req, res) => {
  const { id_carrera, id_estudiante } = req.session.usuario;
  try {
    const malla = await pool.query(
      `SELECT mc.semestre, m.id_materia, m.sigla, m.nombre_materia, mc.es_obligatoria
       FROM malla_curricular mc
       JOIN materia m ON m.id_materia = mc.id_materia
       WHERE mc.id_carrera = $1
         AND m.id_materia NOT IN (
           SELECT h.id_materia FROM historial_academico h
           WHERE h.id_estudiante = $2 AND h.estado = 'Aprobado'
         )
       ORDER BY mc.semestre ASC, m.sigla ASC`,
      [id_carrera, id_estudiante]
    );

    const grupos = await pool.query(
      `SELECT g.id_materia, mo.tipo AS modalidad
       FROM grupo g
       JOIN modalidad mo ON mo.id_modalidad = g.id_modalidad
       JOIN materia m ON m.id_materia = g.id_materia
       WHERE m.id_carrera = $1`,
      [id_carrera]
    );

    const modalidadesPorMateria = {};
    for (const g of grupos.rows) {
      if (!modalidadesPorMateria[g.id_materia]) modalidadesPorMateria[g.id_materia] = new Set();
      modalidadesPorMateria[g.id_materia].add(g.modalidad);
    }

    const porSemestre = {};
    for (const fila of malla.rows) {
      const modalidades = modalidadesPorMateria[fila.id_materia]
        ? Array.from(modalidadesPorMateria[fila.id_materia])
        : [];
      const item = {
        ...fila,
        tiene_grupos: modalidades.length > 0,
        etiquetas: modalidades.map((m) => (m === 'Examen de Mesa' ? 'Examen de Mesa' : 'Normal')),
      };
      // quitar etiquetas duplicadas ("Normal" puede venir de Presencial y Virtual)
      item.etiquetas = [...new Set(item.etiquetas)];
      if (!porSemestre[fila.semestre]) porSemestre[fila.semestre] = [];
      porSemestre[fila.semestre].push(item);
    }

    res.json({ semestres: porSemestre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener materias disponibles' });
  }
});

// GET /api/inscripcion/grupos/:id_materia -> grupos disponibles de una materia
router.get('/grupos/:id_materia', requireEstudiante, async (req, res) => {
  const { id_materia } = req.params;
  try {
    const result = await pool.query(
      `SELECT g.id_grupo, g.nombre_grupo, g.cupo_max, g.cupo_actual,
              d.nombre_docente, d.apellido_docente, mo.tipo AS modalidad,
              COALESCE(
                json_agg(
                  json_build_object('dia', h.dia, 'hora_inicio', h.hora_inicio, 'hora_fin', h.hora_fin)
                  ORDER BY h.hora_inicio
                ) FILTER (WHERE h.id_horario IS NOT NULL), '[]'
              ) AS horarios
       FROM grupo g
       JOIN docente d ON d.id_docente = g.id_docente
       JOIN modalidad mo ON mo.id_modalidad = g.id_modalidad
       LEFT JOIN horario h ON h.id_grupo = g.id_grupo
       WHERE g.id_materia = $1
       GROUP BY g.id_grupo, d.nombre_docente, d.apellido_docente, mo.tipo
       ORDER BY g.nombre_grupo ASC`,
      [id_materia]
    );
    res.json({ grupos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los grupos' });
  }
});

// POST /api/inscripcion/inscribir { id_codigo_acceso, id_grupo }
router.post('/inscribir', requireEstudiante, async (req, res) => {
  const { id_estudiante } = req.session.usuario;
  const { id_codigo_acceso, id_grupo } = req.body;

  if (!id_codigo_acceso || !id_grupo) {
    return res.status(400).json({ error: 'Faltan datos para inscribir la materia' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const grupo = await client.query(
      `SELECT g.cupo_max, g.cupo_actual, mo.tipo AS modalidad
       FROM grupo g JOIN modalidad mo ON mo.id_modalidad = g.id_modalidad
       WHERE g.id_grupo = $1 FOR UPDATE`,
      [id_grupo]
    );

    if (grupo.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }
    if (grupo.rows[0].cupo_actual >= grupo.rows[0].cupo_max) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'No hay cupos disponibles en este grupo' });
    }

    const tipo_inscripcion = grupo.rows[0].modalidad === 'Examen de Mesa' ? 'examen_mesa' : 'normal';

    await client.query(
      `INSERT INTO inscripcion (id_estudiante, id_grupo, id_codigo_acceso, tipo_inscripcion, fecha_inscripcion)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [id_estudiante, id_grupo, id_codigo_acceso, tipo_inscripcion]
    );

    await client.query(`UPDATE grupo SET cupo_actual = cupo_actual + 1 WHERE id_grupo = $1`, [id_grupo]);

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al inscribir la materia' });
  } finally {
    client.release();
  }
});

// POST /api/inscripcion/retirar { id_inscripcion }
router.post('/retirar', requireEstudiante, async (req, res) => {
  const { id_estudiante } = req.session.usuario;
  const { id_inscripcion } = req.body;

  if (!id_inscripcion) {
    return res.status(400).json({ error: 'Falta indicar la materia a retirar' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insc = await client.query(
      `SELECT id_grupo FROM inscripcion WHERE id_inscripcion = $1 AND id_estudiante = $2 FOR UPDATE`,
      [id_inscripcion, id_estudiante]
    );

    if (insc.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No se encontró esa materia inscrita' });
    }

    const { id_grupo } = insc.rows[0];

    await client.query(`DELETE FROM inscripcion WHERE id_inscripcion = $1`, [id_inscripcion]);
    await client.query(
      `UPDATE grupo SET cupo_actual = GREATEST(cupo_actual - 1, 0) WHERE id_grupo = $1`,
      [id_grupo]
    );

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al retirar la materia' });
  } finally {
    client.release();
  }
});

module.exports = router;
