-- ============================================
-- 🔍 VERIFICAR Y CORREGIR ROL DE ADMIN
-- ============================================
-- Copia y pega esto en MySQL
-- ============================================

USE sorteo;

-- 1. Ver todos los usuarios y sus roles
SELECT id, nombre, email, rol FROM usuarios;

-- 2. Verificar específicamente el admin
SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@gmail.com';

-- 3. Si el rol no es 'admin', corregirlo:
UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@gmail.com';

-- 4. Verificar que se corrigió:
SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@gmail.com';

-- ============================================
-- ✅ Debería mostrar: rol = 'admin'
-- ============================================

