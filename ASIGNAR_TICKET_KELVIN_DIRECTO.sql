-- Script DIRECTO para asignar un ticket al usuario kelvin
-- Este script es más simple y directo

USE sorteo;

-- Obtener el ID del usuario kelvin (debería ser 1 según los logs)
SET @usuario_id = (SELECT id FROM usuarios WHERE LOWER(nombre) = 'kelvin' OR LOWER(email) LIKE '%kelvin%' LIMIT 1);

-- Obtener el sorteo_id del producto kelvin
SET @sorteo_id = (SELECT p.sorteo_id FROM productos p WHERE LOWER(p.nombre) = 'kelvin' LIMIT 1);

-- Mostrar los valores encontrados
SELECT 
    @usuario_id AS usuario_id_encontrado,
    @sorteo_id AS sorteo_id_encontrado;

-- Si ambos valores existen, insertar el ticket
INSERT INTO tickets (
    sorteo_id,
    usuario_id,
    numero_ticket,
    precio,
    estado,
    fecha_compra
)
SELECT 
    @sorteo_id,
    @usuario_id,
    CONCAT('TKT-', LPAD(FLOOR(RAND() * 999999), 6, '0'), '-', UNIX_TIMESTAMP()),
    1000.00,
    'vendido',
    NOW()
WHERE @usuario_id IS NOT NULL AND @sorteo_id IS NOT NULL;

-- Verificar el ticket insertado
SELECT 
    t.id AS ticket_id,
    t.numero_ticket,
    t.estado,
    t.usuario_id,
    t.sorteo_id,
    u.nombre AS usuario,
    s.titulo AS sorteo
FROM tickets t
INNER JOIN usuarios u ON t.usuario_id = u.id
INNER JOIN sorteos s ON t.sorteo_id = s.id
WHERE t.usuario_id = @usuario_id
ORDER BY t.id DESC
LIMIT 5;





