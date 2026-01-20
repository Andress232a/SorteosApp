const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Obtener todos los sorteos
router.get('/', async (req, res) => {
  try {
    const { DB_TYPE } = require('../config/database');
    
    let query;
    if (DB_TYPE === 'postgres') {
      // PostgreSQL requiere todas las columnas en GROUP BY
      query = `
        SELECT s.id, s.titulo, s.descripcion, s.fecha_sorteo, s.estado, 
               s.created_by, s.created_at, s.updated_at, s.imagenes, s.link,
               COUNT(DISTINCT t.id) as total_tickets,
               COUNT(DISTINCT CASE WHEN t.estado = 'vendido' THEN t.id END) as tickets_vendidos,
               COUNT(DISTINCT p.id) as total_productos
        FROM sorteos s
        LEFT JOIN tickets t ON s.id = t.sorteo_id
        LEFT JOIN productos p ON s.id = p.sorteo_id
        GROUP BY s.id, s.titulo, s.descripcion, s.fecha_sorteo, s.estado, 
                 s.created_by, s.created_at, s.updated_at, s.imagenes, s.link
        ORDER BY s.fecha_sorteo DESC
      `;
    } else {
      // MySQL permite GROUP BY solo con id
      query = `
        SELECT s.*, 
               COUNT(DISTINCT t.id) as total_tickets,
               COUNT(DISTINCT CASE WHEN t.estado = 'vendido' THEN t.id END) as tickets_vendidos,
               COUNT(DISTINCT p.id) as total_productos
        FROM sorteos s
        LEFT JOIN tickets t ON s.id = t.sorteo_id
        LEFT JOIN productos p ON s.id = p.sorteo_id
        GROUP BY s.id
        ORDER BY s.fecha_sorteo DESC
      `;
    }
    
    const [sorteos] = await pool.execute(query, []);

    // Obtener productos para cada sorteo
    for (let sorteo of sorteos) {
      const [productos] = await pool.execute(
        'SELECT * FROM productos WHERE sorteo_id = ? ORDER BY posicion_premio',
        [sorteo.id]
      );
      
      // Parsear imágenes de cada producto
      sorteo.productos = productos.map(producto => {
        if (producto.imagenes) {
          try {
            if (typeof producto.imagenes === 'string') {
              producto.imagenes = JSON.parse(producto.imagenes);
            } else if (Array.isArray(producto.imagenes)) {
              producto.imagenes = producto.imagenes;
            } else {
              producto.imagenes = [];
            }
          } catch (e) {
            console.error('Error al parsear imágenes del producto:', e);
            producto.imagenes = [];
          }
        } else {
          producto.imagenes = [];
        }
        return producto;
      });
      
      // Parsear imágenes si existen
      if (sorteo.imagenes) {
        try {
          if (typeof sorteo.imagenes === 'string') {
            const parsed = JSON.parse(sorteo.imagenes);
            sorteo.imagenes = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(sorteo.imagenes)) {
            sorteo.imagenes = sorteo.imagenes;
          } else {
            sorteo.imagenes = [];
          }
        } catch (e) {
          console.error('Error al parsear imágenes:', e);
          sorteo.imagenes = [];
        }
      } else {
        sorteo.imagenes = [];
      }
    }

    res.json(sorteos);
  } catch (error) {
    console.error('Error al obtener sorteos:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener sorteos',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Obtener un sorteo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [sorteos] = await pool.execute(
      'SELECT * FROM sorteos WHERE id = ?',
      [id]
    );

    if (sorteos.length === 0) {
      return res.status(404).json({ error: 'Sorteo no encontrado' });
    }

    const sorteo = sorteos[0];

    // Obtener productos
    const [productos] = await pool.execute(
      'SELECT * FROM productos WHERE sorteo_id = ? ORDER BY posicion_premio',
      [id]
    );
    
    // Parsear imágenes de cada producto
    sorteo.productos = productos.map(producto => {
      if (producto.imagenes) {
        try {
          if (typeof producto.imagenes === 'string') {
            producto.imagenes = JSON.parse(producto.imagenes);
          } else if (Array.isArray(producto.imagenes)) {
            producto.imagenes = producto.imagenes;
          } else {
            producto.imagenes = [];
          }
        } catch (e) {
          console.error('Error al parsear imágenes del producto:', e);
          producto.imagenes = [];
        }
      } else {
        producto.imagenes = [];
      }
      return producto;
    });
    
    // Obtener promociones
    const [promociones] = await pool.execute(
      'SELECT * FROM promociones WHERE sorteo_id = ? AND activa = TRUE ORDER BY cantidad_tickets ASC',
      [id]
    );
    sorteo.promociones = promociones;
    
    // Parsear imágenes si existen
    console.log('🔍 Imágenes en BD (raw) para sorteo', id, ':', sorteo.imagenes);
    console.log('🔍 Tipo de imagenes en BD:', typeof sorteo.imagenes);
    
    if (sorteo.imagenes) {
      try {
        if (typeof sorteo.imagenes === 'string') {
          const parsed = JSON.parse(sorteo.imagenes);
          sorteo.imagenes = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(sorteo.imagenes)) {
          sorteo.imagenes = sorteo.imagenes;
        } else {
          sorteo.imagenes = [];
        }
        console.log('🔍 Imágenes parseadas:', sorteo.imagenes);
        console.log('🔍 Cantidad final:', sorteo.imagenes.length);
      } catch (e) {
        console.error('❌ Error al parsear imágenes:', e);
        sorteo.imagenes = [];
      }
    } else {
      console.log('⚠️ No hay imágenes en el sorteo');
      sorteo.imagenes = [];
    }

    // Obtener estadísticas
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN estado = 'vendido' THEN 1 END) as tickets_vendidos,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as tickets_disponibles
      FROM tickets
      WHERE sorteo_id = ?
    `, [id]);
    sorteo.estadisticas = stats[0];

    // Obtener ganadores si el sorteo está finalizado
    if (sorteo.estado === 'finalizado') {
      const [ganadores] = await pool.execute(`
        SELECT g.*, t.numero_ticket, p.nombre as producto_nombre, u.nombre as ganador_nombre, u.email as ganador_email
        FROM ganadores g
        JOIN tickets t ON g.ticket_id = t.id
        JOIN productos p ON g.producto_id = p.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        WHERE g.sorteo_id = ?
        ORDER BY g.posicion_premio
      `, [id]);
      sorteo.ganadores = ganadores;
    }

    res.json(sorteo);
  } catch (error) {
    console.error('Error al obtener sorteo:', error);
    res.status(500).json({ error: 'Error al obtener sorteo' });
  }
});

// Crear sorteo (requiere autenticación)
router.post('/', authenticateToken, [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('fecha_sorteo').notEmpty().withMessage('La fecha del sorteo es requerida'),
  body('productos').isArray({ min: 1 }).withMessage('Debe haber al menos un producto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, descripcion, fecha_sorteo, productos, imagenes, link } = req.body;

    // Validar que las imágenes sean un array y no excedan 5
    let imagenesArray = [];
    if (imagenes && Array.isArray(imagenes)) {
      imagenesArray = imagenes.slice(0, 5); // Máximo 5 imágenes
    }

    console.log('🔍 Imágenes recibidas en backend:', imagenes);
    console.log('🔍 Imágenes procesadas:', imagenesArray);
    console.log('🔍 Cantidad de imágenes:', imagenesArray.length);

    // Convertir array de imágenes a JSON
    const imagenesJson = imagenesArray.length > 0 ? JSON.stringify(imagenesArray) : null;

    // Crear sorteo
    // En PostgreSQL necesitamos usar RETURNING id, en MySQL usamos insertId
    const { DB_TYPE } = require('../config/database');
    let insertQuery = 'INSERT INTO sorteos (titulo, descripcion, fecha_sorteo, imagenes, link, created_by) VALUES (?, ?, ?, ?, ?, ?)';
    
    if (DB_TYPE === 'postgres') {
      insertQuery += ' RETURNING id';
    }
    
    const [result] = await pool.execute(
      insertQuery,
      [titulo, descripcion || null, fecha_sorteo, imagenesJson, link || null, req.user.id]
    );

    // Obtener el ID del sorteo creado
    // En PostgreSQL, el resultado está en result[0].id después de RETURNING
    // En MySQL, está en result.insertId
    let sorteoId;
    if (DB_TYPE === 'postgres') {
      sorteoId = result[0]?.id || result.insertId;
    } else {
      sorteoId = result.insertId;
    }
    
    if (!sorteoId) {
      throw new Error('No se pudo obtener el ID del sorteo creado');
    }

    // Crear productos
    if (productos && productos.length > 0) {
      for (let producto of productos) {
        try {
          // Convertir array de imágenes a JSON si existe
          let imagenesJson = null;
          if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
            imagenesJson = JSON.stringify(producto.imagenes);
          }
          
          // Intentar insertar con la columna 'imagenes' (nueva estructura)
          // Si falla porque la columna no existe, usar 'imagen_url' (estructura antigua)
          try {
            await pool.execute(
              'INSERT INTO productos (sorteo_id, nombre, descripcion, imagenes, posicion_premio) VALUES (?, ?, ?, ?, ?)',
              [
                sorteoId,
                producto.nombre,
                producto.descripcion || null,
                imagenesJson,
                producto.posicion_premio || 1
              ]
            );
          } catch (insertError) {
            // Si falla porque la columna 'imagenes' no existe, usar 'imagen_url'
            if (insertError.message && (insertError.message.includes('imagenes') || insertError.message.includes('column'))) {
              console.warn('⚠️ Columna "imagenes" no existe, usando "imagen_url" (estructura antigua). Ejecuta el script SQL para actualizar.');
              // Si hay imágenes, usar la primera como imagen_url
              let imagenUrl = null;
              if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
                imagenUrl = producto.imagenes[0];
              }
              await pool.execute(
                'INSERT INTO productos (sorteo_id, nombre, descripcion, imagen_url, posicion_premio) VALUES (?, ?, ?, ?, ?)',
                [
                  sorteoId,
                  producto.nombre,
                  producto.descripcion || null,
                  imagenUrl,
                  producto.posicion_premio || 1
                ]
              );
            } else {
              throw insertError;
            }
          }
        } catch (productoError) {
          console.error('Error al crear producto:', productoError);
          console.error('Producto que falló:', producto);
          throw new Error(`Error al crear producto "${producto.nombre}": ${productoError.message}`);
        }
      }
    }

    // Obtener el sorteo creado
    const [sorteos] = await pool.execute(
      'SELECT * FROM sorteos WHERE id = ?',
      [sorteoId]
    );

    const sorteo = sorteos[0];
    const [productosList] = await pool.execute(
      'SELECT * FROM productos WHERE sorteo_id = ? ORDER BY posicion_premio',
      [sorteoId]
    );
    sorteo.productos = productosList;
    
    // Parsear imágenes si existen
    if (sorteo.imagenes) {
      try {
        sorteo.imagenes = typeof sorteo.imagenes === 'string' ? JSON.parse(sorteo.imagenes) : sorteo.imagenes;
      } catch (e) {
        sorteo.imagenes = [];
      }
    } else {
      sorteo.imagenes = [];
    }

    res.status(201).json(sorteo);
  } catch (error) {
    console.error('Error al crear sorteo:', error);
    console.error('Stack:', error.stack);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      error: 'Error al crear sorteo',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Actualizar sorteo
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_sorteo, estado, productos, imagenes, link } = req.body;

    // Verificar que el sorteo existe
    // Si es admin, puede editar cualquier sorteo
    // Si no es admin, solo puede editar sus propios sorteos
    let query = 'SELECT * FROM sorteos WHERE id = ?';
    let params = [id];
    
    if (req.user.rol !== 'admin') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }

    const [sorteos] = await pool.execute(query, params);

    if (sorteos.length === 0) {
      return res.status(404).json({ error: 'Sorteo no encontrado o no tienes permisos' });
    }

    // Validar que las imágenes sean un array y no excedan 5
    let imagenesArray = [];
    if (imagenes && Array.isArray(imagenes)) {
      imagenesArray = imagenes.slice(0, 5); // Máximo 5 imágenes
    }

    console.log('🔍 Imágenes recibidas para actualizar:', imagenes);
    console.log('🔍 Imágenes procesadas:', imagenesArray);
    console.log('🔍 Cantidad de imágenes:', imagenesArray.length);

    // Convertir array de imágenes a JSON
    const imagenesJson = imagenesArray.length > 0 ? JSON.stringify(imagenesArray) : null;

    // Actualizar sorteo
    await pool.execute(
      'UPDATE sorteos SET titulo = ?, descripcion = ?, fecha_sorteo = ?, estado = ?, imagenes = ?, link = ? WHERE id = ?',
      [titulo, descripcion, fecha_sorteo, estado, imagenesJson, link || null, id]
    );

    // Si se envían productos, actualizarlos
    if (productos && Array.isArray(productos)) {
      // Eliminar productos existentes
      await pool.execute('DELETE FROM productos WHERE sorteo_id = ?', [id]);
      
      // Insertar nuevos productos
      for (const producto of productos) {
        // Convertir array de imágenes a JSON si existe
        let imagenesJson = null;
        if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
          imagenesJson = JSON.stringify(producto.imagenes);
        }
        
        await pool.execute(
          'INSERT INTO productos (sorteo_id, nombre, descripcion, imagenes, posicion_premio) VALUES (?, ?, ?, ?, ?)',
          [
            id,
            producto.nombre,
            producto.descripcion || null,
            imagenesJson,
            producto.posicion_premio || 1
          ]
        );
      }
    }

    res.json({ message: 'Sorteo actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar sorteo:', error);
    res.status(500).json({ error: 'Error al actualizar sorteo' });
  }
});

// Eliminar sorteo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Si es admin, puede eliminar cualquier sorteo
    // Si no es admin, solo puede eliminar sus propios sorteos
    let query = 'SELECT * FROM sorteos WHERE id = ?';
    let params = [id];
    
    if (req.user.rol !== 'admin') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }

    const [sorteos] = await pool.execute(query, params);

    if (sorteos.length === 0) {
      return res.status(404).json({ error: 'Sorteo no encontrado o no tienes permisos' });
    }

    await pool.execute('DELETE FROM sorteos WHERE id = ?', [id]);

    res.json({ message: 'Sorteo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar sorteo:', error);
    res.status(500).json({ error: 'Error al eliminar sorteo' });
  }
});

module.exports = router;

