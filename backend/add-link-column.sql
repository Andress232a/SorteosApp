-- Script para agregar la columna 'link' a la tabla 'sorteos' en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

ALTER TABLE sorteos 
ADD COLUMN IF NOT EXISTS link VARCHAR(500);


