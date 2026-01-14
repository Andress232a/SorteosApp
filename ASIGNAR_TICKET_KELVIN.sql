-- Script para asignar un ticket al usuario kelvin para el premio kelvin
-- Ejecuta este script en tu base de datos MySQL

USE sorteo;

-- Insertar ticket para el usuario kelvin en el sorteo que tiene el premio "kelvin"
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
WHERE LOWER(u.nombre) = 'kelvin'
  AND LOWER(p.nombre) = 'kelvin'
LIMIT 1;

-- Verificar que se insertó correctamente
SELECT 
    t.id AS ticket_id,
    t.numero_ticket,
    t.estado,
    u.nombre AS usuario,
    s.titulo AS sorteo,
    p.nombre AS premio
FROM tickets t
INNER JOIN usuarios u ON t.usuario_id = u.id
INNER JOIN sorteos s ON t.sorteo_id = s.id
INNER JOIN productos p ON p.sorteo_id = s.id
WHERE LOWER(u.nombre) = 'kelvin'
  AND LOWER(p.nombre) = 'kelvin'
ORDER BY t.id DESC
LIMIT 1;





