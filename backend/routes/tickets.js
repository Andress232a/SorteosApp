const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Generar número de ticket con formato: Año + Mes + Número secuencial (0000-1000)
function generateTicketNumber(numero) {
  const ahora = new Date();
  const año = ahora.getFullYear(); // 2025
  const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // 01-12
  // Formatear el número con ceros a la izquierda (0000, 0001, 0002, etc., hasta 1000)
  const numeroFormateado = numero.toString().padStart(4, '0');
  return `${año}${mes}${numeroFormateado}`;
}

// Crear tickets para un sorteo (solo admin/creador)
router.post('/generar/:sorteoId', authenticateToken, async (req, res) => {
  try {
    const { sorteoId } = req.params;
    const { cantidad, precio } = req.body;

    // Verificar que el sorteo existe
    // Si es admin, puede generar tickets para cualquier sorteo
    // Si no es admin, solo puede generar tickets para sus propios sorteos
    let query = 'SELECT * FROM sorteos WHERE id = ?';
    let params = [sorteoId];
    
    if (req.user.rol !== 'admin') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }

    const [sorteos] = await pool.execute(query, params);

    if (sorteos.length === 0) {
      return res.status(404).json({ error: 'Sorteo no encontrado o no tienes permisos' });
    }

    const sorteo = sorteos[0];

    // Obtener el número de tickets existentes para este sorteo en el mes actual
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    
    // Contar tickets del mes actual que empiezan con el año y mes
    const prefijo = `${año}${mes.toString().padStart(2, '0')}`;
    const [ticketsExistentes] = await pool.execute(
      'SELECT COUNT(*) as total FROM tickets WHERE sorteo_id = ? AND numero_ticket LIKE ?',
      [sorteoId, `${prefijo}%`]
    );
    
    const numeroInicial = ticketsExistentes[0].total || 0;

    // Verificar que no se exceda el límite de 1000 tickets por mes
    if (numeroInicial + cantidad > 1000) {
      return res.status(400).json({ 
        error: `Solo se pueden crear hasta 1000 tickets por mes. Ya existen ${numeroInicial} tickets este mes.` 
      });
    }

    const tickets = [];
    for (let i = 0; i < cantidad; i++) {
      const numeroTicket = generateTicketNumber(numeroInicial + i);
      tickets.push([sorteoId, numeroTicket, precio]);
    }

    // Insertar tickets en lotes para evitar problemas con grandes cantidades
    const { DB_TYPE } = require('../config/database');
    const batchSize = 100;
    
    for (let i = 0; i < tickets.length; i += batchSize) {
      const batch = tickets.slice(i, i + batchSize);
      
      if (DB_TYPE === 'postgres') {
        // PostgreSQL: insertar en lotes usando múltiples VALUES con placeholders $1, $2, etc.
        const values = batch.map((_, idx) => {
          const paramStart = idx * 3 + 1;
          return `($${paramStart}, $${paramStart + 1}, $${paramStart + 2})`;
        }).join(', ');
        
        const params = batch.flat();
        // Usar pool.query directamente porque ya tenemos placeholders $1, $2, etc.
        await pool.query(
          `INSERT INTO tickets (sorteo_id, numero_ticket, precio) VALUES ${values}`,
          params
        );
      } else {
        // MySQL: usar VALUES ? con array de arrays
        await pool.execute(
          'INSERT INTO tickets (sorteo_id, numero_ticket, precio) VALUES ?',
          [batch]
        );
      }
    }

    res.status(201).json({ 
      message: `${cantidad} tickets creados correctamente`,
      cantidad 
    });
  } catch (error) {
    console.error('Error al generar tickets:', error);
    res.status(500).json({ error: 'Error al generar tickets' });
  }
});

// Obtener tickets de un sorteo
router.get('/sorteo/:sorteoId', async (req, res) => {
  try {
    const { sorteoId } = req.params;
    const { estado } = req.query;

    let query = 'SELECT * FROM tickets WHERE sorteo_id = ?';
    const params = [sorteoId];

    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }

    // Ordenar por número de ticket (ordenar numéricamente)
    const { DB_TYPE } = require('../config/database');
    if (DB_TYPE === 'postgres') {
      query += ` ORDER BY CAST(numero_ticket AS INTEGER) ASC, numero_ticket ASC`;
    } else {
      query += ` ORDER BY CAST(numero_ticket AS UNSIGNED) ASC, numero_ticket ASC`;
    }

    const [tickets] = await pool.execute(query, params);

    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// Obtener tickets de un usuario
router.get('/mis-tickets', authenticateToken, async (req, res) => {
  try {
    const [tickets] = await pool.execute(`
      SELECT t.*, s.titulo as sorteo_titulo, s.fecha_sorteo, s.estado as sorteo_estado
      FROM tickets t
      JOIN sorteos s ON t.sorteo_id = s.id
      WHERE t.usuario_id = ?
      ORDER BY t.created_at DESC
    `, [req.user.id]);

    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener mis tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// Obtener tickets disponibles de un sorteo
router.get('/disponibles/:sorteoId', async (req, res) => {
  try {
    const { sorteoId } = req.params;
    const { limite = 10 } = req.query;

    const { DB_TYPE } = require('../config/database');
    const orderBy = DB_TYPE === 'postgres' ? 'RANDOM()' : 'RAND()';
    const [tickets] = await pool.execute(
      `SELECT * FROM tickets WHERE sorteo_id = ? AND estado = 'disponible' ORDER BY ${orderBy} LIMIT ?`,
      [sorteoId, parseInt(limite)]
    );

    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets disponibles:', error);
    res.status(500).json({ error: 'Error al obtener tickets disponibles' });
  }
});

// Reservar tickets (antes del pago) - Asignación aleatoria
router.post('/reservar', authenticateToken, async (req, res) => {
  try {
    const { sorteoId, cantidad = 1 } = req.body;

    // Obtener tickets disponibles de forma aleatoria
    const { DB_TYPE } = require('../config/database');
    const orderBy = DB_TYPE === 'postgres' ? 'RANDOM()' : 'RAND()';
    const [tickets] = await pool.execute(
      `SELECT * FROM tickets WHERE sorteo_id = ? AND estado = 'disponible' ORDER BY ${orderBy} LIMIT ?`,
      [sorteoId, cantidad]
    );

    if (tickets.length < cantidad) {
      return res.status(400).json({ 
        error: `Solo hay ${tickets.length} tickets disponibles` 
      });
    }

    res.json({ 
      tickets,
      total: tickets.reduce((sum, t) => sum + parseFloat(t.precio), 0)
    });
  } catch (error) {
    console.error('Error al reservar tickets:', error);
    res.status(500).json({ error: 'Error al reservar tickets' });
  }
});

// Eliminar un ticket (solo admin)
router.delete('/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Solo admin puede eliminar tickets
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar tickets' });
    }

    // Verificar que el ticket existe y no está vendido
    const [tickets] = await pool.execute(
      'SELECT * FROM tickets WHERE id = ?',
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticket = tickets[0];

    // Solo se pueden eliminar tickets disponibles
    if (ticket.estado === 'vendido') {
      return res.status(400).json({ error: 'No se puede eliminar un ticket vendido' });
    }

    await pool.execute('DELETE FROM tickets WHERE id = ?', [ticketId]);

    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ticket:', error);
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
});

// Eliminar todos los tickets disponibles de un sorteo (solo admin)
router.delete('/sorteo/:sorteoId', authenticateToken, async (req, res) => {
  try {
    const { sorteoId } = req.params;

    // Solo admin puede eliminar tickets
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar tickets' });
    }

    const { DB_TYPE } = require('../config/database');
    const [result] = await pool.execute(
      'DELETE FROM tickets WHERE sorteo_id = ? AND estado = ?',
      [sorteoId, 'disponible']
    );

    const eliminados = DB_TYPE === 'postgres' ? result.rowCount : result.affectedRows;
    res.json({ 
      message: `${eliminados} tickets eliminados correctamente`,
      eliminados
    });
  } catch (error) {
    console.error('Error al eliminar tickets:', error);
    res.status(500).json({ error: 'Error al eliminar tickets' });
  }
});

module.exports = router;

