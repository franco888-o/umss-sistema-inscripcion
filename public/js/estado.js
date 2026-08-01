(async function () {
  const usuario = await requireSession();
  if (!usuario) return;

  if (!usuario.id_estudiante) {
    document.querySelector('.contenido').innerHTML =
      '<h1>Estado de Inscripción</h1><div class="card centro-vacio">Esta es una cuenta administrativa, no tiene datos de estudiante.</div>';
    return;
  }

  async function cargar() {
    const data = await apiFetch('/api/inscripcion/estado');

    if (!data.gestion_semestre || data.materias.length === 0) {
      document.getElementById('sin-datos').style.display = 'block';
      document.getElementById('contenedor-datos').style.display = 'none';
      return;
    }

    document.getElementById('sin-datos').style.display = 'none';
    document.getElementById('titulo-estado').textContent =
      `Inscripción Semestral UMSS: ${data.gestion_semestre} - ¡Exitosa!`;

    const tbody = document.getElementById('tabla-materias');
    tbody.innerHTML = data.materias
      .map(
        (m) => `
      <tr>
        <td>${m.sigla}</td>
        <td>${m.nombre_materia}</td>
        <td>${m.nombre_grupo}</td>
        <td>${m.nombre_docente} ${m.apellido_docente}</td>
        <td>${m.nombre_aula}</td>
        <td>${m.modalidad}</td>
        <td><button class="btn btn-chico btn-retirar" data-id="${m.id_inscripcion}">Retirar</button></td>
      </tr>`
      )
      .join('');

    document.getElementById('total-materias').textContent = data.materias.length;
    document.getElementById('contenedor-datos').style.display = 'block';

    tbody.querySelectorAll('.btn-retirar').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Seguro que deseas retirar esta materia?')) return;
        btn.disabled = true;
        try {
          await apiFetch('/api/inscripcion/retirar', {
            method: 'POST',
            body: JSON.stringify({ id_inscripcion: Number(btn.dataset.id) }),
          });
          await cargar();
        } catch (err) {
          alert(err.message);
          btn.disabled = false;
        }
      });
    });
  }

  try {
    await cargar();
  } catch (err) {
    document.querySelector('.contenido').insertAdjacentHTML(
      'beforeend',
      `<div class="alerta-error">${err.message}</div>`
    );
  }
})();
