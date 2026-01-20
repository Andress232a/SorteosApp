-- SQL para crear un ticket para Andres en el sorteo "ultimo gran sorteo"
-- Ejecuta este script en el SQL Editor de Supabase

-- PRIMERO: Verifica los IDs del sorteo y usuario (ejecuta esto primero)
-- SELECT id, titulo FROM sorteos WHERE LOWER(titulo) LIKE '%ultimo gran sorteo%';
-- SELECT id, nombre, email FROM usuarios WHERE LOWER(nombre) LIKE '%andres%' OR LOWER(email) LIKE '%andres%';

-- SEGUNDO: Inserta el ticket (reemplaza SORTEO_ID y USUARIO_ID con los valores obtenidos arriba)
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
  u.id AS usuario_id,
  'TKT-' || LPAD(CAST(COALESCE((SELECT MAX(CAST(SUBSTRING(numero_ticket FROM 5) AS INTEGER)) FROM tickets WHERE numero_ticket LIKE 'TKT-%'), 0) + 1 AS TEXT), 6, '0') AS numero_ticket,
  1000.00 AS precio,
  'vendido' AS estado,
  CURRENT_TIMESTAMP AS fecha_compra
FROM sorteos s
CROSS JOIN usuarios u
WHERE LOWER(s.titulo) LIKE '%ultimo gran sorteo%'
  AND (LOWER(u.nombre) LIKE '%andres%' OR LOWER(u.email) LIKE '%andres%')
LIMIT 1;

-- VERSIÓN SIMPLE (si prefieres usar IDs directos, descomenta y reemplaza los valores):
-- INSERT INTO tickets (sorteo_id, usuario_id, numero_ticket, precio, estado, fecha_compra)
-- VALUES (
--   (SELECT id FROM sorteos WHERE LOWER(titulo) LIKE '%ultimo gran sorteo%' LIMIT 1),
--   (SELECT id FROM usuarios WHERE LOWER(nombre) LIKE '%andres%' OR LOWER(email) LIKE '%andres%' LIMIT 1),
--   'TKT-' || LPAD(CAST(COALESCE((SELECT MAX(CAST(SUBSTRING(numero_ticket FROM 5) AS INTEGER)) FROM tickets WHERE numero_ticket LIKE 'TKT-%'), 0) + 1 AS TEXT), 6, '0'),
--   1000.00,
--   'vendido',
--   CURRENT_TIMESTAMP
-- );

-- Para verificar que se creó correctamente:
-- SELECT t.*, s.titulo AS sorteo_titulo, u.nombre AS usuario_nombre, u.email
-- FROM tickets t
-- JOIN sorteos s ON t.sorteo_id = s.id
-- JOIN usuarios u ON t.usuario_id = u.id
-- WHERE (u.nombre LIKE '%andres%' OR u.email LIKE '%andres%')
--   AND LOWER(s.titulo) LIKE '%ultimo gran sorteo%'
-- ORDER BY t.created_at DESC
-- LIMIT 5;

