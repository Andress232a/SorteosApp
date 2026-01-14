-- ============================================
-- 🚀 CREAR USUARIO ADMINISTRADOR
-- ============================================
-- OPCIÓN 1: Usar el script de Node.js (RECOMENDADO)
-- Ejecuta en la terminal: npm run create-admin
-- ============================================
-- 
-- OPCIÓN 2: Si prefieres SQL directo, usa esto:
-- ============================================

USE sorteo;

-- Agregar columna 'rol' si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS rol ENUM('usuario', 'admin') DEFAULT 'usuario';

-- ⚠️ IMPORTANTE: El hash de abajo puede no funcionar
-- Mejor usa: npm run create-admin (en la carpeta backend)
-- 
-- Si aún quieres usar SQL, primero ejecuta esto en Node.js para obtener el hash:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('123456', 10).then(hash => console.log(hash));

-- Crear usuario (reemplaza HASH_AQUI con el hash generado)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES (
    'Administrador',
    'admin@gmail.com',
    'HASH_AQUI',  -- ⚠️ Necesitas generar el hash primero
    'admin'
)
ON DUPLICATE KEY UPDATE 
    nombre = 'Administrador',
    rol = 'admin',
    password = 'HASH_AQUI';

-- Verificar
SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@gmail.com';
