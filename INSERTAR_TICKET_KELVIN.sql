-- SQL SIMPLE para insertar ticket a kelvin
-- Ejecuta este SQL completo en phpMyAdmin

USE sorteo;

-- Primero, verificar qué sorteos y productos existen
SELECT 
    p.id AS producto_id,
    p.nombre AS producto_nombre,
    p.sorteo_id,
    s.titulo AS sorteo_titulo
FROM productos p
INNER JOIN sorteos s ON p.sorteo_id = s.id
WHERE LOWER(p.nombre) LIKE '%kelvin%';

-- Si el producto existe, ejecuta esto para insertar el ticket:
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
    1,  -- ID del usuario kelvin
    CONCAT('TKT-', LPAD(FLOOR(RAND() * 999999), 6, '0'), '-', UNIX_TIMESTAMP()),
    1000.00,
    'vendido',
    NOW()
FROM productos p
WHERE LOWER(p.nombre) LIKE '%kelvin%'
LIMIT 1;

-- Verificar que se insertó
SELECT 
    t.id AS ticket_id,
    t.numero_ticket,
    t.estado,
    t.usuario_id,
    t.sorteo_id,
    u.nombre AS usuario,
    s.titulo AS sorteo,
    p.nombre AS premio
FROM tickets t
INNER JOIN usuarios u ON t.usuario_id = u.id
INNER JOIN sorteos s ON t.sorteo_id = s.id
INNER JOIN productos p ON p.sorteo_id = s.id
WHERE t.usuario_id = 1
ORDER BY t.id DESC;





