const express = require('express');
const pool = require('../db');
const { requireEstudiante } = require('../middleware/auth');

const router = express.Router();

const MONTO_MATRICULA = 12.0;

function siguienteGestion(gestionActual) {
  if (!gestionActual) return '1/2026';
  const [sem, anio] = gestionActual.split('/').map((s) => s.trim());
  if (sem === '1') return `2/${anio}`;
  return `1/${Number(anio) + 1}`;
}

function generarCodigo(nombreCarrera) {
  const prefijo = nombreCarrera.toLowerCase().includes('informática')
    ? 'INF'
    : nombreCarrera.toLowerCase().includes('sistemas')
    ? 'SIS'
    : nombreCarrera.toLowerCase().includes('civil')
    ? 'CIV'
    : 'UMS';
  const bloque = () =>
    Array.from({ length: 4 }, () => Math.random().toString(36)[2].toUpperCase()).join('');
  return `${prefijo}-${bloque()}-${bloque()}`;
}

// POST /api/matricula/pagar  (simula el portal de pagos del banco)
router.post('/pagar', requireEstudiante, async (req, res) => {
  const { id_estudiante, nombre_carrera } = req.session.usuario;
  const { usuario_banco, contrasena_banco } = req.body;

  if (!usuario_banco || !contrasena_banco) {
    return res.status(400).json({ error: 'Complete usuario y contraseña del portal de pagos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ultima = await client.query(
      `SELECT gestion_semestre FROM matricula WHERE id_estudiante = $1 ORDER BY id_matricula DESC LIMIT 1`,
      [id_estudiante]
    );
    const gestion = siguienteGestion(ultima.rows[0]?.gestion_semestre);

    const matricula = await client.query(
      `INSERT INTO matricula (id_estudiante, monto_total, estado, gestion_semestre)
       VALUES ($1, $2, 'pagado', $3) RETURNING id_matricula`,
      [id_estudiante, MONTO_MATRICULA, gestion]
    );
    const id_matricula = matricula.rows[0].id_matricula;

    await client.query(
      `INSERT INTO pagos_matricula (id_matricula, monto, fecha_pago, estado)
       VALUES ($1, $2, CURRENT_DATE, 'validado')`,
      [id_matricula, MONTO_MATRICULA]
    );

    const codigo = generarCodigo(nombre_carrera || '');
    await client.query(
      `INSERT INTO codigos_acceso (id_matricula, codigo, fecha_generacion)
       VALUES ($1, $2, CURRENT_DATE)`,
      [id_matricula, codigo]
    );

    await client.query('COMMIT');
    res.json({ ok: true, codigo, gestion_semestre: gestion, monto: MONTO_MATRICULA });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el pago' });
  } finally {
    client.release();
  }
});

module.exports = router;
