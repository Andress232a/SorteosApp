const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Obtener promociones de un sorteo
router.get('/sorteo/:sorteoId', async (req, res) => {
  try {
    const { sorteoId } = req.params;

    const [promociones] = await pool.execute(
      'SELECT * FROM promociones WHERE sorteo_id = ? AND activa = TRUE ORDER BY cantidad_tickets ASC',
      [sorteoId]
    );

    res.json(promociones);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

// Crear promoción (requiere autenticación)
router.post('/', authenticateToken, [
  body('sorteo_id').notEmpty().withMessage('El ID del sorteo es requerido'),
  body('cantidad_tickets').isInt({ min: 1 }).withMessage('La cantidad de tickets debe ser mayor a 0'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sorteo_id, cantidad_tickets, precio, descripcion } = req.body;

    // Verificar que el sorteo existe y el usuario tiene permisos
    let query = 'SELECT * FROM sorteos WHERE id = ?';
    let params = [sorteo_id];
    
    if (req.user.rol !== 'admin') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }

    const [sorteos] = await pool.execute(query, params);

    if (sorteos.length === 0) {
      return res.status(404).json({ error: 'Sorteo no encontrado o no tienes permisos' });
    }

    // Crear promoción
    const [result] = await pool.execute(
      'INSERT INTO promociones (sorteo_id, cantidad_tickets, precio, descripcion) VALUES (?, ?, ?, ?)',
      [sorteo_id, cantidad_tickets, precio, descripcion || null]
    );

    // Obtener la promoción creada
    const [promociones] = await pool.execute(
      'SELECT * FROM promociones WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(promociones[0]);
  } catch (error) {
    console.error('Error al crear promoción:', error);
    res.status(500).json({ error: 'Error al crear promoción' });
  }
});

// Actualizar promoción
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_tickets, precio, descripcion, activa } = req.body;

    // Verificar que la promoción existe y el usuario tiene permisos
    const [promociones] = await pool.execute(
      'SELECT p.*, s.created_by FROM promociones p JOIN sorteos s ON p.sorteo_id = s.id WHERE p.id = ?',
      [id]
    );

    if (promociones.length === 0) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    const promocion = promociones[0];

    // Verificar permisos
    if (req.user.rol !== 'admin' && promocion.created_by !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para editar esta promoción' });
    }

    // Actualizar promoción
    await pool.execute(
      'UPDATE promociones SET cantidad_tickets = ?, precio = ?, descripcion = ?, activa = ? WHERE id = ?',
      [cantidad_tickets, precio, descripcion || null, activa !== undefined ? activa : true, id]
    );

    res.json({ message: 'Promoción actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    res.status(500).json({ error: 'Error al actualizar promoción' });
  }
});

// Eliminar promoción
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la promoción existe y el usuario tiene permisos
    const [promociones] = await pool.execute(
      'SELECT p.*, s.created_by FROM promociones p JOIN sorteos s ON p.sorteo_id = s.id WHERE p.id = ?',
      [id]
    );

    if (promociones.length === 0) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    const promocion = promociones[0];

    // Verificar permisos
    if (req.user.rol !== 'admin' && promocion.created_by !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta promoción' });
    }

    await pool.execute('DELETE FROM promociones WHERE id = ?', [id]);

    res.json({ message: 'Promoción eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    res.status(500).json({ error: 'Error al eliminar promoción' });
  }
});

module.exports = router;








