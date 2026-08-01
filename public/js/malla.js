(async function () {
  const usuario = await requireSession();
  if (!usuario) return;

  if (!usuario.id_estudiante) {
    document.querySelector('.contenido').innerHTML =
      '<h1>Malla Curricular</h1><div class="card centro-vacio">Esta es una cuenta administrativa, no tiene datos de estudiante.</div>';
    return;
  }

  const contenedor = document.getElementById('malla-contenedor');

  try {
    const data = await apiFetch('/api/malla');
    const semestres = Object.keys(data.semestres).sort((a, b) => a - b);

    contenedor.innerHTML = semestres
      .map((sem) => {
        const materias = data.semestres[sem];
        const tarjetas = materias
          .map(
            (m) => `
          <div class="malla-materia">
            <div class="sigla">${m.sigla}</div>
            <div class="nombre">${m.nombre_materia}</div>
            ${
              m.sigla_prerequisito
                ? `<div class="prereq">Requiere: ${m.sigla_prerequisito} - ${m.nombre_prerequisito}</div>`
                : `<div class="prereq" style="color:#6b7280;">Sin prerrequisito</div>`
            }
          </div>`
          )
          .join('');

        return `
        <div class="malla-semestre card">
          <h3 style="margin-top:0;">Semestre ${sem}</h3>
          <div class="malla-grid">${tarjetas}</div>
        </div>`;
      })
      .join('');
  } catch (err) {
    contenedor.innerHTML = `<div class="alerta-error">${err.message}</div>`;
  }
})();
