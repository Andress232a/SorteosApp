-- Script para agregar campo de imágenes a la tabla sorteos
-- Ejecuta este script si ya tienes la base de datos creada

USE sorteo;

ALTER TABLE sorteos 
ADD COLUMN imagenes JSON AFTER estado;








