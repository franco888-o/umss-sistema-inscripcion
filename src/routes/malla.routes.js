const express = require('express');
const pool = require('../db');
const { requireEstudiante } = require('../middleware/auth');

const router = express.Router();

// GET /api/malla
router.get('/', requireEstudiante, async (req, res) => {
  const { id_carrera } = req.session.usuario;

  try {
    const result = await pool.query(
      `SELECT mc.semestre, mc.es_obligatoria, m.id_materia, m.sigla, m.nombre_materia,
              p.sigla AS sigla_prerequisito, p.nombre_materia AS nombre_prerequisito
       FROM malla_curricular mc
       JOIN materia m ON m.id_materia = mc.id_materia
       LEFT JOIN materia p ON p.id_materia = mc.id_prerequisito
       WHERE mc.id_carrera = $1
       ORDER BY mc.semestre ASC, m.sigla ASC`,
      [id_carrera]
    );

    const porSemestre = {};
    for (const fila of result.rows) {
      if (!porSemestre[fila.semestre]) porSemestre[fila.semestre] = [];
      porSemestre[fila.semestre].push(fila);
    }

    res.json({ semestres: porSemestre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la malla curricular' });
  }
});

module.exports = router;
