# Sistema de Inscripción UMSS — Guía de instalación

Este proyecto ya fue probado de principio a fin (login, pago, código de acceso,
inscripción a materias, kardex y malla curricular) y funciona correctamente.
Sigue estos pasos en tu computadora para dejarlo funcionando.

## 0. Qué necesitas instalado antes de empezar

- **Node.js** (versión 18 o superior). Descárgalo de https://nodejs.org
- **PostgreSQL** (versión 13 o superior), ya sea instalado localmente o con pgAdmin.

Para comprobar que los tienes, abre una terminal y escribe:
```
node -v
psql --version
```

## 1. Crear la base de datos

Abre una terminal (o pgAdmin) y crea una base de datos vacía llamada `umss_db`:

```
psql -U postgres -c "CREATE DATABASE umss_db;"
```
(te pedirá la contraseña de tu usuario `postgres`)

Ahora carga el esquema, EN ESTE ORDEN (son 2 archivos dentro de la carpeta `db/`):

```
psql -U postgres -d umss_db -f db/01_schema_original.sql
psql -U postgres -d umss_db -f db/02_mejoras.sql
```

> `01_schema_original.sql` crea las tablas y carga los datos: la carrera de
> Ingeniería Informática (única carrera del sistema), su malla curricular completa
> de 9 semestres, y el único estudiante (Israel Espinoza).
> `02_mejoras.sql` agrega la relación entre `usuario` (login) y `estudiante`, y
> cifra la contraseña con bcrypt. Todo queda documentado dentro del archivo.

## 2. Configurar la conexión a la base de datos

Dentro de la carpeta del proyecto, copia el archivo `.env.example` y renómbralo a `.env`:

```
cp .env.example .env
```

Abre `.env` con cualquier editor de texto y coloca tu contraseña real de PostgreSQL:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_NAME=umss_db
PORT=3000
SESSION_SECRET=cualquier-texto-secreto-y-largo
```

## 3. Instalar las dependencias del proyecto

Dentro de la carpeta del proyecto:

```
npm install
```

## 4. Iniciar el sistema

```
npm start
```

Deberías ver en la terminal:
```
Sistema UMSS corriendo en http://localhost:3000
```

## 5. Abrir la aplicación

Abre tu navegador en **http://localhost:3000**

### Usuario del sistema (ya viene cargado en la base de datos):

| Usuario            | Contraseña   | Estudiante        | Carrera                |
|---------------------|-------------|--------------------|-------------------------|
| `Israel Espinoza`   | `202403150` | Israel Espinoza    | Ingeniería Informática  |

El sistema tiene un solo usuario, una sola carrera (Ingeniería Informática) y un
solo estudiante. Israel ya tiene los semestres 1, 2 y 3 aprobados en su Kardex, y
una matrícula vigente y pagada (12 Bs) para el semestre 4, con sus 6 materias
correspondientes ya inscritas (docente, aula y horario incluidos). Puedes iniciar
sesión y ver directamente "Estado de Inscripción" y "Kardex" con datos reales, o
probar de nuevo el flujo completo de inscripción desde cero pagando otra matrícula.

## Qué hace cada pantalla

- **Estado de Inscripción**: materias inscritas en la gestión más reciente.
- **Kardex**: historial académico, promedio general y materias aprobadas.
- **Inscripción**: pagar matrícula (simulado, 12 Bs) → obtener código de acceso →
  validarlo → elegir materias de la malla → elegir grupo/horario/docente →
  inscribirse (controla cupos).
- **Malla Curricular**: las 9 semestres de Ingeniería Informática con sus
  prerrequisitos — indica qué materia hay que aprobar antes de poder cursar la
  siguiente.

## Sobre el logo

Ya está colocado el logo oficial de la UMSS (`public/assets/logo-umss.png`) en las
5 pantallas del sistema (login, estado, kardex, inscripción y malla). Si en algún
momento quieres cambiarlo por otra versión, solo reemplaza ese archivo por uno del
mismo nombre.

## Problemas comunes

- **"ECONNREFUSED" o "could not connect to server"**: PostgreSQL no está corriendo, o
  el `DB_HOST`/`DB_PORT` en `.env` está mal.
- **"password authentication failed"**: la contraseña en `.env` no coincide con la de tu
  usuario `postgres`.
- **"database umss_db does not exist"**: falta el paso 1 (crear la base de datos).
- **"Port 3000 already in use"**: cambia `PORT=3000` por otro número (ej. `3001`) en `.env`.
- **La página carga pero no aparece nada**: abre las herramientas de desarrollador del
  navegador (F12) → pestaña "Console" y revisa el error; probablemente el backend no
  está corriendo o la base de datos no tiene los datos cargados.

## Siguiente paso recomendado (no obligatorio)

Este sistema fue armado para que funcione y sea fácil de entender, pero antes de subirlo
a un servidor público real conviene:
- Usar HTTPS.
- Guardar las sesiones en la propia base de datos (`connect-pg-simple`) en vez de memoria.
- Agregar validaciones más estrictas en los formularios.

Si quieres, puedo ayudarte con cualquiera de estos puntos más adelante.
