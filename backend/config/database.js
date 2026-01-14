const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sorteo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Crear tablas si no existen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        rol ENUM('usuario', 'admin') DEFAULT 'usuario',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Agregar columna rol si la tabla ya existe pero no tiene el campo
    try {
      await connection.query(`
        ALTER TABLE usuarios 
        ADD COLUMN rol ENUM('usuario', 'admin') DEFAULT 'usuario'
      `);
    } catch (error) {
      // La columna ya existe, ignorar error
      if (!error.message.includes('Duplicate column name')) {
        console.log('Nota: Columna rol ya existe o error al agregarla');
      }
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sorteos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_sorteo DATETIME NOT NULL,
        estado ENUM('activo', 'finalizado', 'cancelado') DEFAULT 'activo',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sorteo_id INT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url VARCHAR(500),
        posicion_premio INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sorteo_id INT NOT NULL,
        usuario_id INT,
        numero_ticket VARCHAR(50) UNIQUE NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        estado ENUM('disponible', 'vendido', 'ganador') DEFAULT 'disponible',
        fecha_compra TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        INDEX idx_sorteo (sorteo_id),
        INDEX idx_numero (numero_ticket)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT,
        usuario_id INT,
        monto DECIMAL(10, 2) NOT NULL,
        metodo_pago ENUM('paypal', 'transbank') NOT NULL,
        transaccion_id VARCHAR(255),
        estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
        datos_pago TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ganadores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sorteo_id INT NOT NULL,
        ticket_id INT NOT NULL,
        producto_id INT NOT NULL,
        posicion_premio INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_premio (sorteo_id, posicion_premio)
      )
    `);

    connection.release();
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };

