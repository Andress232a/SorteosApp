-- Script para actualizar la tabla productos para soportar múltiples imágenes por producto
-- Ejecuta este script en el SQL Editor de Supabase

-- Cambiar imagen_url (VARCHAR) a imagenes (TEXT) para guardar un array JSON
ALTER TABLE productos 
DROP COLUMN IF EXISTS imagen_url;

ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagenes TEXT;

-- Si ya hay datos con imagen_url, migrarlos a imagenes (array JSON)
-- Esto convierte las URLs existentes en un array JSON
UPDATE productos 
SET imagenes = CASE 
  WHEN imagen_url IS NOT NULL AND imagen_url != '' THEN 
    '["' || imagen_url || '"]'
  ELSE 
    NULL
END
WHERE imagenes IS NULL AND imagen_url IS NOT NULL AND imagen_url != '';
