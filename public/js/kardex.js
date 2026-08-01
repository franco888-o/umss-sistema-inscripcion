(async function () {
  const usuario = await requireSession();
  if (!usuario) return;

  if (!usuario.id_estudiante) {
    document.querySelector('.contenido').innerHTML =
      '<h1>Kardex Académico</h1><div class="card centro-vacio">Esta es una cuenta administrativa, no tiene datos de estudiante.</div>';
    return;
  }

  try {
    const data = await apiFetch('/api/kardex');

    if (data.materias.length === 0) {
      document.getElementById('sin-datos').style.display = 'block';
      return;
    }

    const tbody = document.getElementById('tabla-kardex');
    tbody.innerHTML = data.materias
      .map((m) => {
        const aprobado = m.estado.toLowerCase() === 'aprobado';
        const pill = aprobado ? 'pill-verde' : 'pill-rojo';
        return `
        <tr>
          <td>${m.gestion_semestre}</td>
          <td>${m.sigla}</td>
          <td>${m.nombre_materia}</td>
          <td>${Math.round(Number(m.nota_final))}</td>
          <td><span class="pill ${pill}">${m.estado}</span></td>
        </tr>`;
      })
      .join('');

    document.getElementById('promedio').textContent = data.promedio_general;
    document.getElementById('materias-aprobadas').textContent = data.materias_aprobadas;
  } catch (err) {
    document.querySelector('.contenido').insertAdjacentHTML(
      'beforeend',
      `<div class="alerta-error">${err.message}</div>`
    );
  }
})();
