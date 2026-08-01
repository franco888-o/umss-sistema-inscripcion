(function () {
  let usuarioActual = null;
  let codigoActivo = null; // { id_codigo, id_matricula, gestion_semestre }
  const materiasInscritas = new Set(); // id_materia ya inscritas en esta sesión
  const carrito = []; // { sigla, nombre_materia, nombre_grupo }

  const DIAS_ABREV = {
    Lunes: 'Lun', Martes: 'Mar', Miércoles: 'Mié', Jueves: 'Jue',
    Viernes: 'Vie', Sábado: 'Sáb', Domingo: 'Dom',
  };

  function mostrarVista(nombre) {
    ['pago', 'codigo', 'materias'].forEach((v) => {
      document.getElementById(`vista-${v}`).style.display = v === nombre ? 'block' : 'none';
    });
  }

  function hora(h) {
    return h ? h.slice(0, 5) : '';
  }

  function formatearHorario(horarios) {
    if (!horarios || horarios.length === 0) return 'Sin horario asignado';
    return horarios
      .map((h) => `${DIAS_ABREV[h.dia] || h.dia} ${hora(h.hora_inicio)}-${hora(h.hora_fin)}`)
      .join(' / ');
  }

  function actualizarCarritoUI() {
    document.getElementById('carrito-cantidad').textContent = carrito.length;
    document.getElementById('carrito-lista').innerHTML = carrito
      .map((m) => `<div class="carrito-item"><span>${m.sigla} - ${m.nombre_materia}</span><span>${m.nombre_grupo}</span></div>`)
      .join('') || '<div style="color:#6b7280;font-size:13px;">Aún no has añadido materias.</div>';
  }

  // -------- Vista: Pago --------
  document.getElementById('link-ir-pago').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarVista('pago');
  });

  document.getElementById('btn-pagar').addEventListener('click', async () => {
    const usuarioBanco = document.getElementById('pago-usuario').value.trim();
    const claveBanco = document.getElementById('pago-clave').value;
    const errorBox = document.getElementById('pago-error');
    errorBox.style.display = 'none';

    if (!usuarioBanco || !claveBanco) {
      errorBox.textContent = 'Ingrese su usuario y contraseña del portal de pagos';
      errorBox.style.display = 'block';
      return;
    }

    try {
      const data = await apiFetch('/api/matricula/pagar', {
        method: 'POST',
        body: JSON.stringify({ usuario_banco: usuarioBanco, contrasena_banco: claveBanco }),
      });
      document.getElementById('codigo-generado').textContent = data.codigo;
      document.getElementById('codigo-generado').title = 'Clic para copiar';
      document.getElementById('codigo-generado').onclick = () => navigator.clipboard?.writeText(data.codigo);
      document.getElementById('pago-resultado').style.display = 'block';
      document.getElementById('btn-continuar-codigo').onclick = () => validarCodigo(data.codigo);
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
    }
  });

  // -------- Vista: Código de acceso --------
  document.getElementById('btn-validar-codigo').addEventListener('click', () => {
    validarCodigo(document.getElementById('input-codigo').value.trim());
  });
  document.getElementById('input-codigo').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') validarCodigo(e.target.value.trim());
  });

  async function validarCodigo(codigo) {
    const errorBox = document.getElementById('codigo-error');
    errorBox.style.display = 'none';

    if (!codigo) {
      errorBox.textContent = 'Ingrese un código de acceso';
      errorBox.style.display = 'block';
      mostrarVista('codigo');
      return;
    }

    try {
      const data = await apiFetch('/api/inscripcion/validar-codigo', {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      });
      codigoActivo = data;
      document.getElementById('codigo-activo').value = `${codigo} (Gestión ${data.gestion_semestre})`;
      await cargarMaterias();
      mostrarVista('materias');
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
      mostrarVista('codigo');
    }
  }

  // -------- Vista: Materias disponibles --------
  async function cargarMaterias() {
    const data = await apiFetch('/api/inscripcion/materias-disponibles');
    const semestres = Object.keys(data.semestres).sort((a, b) => a - b);

    document.getElementById('lista-semestres').innerHTML = semestres
      .map((sem) => {
        const filas = data.semestres[sem]
          .map((m) => {
            const inscrita = materiasInscritas.has(m.id_materia);
            const etiquetasHtml = m.etiquetas.map((et) => `<span class="etiqueta">${et}</span>`).join('');
            const btnLabel = inscrita ? 'Inscrito ✓' : m.tiene_grupos ? 'Añadir' : 'Sin grupos';
            const btnDisabled = inscrita || !m.tiene_grupos ? 'disabled' : '';
            return `
            <div class="materia-fila">
              <div>
                <div class="nombre">${m.sigla} - ${m.nombre_materia}</div>
                <div class="etiquetas">${etiquetasHtml}</div>
              </div>
              <button class="btn btn-secundario btn-chico" ${btnDisabled}
                onclick="window.__abrirModalMateria(${m.id_materia}, '${m.sigla} - ${m.nombre_materia.replace(/'/g, "\\'")}')">
                ${btnLabel}
              </button>
            </div>`;
          })
          .join('');

        return `
        <div class="card">
          <div class="semestre-header">${sem}er/do Semestre <span>&#9662;</span></div>
          <div>${filas}</div>
        </div>`;
      })
      .join('');

    actualizarCarritoUI();
  }

  // -------- Modal de grupos --------
  const modalFondo = document.getElementById('modal-fondo');
  document.getElementById('modal-cerrar').addEventListener('click', () => {
    modalFondo.style.display = 'none';
  });

  window.__abrirModalMateria = async function (idMateria, nombreMateria) {
    document.getElementById('modal-materia-nombre').textContent = nombreMateria;
    document.getElementById('modal-tabla-grupos').innerHTML = '';
    document.getElementById('modal-sin-grupos').style.display = 'none';
    modalFondo.style.display = 'flex';

    try {
      const data = await apiFetch(`/api/inscripcion/grupos/${idMateria}`);
      if (data.grupos.length === 0) {
        document.getElementById('modal-sin-grupos').style.display = 'block';
        return;
      }

      document.getElementById('modal-tabla-grupos').innerHTML = data.grupos
        .map((g) => {
          const pct = Math.min(100, Math.round((g.cupo_actual / g.cupo_max) * 100));
          const lleno = g.cupo_actual >= g.cupo_max;
          return `
          <tr>
            <td>${g.nombre_grupo}</td>
            <td>${g.nombre_docente} ${g.apellido_docente}</td>
            <td>${formatearHorario(g.horarios)}</td>
            <td>
              <span class="cupos-barra"><div style="width:${pct}%"></div></span>
              ${g.cupo_actual}/${g.cupo_max}
            </td>
            <td>
              <button class="btn btn-secundario btn-chico" ${lleno ? 'disabled' : ''}
                onclick="window.__inscribirGrupo(${g.id_grupo}, ${idMateria}, '${nombreMateria.replace(/'/g, "\\'")}', '${g.nombre_grupo}')">
                ${lleno ? 'Sin cupo' : 'Inscribir en este grupo'}
              </button>
            </td>
          </tr>`;
        })
        .join('');
    } catch (err) {
      document.getElementById('modal-sin-grupos').textContent = err.message;
      document.getElementById('modal-sin-grupos').style.display = 'block';
    }
  };

  window.__inscribirGrupo = async function (idGrupo, idMateria, nombreMateria, nombreGrupo) {
    try {
      await apiFetch('/api/inscripcion/inscribir', {
        method: 'POST',
        body: JSON.stringify({ id_codigo_acceso: codigoActivo.id_codigo, id_grupo: idGrupo }),
      });
      materiasInscritas.add(idMateria);
      const [sigla, ...resto] = nombreMateria.split(' - ');
      carrito.push({ sigla, nombre_materia: resto.join(' - '), nombre_grupo: nombreGrupo });
      modalFondo.style.display = 'none';
      await cargarMaterias();
    } catch (err) {
      alert(err.message);
    }
  };

  // -------- Inicio --------
  (async function init() {
    usuarioActual = await requireSession();
    if (!usuarioActual) return;

    if (!usuarioActual.id_estudiante) {
      document.querySelector('.contenido').innerHTML =
        '<h1>Inscripción</h1><div class="card centro-vacio">Esta es una cuenta administrativa, no tiene datos de estudiante.</div>';
      return;
    }

    mostrarVista('codigo');
  })();
})();
