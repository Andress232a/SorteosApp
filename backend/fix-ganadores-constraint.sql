-- Script para eliminar la restricción única que impide múltiples ganadores del mismo premio
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar la restricción única si existe
ALTER TABLE ganadores 
DROP CONSTRAINT IF EXISTS ganadores_sorteo_id_posicion_premio_key;

-- Verificar que se eliminó correctamente
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'ganadores'::regclass
AND contype = 'u';
