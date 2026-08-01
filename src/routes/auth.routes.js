const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.username, u.password, u.rol, u.id_estudiante,
              e.nombre_estudiante, e.apellido_estudiante, e.id_carrera,
              c.nombre_carrera
       FROM usuario u
       LEFT JOIN estudiante e ON e.id_estudiante = u.id_estudiante
       LEFT JOIN carrera c ON c.id_carrera = e.id_carrera
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const usuario = result.rows[0];
    const passwordOk = await bcrypt.compare(password, usuario.password);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    req.session.usuario = {
      id_usuario: usuario.id_usuario,
      username: usuario.username,
      rol: usuario.rol,
      id_estudiante: usuario.id_estudiante,
      nombre_completo: usuario.id_estudiante
        ? `${usuario.nombre_estudiante} ${usuario.apellido_estudiante}`
        : usuario.username,
      id_carrera: usuario.id_carrera,
      nombre_carrera: usuario.nombre_carrera,
    };

    res.json({ ok: true, usuario: req.session.usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'No ha iniciado sesión' });
  }
  res.json({ usuario: req.session.usuario });
});

module.exports = router;
