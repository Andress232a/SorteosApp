-- Script de inicialización de base de datos
-- Ejecuta este script si prefieres crear las tablas manualmente

CREATE DATABASE IF NOT EXISTS sorteo;
USE sorteo;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de sorteos
CREATE TABLE IF NOT EXISTS sorteos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_sorteo DATETIME NOT NULL,
  estado ENUM('activo', 'finalizado', 'cancelado') DEFAULT 'activo',
  imagenes JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url VARCHAR(500),
  posicion_premio INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
);

-- Tabla de tickets
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
);

-- Tabla de pagos
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
);

-- Tabla de ganadores
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
);

-- Tabla de promociones
CREATE TABLE IF NOT EXISTS promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  cantidad_tickets INT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  descripcion VARCHAR(255),
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
);

