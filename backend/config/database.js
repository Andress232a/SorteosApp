require('dotenv').config();

// Detectar qué tipo de base de datos usar según las variables de entorno
const DB_TYPE = process.env.DB_TYPE || 'mysql'; // 'mysql' o 'postgres'

let pool;
let queryMethod;

if (DB_TYPE === 'postgres') {
  // Configuración para PostgreSQL (Supabase)
  const { Pool } = require('pg');
  
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10, // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Wrapper para hacer las queries compatibles
  queryMethod = async (query, params) => {
    // Convertir placeholders de MySQL (?) a PostgreSQL ($1, $2, ...)
    if (typeof query === 'string' && params && params.length > 0) {
      let paramIndex = 1;
      const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
      const result = await pool.query(convertedQuery, params);
      return [result.rows, result.fields];
    } else {
      const result = await pool.query(query, params);
      return [result.rows, result.fields];
    }
  };

  // Método getConnection compatible
  pool.getConnection = async () => {
    const client = await pool.connect();
    const connectionExecute = async (query, params) => {
      if (typeof query === 'string' && params && params.length > 0) {
        let paramIndex = 1;
        const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
        const result = await client.query(convertedQuery, params);
        return [result.rows, result.fields];
      } else {
        const result = await client.query(query, params);
        return [result.rows, result.fields];
      }
    };
    return {
      query: connectionExecute,
      execute: connectionExecute,
      release: () => client.release(),
    };
  };

  console.log('✅ Conectado a PostgreSQL (Supabase)');
} else {
  // Configuración para MySQL (local)
  const mysql = require('mysql2/promise');
  
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sorteo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  queryMethod = pool.query.bind(pool);
  console.log('✅ Conectado a MySQL (local)');
}

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    if (DB_TYPE === 'postgres') {
      // PostgreSQL (Supabase) - Las tablas se crean desde Supabase Dashboard
      // Solo verificamos la conexión
      await connection.query('SELECT 1');
      console.log('✅ Base de datos PostgreSQL (Supabase) conectada correctamente');
      console.log('ℹ️  Asegúrate de que las tablas estén creadas en Supabase');
    } else {
      // MySQL - Crear tablas si no existen
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

      console.log('✅ Base de datos MySQL inicializada correctamente');
    }

    connection.release();
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Método execute compatible (para MySQL y PostgreSQL)
const execute = async (query, params) => {
  if (DB_TYPE === 'postgres') {
    // Convertir placeholders de MySQL (?) a PostgreSQL ($1, $2, ...)
    if (typeof query === 'string' && params && params.length > 0) {
      let paramIndex = 1;
      const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
      const result = await pool.query(convertedQuery, params);
      return [result.rows, result.fields];
    } else {
      const result = await pool.query(query, params);
      return [result.rows, result.fields];
    }
  } else {
    // MySQL usa execute directamente
    return await pool.execute(query, params);
  }
};

// Agregar método execute al pool para compatibilidad
pool.execute = execute;

// Exportar pool y query method
const db = {
  pool,
  query: queryMethod,
  execute,
  getConnection: pool.getConnection.bind(pool),
  DB_TYPE
};

module.exports = { pool, initializeDatabase, query: queryMethod, execute, getConnection: pool.getConnection, DB_TYPE };
