// Handler para Vercel (Serverless)
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { initializeDatabase } = require('../config/database');
const { pool } = require('../config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir página web
app.use(express.static(path.join(__dirname, '../../web')));

// Rutas
const authRoutes = require('../routes/auth');
const sorteoRoutes = require('../routes/sorteos');
const ticketRoutes = require('../routes/tickets');
const pagoRoutes = require('../routes/pagos');
const tombolaRoutes = require('../routes/tombola');
const adminRoutes = require('../routes/admin');
const promocionesRoutes = require('../routes/promociones');

app.use('/api/auth', authRoutes);
app.use('/api/sorteos', sorteoRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/tombola', tombolaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promociones', promocionesRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Inicializar base de datos (solo una vez)
let dbInitialized = false;

async function initDatabase() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
      console.log('✅ Base de datos inicializada');
    } catch (error) {
      console.error('❌ Error al inicializar base de datos:', error);
    }
  }
}

// Inicializar base de datos al cargar el módulo
initDatabase();

// Exportar para Vercel
module.exports = app;


