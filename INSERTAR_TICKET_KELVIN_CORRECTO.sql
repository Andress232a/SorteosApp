-- SQL CORRECTO para insertar ticket a kelvin
-- El sorteo se llama "Kelvin" y el producto es "Gatico"
-- sorteo_id = 8

USE sorteo;

-- Insertar ticket para el usuario kelvin (ID 1) en el sorteo "Kelvin" (sorteo_id = 8)
INSERT INTO tickets (
    sorteo_id,
    usuario_id,
    numero_ticket,
    precio,
    estado,
    fecha_compra
)
SELECT 
    s.id AS sorteo_id,
    1 AS usuario_id,  -- ID del usuario kelvin
    CONCAT('TKT-', LPAD(FLOOR(RAND() * 999999), 6, '0'), '-', UNIX_TIMESTAMP()) AS numero_ticket,
    1000.00 AS precio,
    'vendido' AS estado,
    NOW() AS fecha_compra
FROM sorteos s
WHERE LOWER(s.titulo) LIKE '%kelvin%'
LIMIT 1;

-- Verificar que se insertó correctamente
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
LEFT JOIN productos p ON p.sorteo_id = s.id
WHERE t.usuario_id = 1
ORDER BY t.id DESC;





