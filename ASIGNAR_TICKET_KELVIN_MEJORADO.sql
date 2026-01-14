-- Script mejorado para asignar un ticket al usuario kelvin para el premio kelvin
-- Ejecuta este script en tu base de datos MySQL

USE sorteo;

-- PASO 1: Verificar que el usuario kelvin existe
SELECT 
    id,
    nombre,
    email
FROM usuarios
WHERE LOWER(nombre) LIKE '%kelvin%' OR LOWER(email) LIKE '%kelvin%';

-- PASO 2: Verificar que el producto kelvin existe
SELECT 
    p.id AS producto_id,
    p.nombre AS producto_nombre,
    p.sorteo_id,
    s.titulo AS sorteo_titulo
FROM productos p
INNER JOIN sorteos s ON p.sorteo_id = s.id
WHERE LOWER(p.nombre) LIKE '%kelvin%';

-- PASO 3: Insertar ticket (ajusta los IDs según los resultados de los pasos anteriores)
-- Reemplaza USER_ID y SORTEO_ID con los valores que obtuviste arriba
INSERT INTO tickets (
    sorteo_id,
    usuario_id,
    numero_ticket,
    precio,
    estado,
    fecha_compra
)
SELECT 
    p.sorteo_id,
    u.id,
    CONCAT('TKT-', LPAD(FLOOR(RAND() * 999999), 6, '0'), '-', UNIX_TIMESTAMP()),
    1000.00,
    'vendido',
    NOW()
FROM usuarios u
CROSS JOIN productos p
WHERE LOWER(u.nombre) LIKE '%kelvin%'
  AND LOWER(p.nombre) LIKE '%kelvin%'
LIMIT 1;

-- PASO 4: Verificar que se insertó correctamente
SELECT 
    t.id AS ticket_id,
    t.numero_ticket,
    t.estado,
    t.usuario_id,
    t.sorteo_id,
    u.nombre AS usuario,
    u.email,
    s.titulo AS sorteo,
    p.nombre AS premio
FROM tickets t
INNER JOIN usuarios u ON t.usuario_id = u.id
INNER JOIN sorteos s ON t.sorteo_id = s.id
INNER JOIN productos p ON p.sorteo_id = s.id
WHERE t.usuario_id = (SELECT id FROM usuarios WHERE LOWER(nombre) LIKE '%kelvin%' OR LOWER(email) LIKE '%kelvin%' LIMIT 1)
ORDER BY t.id DESC;





