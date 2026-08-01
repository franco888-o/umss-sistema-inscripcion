function requireLogin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ error: 'No ha iniciado sesión' });
  }
  next();
}

// El usuario debe tener un estudiante asociado (no aplica a cuentas admin puras)
function requireEstudiante(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ error: 'No ha iniciado sesión' });
  }
  if (!req.session.usuario.id_estudiante) {
    return res.status(403).json({
      error: 'Esta cuenta no tiene un estudiante asociado (es una cuenta administrativa).',
    });
  }
  next();
}

module.exports = { requireLogin, requireEstudiante };
