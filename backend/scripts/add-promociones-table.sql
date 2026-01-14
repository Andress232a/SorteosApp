-- Script para agregar tabla de promociones
-- Ejecuta este script si ya tienes la base de datos creada

USE sorteo;

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








