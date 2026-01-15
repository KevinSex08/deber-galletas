const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // ← NUEVO: Importar librería
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // ← MODIFICADO: Pon aquí la URL exacta de tu Frontend (Vite suele ser 5173)
  credentials: true // ← NUEVO: Permite el intercambio de cookies
}));
app.use(express.json());
app.use(cookieParser()); // ← NUEVO: Activar el middleware de cookies

// Rutas
app.use('/api/auth', authRoutes);

// Ruta protegida de ejemplo
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Acceso concedido a contenido protegido',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Middleware de autenticación (MODIFICADO)
function authenticateToken(req, res, next) {
  // ANTES: const authHeader = req.headers['authorization'];
  // AHORA: Leemos el token desde la cookie
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({ 
    message: '🔐 API de Autenticación',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me (requiere token)',
      protected: 'GET /api/protected (requiere token)'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}`);
});