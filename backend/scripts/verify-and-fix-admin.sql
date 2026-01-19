-- Script para verificar y configurar el usuario admin correctamente

-- 1. Ver todos los usuarios para verificar cuál es el admin
SELECT id, nombre, email, rol FROM usuarios;

-- 2. Si el usuario admin@premioclick.com existe, actualizar su contraseña y rol
UPDATE usuarios
SET password = '$2a$10$l4fACdcPSMpb7IYLJ9yIveq.NaKrhi0z3XccKBzKds1z670LYEimi',
    rol = 'admin'
WHERE email = 'admin@premioclick.com';

-- 3. Si no existe, crear el usuario admin
INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Admin', 'admin@premioclick.com', '$2a$10$l4fACdcPSMpb7IYLJ9yIveq.NaKrhi0z3XccKBzKds1z670LYEimi', 'admin')
ON CONFLICT (email) DO UPDATE
SET password = '$2a$10$l4fACdcPSMpb7IYLJ9yIveq.NaKrhi0z3XccKBzKds1z670LYEimi',
    rol = 'admin';

-- 4. Verificar que se creó/actualizó correctamente
SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@premioclick.com';


