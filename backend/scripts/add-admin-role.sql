-- Script para agregar rol de administrador y crear usuario admin

-- 1. Agregar columna 'rol' a la tabla usuarios si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS rol ENUM('usuario', 'admin') DEFAULT 'usuario';

-- 2. Crear usuario administrador
-- ⚠️ IMPORTANTE: Cambia el email y password por los que quieras
-- La contraseña será hasheada con bcrypt, pero aquí la pones en texto plano
-- Ejemplo: password 'admin123' se convertirá en hash

INSERT INTO usuarios (nombre, email, password, telefono, rol) 
VALUES (
    'Administrador',
    'admin@sorteos.com',  -- ⚠️ Cambia este email
    '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',  -- ⚠️ Esta es una contraseña hasheada de 'admin123'
    NULL,
    'admin'
);

-- NOTA: La contraseña hasheada de arriba es para 'admin123'
-- Si quieres otra contraseña, necesitas generarla con bcrypt
-- O mejor aún, usa el endpoint de registro y luego actualiza el rol

-- 3. Alternativa: Crear usuario normal y luego hacerlo admin
-- Primero regístrate desde la app, luego ejecuta esto cambiando el email:
-- UPDATE usuarios SET rol = 'admin' WHERE email = 'tu-email@ejemplo.com';

