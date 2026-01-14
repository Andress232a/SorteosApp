-- Agregar campo link a la tabla sorteos
ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS link VARCHAR(255) NULL AFTER estado;







