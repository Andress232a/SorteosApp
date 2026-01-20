-- Script para actualizar la tabla productos para soportar múltiples imágenes por producto
-- Ejecuta este script en el SQL Editor de Supabase

-- Primero, agregar la columna imagenes si no existe
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagenes TEXT;

-- Si la columna imagen_url existe, migrar los datos y luego eliminarla
DO $$
BEGIN
    -- Verificar si la columna imagen_url existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'productos' 
        AND column_name = 'imagen_url'
    ) THEN
        -- Migrar datos de imagen_url a imagenes (solo si imagenes está vacío)
        UPDATE productos 
        SET imagenes = CASE 
            WHEN imagenes IS NULL AND imagen_url IS NOT NULL AND imagen_url != '' THEN 
                '["' || imagen_url || '"]'
            ELSE 
                imagenes
        END
        WHERE imagenes IS NULL AND imagen_url IS NOT NULL AND imagen_url != '';
        
        -- Eliminar la columna imagen_url
        ALTER TABLE productos DROP COLUMN imagen_url;
    END IF;
END $$;
