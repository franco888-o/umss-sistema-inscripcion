const express = require('express');
const pool = require('../db');
const { requireEstudiante } = require('../middleware/auth');

const router = express.Router();

// GET /api/kardex
router.get('/', requireEstudiante, async (req, res) => {
  const { id_estudiante } = req.session.usuario;

  try {
    const historial = await pool.query(
      `SELECT h.gestion_semestre, m.sigla, m.nombre_materia, h.nota_final, h.estado
       FROM historial_academico h
       JOIN materia m ON m.id_materia = h.id_materia
       WHERE h.id_estudiante = $1
       ORDER BY h.gestion_semestre ASC, m.sigla ASC`,
      [id_estudiante]
    );

    const aprobadas = historial.rows.filter((r) => r.estado.toLowerCase() === 'aprobado');
    const promedio =
      historial.rows.length > 0
        ? historial.rows.reduce((sum, r) => sum + Number(r.nota_final), 0) / historial.rows.length
        : 0;

    res.json({
      materias: historial.rows,
      promedio_general: Math.round(promedio),
      materias_aprobadas: aprobadas.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el kardex' });
  }
});

module.exports = router;
