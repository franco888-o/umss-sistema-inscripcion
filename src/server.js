require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const kardexRoutes = require('./routes/kardex.routes');
const mallaRoutes = require('./routes/malla.routes');
const matriculaRoutes = require('./routes/matricula.routes');
const inscripcionRoutes = require('./routes/inscripcion.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'umss-secreto-cambiar-en-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 }, // 4 horas
  })
);

// API
app.use('/api/auth', authRoutes);
app.use('/api/kardex', kardexRoutes);
app.use('/api/malla', mallaRoutes);
app.use('/api/matricula', matriculaRoutes);
app.use('/api/inscripcion', inscripcionRoutes);

// Frontend estático
app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`\n  Sistema UMSS corriendo en http://localhost:${PORT}\n`);
});
