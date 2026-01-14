-- SQL ULTRA SIMPLE - Solo ejecuta esta parte si ya sabes el sorteo_id
-- Si no sabes el sorteo_id, primero ejecuta la consulta de abajo

USE sorteo;

-- OPCIÓN 1: Si ya sabes el sorteo_id, reemplaza XXXX con el ID del sorteo
-- INSERT INTO tickets (sorteo_id, usuario_id, numero_ticket, precio, estado, fecha_compra)
-- VALUES (XXXX, 1, CONCAT('TKT-', LPAD(FLOOR(RAND() * 999999), 6, '0'), '-', UNIX_TIMESTAMP()), 1000.00, 'vendido', NOW());

-- OPCIÓN 2: Buscar el sorteo_id automáticamente por el nombre del producto
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
    1,
    CONCAT('TKT-', LPAD(FLOOR(RAND() * 999999), 6, '0'), '-', UNIX_TIMESTAMP()),
    1000.00,
    'vendido',
    NOW()
FROM productos p
WHERE LOWER(p.nombre) LIKE '%kelvin%'
LIMIT 1;

-- Verificar
SELECT * FROM tickets WHERE usuario_id = 1;





