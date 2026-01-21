-- Script SQL para crear todas las tablas en MySQL (cPanel)
-- Ejecuta este script en phpMyAdmin

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) DEFAULT 'usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_rol CHECK (rol IN ('usuario', 'admin'))
);

-- Tabla sorteos
CREATE TABLE IF NOT EXISTS sorteos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_sorteo TIMESTAMP NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  imagenes TEXT,
  imagen_portada TEXT,
  link VARCHAR(500),
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT chk_estado CHECK (estado IN ('activo', 'finalizado', 'cancelado'))
);

-- Tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagenes TEXT,
  posicion_premio INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
);

-- Tabla tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  usuario_id INT,
  numero_ticket VARCHAR(50) UNIQUE NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible',
  fecha_compra TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT chk_estado_ticket CHECK (estado IN ('disponible', 'vendido', 'ganador'))
);

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_sorteo ON tickets(sorteo_id);
CREATE INDEX IF NOT EXISTS idx_tickets_numero ON tickets(numero_ticket);
CREATE INDEX IF NOT EXISTS idx_tickets_usuario ON tickets(usuario_id);

-- Tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT,
  usuario_id INT,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL,
  transaccion_id VARCHAR(255),
  estado VARCHAR(20) DEFAULT 'pendiente',
  datos_pago TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT chk_metodo_pago CHECK (metodo_pago IN ('paypal', 'transbank')),
  CONSTRAINT chk_estado_pago CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado'))
);

-- Tabla ganadores
CREATE TABLE IF NOT EXISTS ganadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  ticket_id INT NOT NULL,
  producto_id INT NOT NULL,
  posicion_premio INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Tabla promociones
CREATE TABLE IF NOT EXISTS promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  cantidad_tickets INT NOT NULL,
  precio_total DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
);

-- Crear usuario admin por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
-- Puedes cambiar la contraseña después desde la aplicación
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Admin', 'admin@premioclick.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin')
ON DUPLICATE KEY UPDATE nombre=nombre;
