-- ============================================
-- CREAR USUARIO ADMINISTRADOR
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Primero ejecuta este script para agregar la columna 'rol'
-- 2. Luego regístrate desde la app con tu email y contraseña
-- 3. Finalmente ejecuta el UPDATE al final de este archivo
--
-- ============================================

-- Paso 1: Agregar columna 'rol' a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS rol ENUM('usuario', 'admin') DEFAULT 'usuario';

-- Paso 2: Si ya te registraste desde la app, ejecuta esto:
-- (Cambia 'tu-email@ejemplo.com' por el email con el que te registraste)
UPDATE usuarios 
SET rol = 'admin' 
WHERE email = 'tu-email@ejemplo.com';

-- ============================================
-- VERIFICAR QUE FUNCIONÓ:
-- ============================================
SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'admin';

-- ============================================
-- Si quieres crear el admin directamente (más complejo):
-- ============================================
-- Necesitas generar el hash de la contraseña primero
-- Puedes usar: https://bcrypt-generator.com/
-- O ejecutar en Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('tu-password', 10);
-- console.log(hash);
--
-- Luego:
-- INSERT INTO usuarios (nombre, email, password, rol) 
-- VALUES ('Admin', 'admin@ejemplo.com', 'HASH_AQUI', 'admin');

