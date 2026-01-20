-- Script para agregar columna imagen_portada a la tabla sorteos
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna imagen_portada si no existe
ALTER TABLE sorteos
ADD COLUMN IF NOT EXISTS imagen_portada TEXT;

-- La columna imagen_portada almacenará una URL o base64 de la imagen de portada del sorteo
-- Esta es diferente a la columna 'imagenes' que puede contener múltiples imágenes del sorteo
