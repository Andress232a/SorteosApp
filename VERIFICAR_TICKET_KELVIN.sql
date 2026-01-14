-- Script para verificar si kelvin tiene tickets
-- Ejecuta este script para diagnosticar el problema

USE sorteo;

-- 1. Verificar usuario kelvin
SELECT 
    id AS usuario_id,
    nombre,
    email,
    rol
FROM usuarios
WHERE LOWER(nombre) LIKE '%kelvin%' OR LOWER(email) LIKE '%kelvin%';

-- 2. Verificar tickets del usuario kelvin (reemplaza USER_ID con el id del paso 1)
SELECT 
    t.id AS ticket_id,
    t.numero_ticket,
    t.estado,
    t.usuario_id,
    t.sorteo_id,
    s.titulo AS sorteo_titulo,
    t.fecha_compra
FROM tickets t
LEFT JOIN sorteos s ON t.sorteo_id = s.id
WHERE t.usuario_id = (SELECT id FROM usuarios WHERE LOWER(nombre) LIKE '%kelvin%' OR LOWER(email) LIKE '%kelvin%' LIMIT 1);

-- 3. Verificar productos llamados kelvin
SELECT 
    p.id AS producto_id,
    p.nombre AS producto_nombre,
    p.sorteo_id,
    s.titulo AS sorteo_titulo,
    s.estado AS sorteo_estado
FROM productos p
INNER JOIN sorteos s ON p.sorteo_id = s.id
WHERE LOWER(p.nombre) LIKE '%kelvin%';

-- 4. Ver todos los tickets (para debugging)
SELECT 
    t.id,
    t.numero_ticket,
    t.usuario_id,
    u.nombre AS usuario,
    t.sorteo_id,
    s.titulo AS sorteo,
    t.estado
FROM tickets t
LEFT JOIN usuarios u ON t.usuario_id = u.id
LEFT JOIN sorteos s ON t.sorteo_id = s.id
ORDER BY t.id DESC
LIMIT 10;

