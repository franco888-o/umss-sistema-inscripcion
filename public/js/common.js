// Funciones compartidas por todas las páginas

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado');
  }
  return data;
}

// Verifica que haya sesión activa; si no, redirige al login.
// Devuelve el objeto "usuario" de la sesión.
async function requireSession() {
  try {
    const { usuario } = await apiFetch('/api/auth/me');
    document.querySelectorAll('[data-nombre-usuario]').forEach((el) => {
      el.textContent = usuario.nombre_completo;
    });
    document.querySelectorAll('[data-carrera-usuario]').forEach((el) => {
      el.textContent = usuario.nombre_carrera || '';
    });
    return usuario;
  } catch (err) {
    window.location.href = 'index.html';
    return null;
  }
}

async function cerrarSesion() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } finally {
    window.location.href = 'index.html';
  }
}

function initLogout() {
  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', cerrarSesion);
  });
}

document.addEventListener('DOMContentLoaded', initLogout);
