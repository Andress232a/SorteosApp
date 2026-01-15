const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const paypal = require('paypal-rest-sdk');
const axios = require('axios');

const router = express.Router();

// Configurar PayPal
const paypalConfig = {
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || ''
};

// Validar que las credenciales estén configuradas
if (!paypalConfig.client_id || !paypalConfig.client_secret) {
  console.error('⚠️ ADVERTENCIA: Las credenciales de PayPal no están configuradas en el archivo .env');
  console.error('   PAYPAL_CLIENT_ID:', paypalConfig.client_id ? '✅ Configurado' : '❌ Faltante');
  console.error('   PAYPAL_CLIENT_SECRET:', paypalConfig.client_secret ? '✅ Configurado' : '❌ Faltante');
} else {
  console.log('✅ PayPal configurado correctamente');
  console.log('   Modo:', paypalConfig.mode);
  console.log('   Client ID:', paypalConfig.client_id.substring(0, 20) + '...');
}

paypal.configure(paypalConfig);

// Crear pago PayPal
router.post('/paypal/create', authenticateToken, async (req, res) => {
  try {
    const { ticketIds, monto } = req.body;

    console.log('📝 Solicitud de pago PayPal recibida:', {
      ticketIds,
      monto,
      usuarioId: req.user.id,
      cantidadTickets: ticketIds?.length
    });

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      console.error('❌ Error: No se proporcionaron tickets válidos');
      return res.status(400).json({ error: 'Se requieren tickets válidos' });
    }

    if (!monto || monto <= 0) {
      console.error('❌ Error: Monto inválido:', monto);
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    // Verificar que los tickets existan y estén disponibles
    const placeholders = ticketIds.map(() => '?').join(',');
    const [tickets] = await pool.execute(
      `SELECT * FROM tickets WHERE id IN (${placeholders}) AND estado = 'disponible'`,
      ticketIds
    );

    console.log('🎫 Tickets encontrados:', tickets.length, 'de', ticketIds.length, 'solicitados');

    if (tickets.length !== ticketIds.length) {
      console.error('❌ Error: Algunos tickets no están disponibles');
      console.error('   Tickets solicitados:', ticketIds);
      console.error('   Tickets encontrados:', tickets.map(t => t.id));
      return res.status(400).json({ 
        error: 'Algunos tickets no están disponibles o no existen',
        detalles: `Se solicitaron ${ticketIds.length} tickets pero solo se encontraron ${tickets.length} disponibles`
      });
    }

    // Verificar que los tickets pertenezcan al mismo sorteo
    const sorteoIds = [...new Set(tickets.map(t => t.sorteo_id))];
    if (sorteoIds.length > 1) {
      console.error('❌ Error: Los tickets pertenecen a diferentes sorteos:', sorteoIds);
      return res.status(400).json({ 
        error: 'Los tickets deben pertenecer al mismo sorteo' 
      });
    }

    console.log('✅ Validaciones pasadas. Creando pago en PayPal...');

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/pagos/paypal/return?success=true`,
        cancel_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/pagos/paypal/return?success=false`
      },
      transactions: [{
        item_list: {
          items: [{
            name: `Ticket${ticketIds.length > 1 ? 's' : ''} de Sorteo`,
            sku: ticketIds.join(','),
            price: monto.toFixed(2),
            currency: 'USD',
            quantity: 1
          }]
        },
        amount: {
          currency: 'USD',
          total: monto.toFixed(2)
        },
        description: `Compra de ${ticketIds.length} ticket${ticketIds.length > 1 ? 's' : ''}`
      }]
    };

    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        console.error('❌ Error PayPal al crear pago:');
        console.error('   Mensaje:', error.message);
        console.error('   Response:', error.response);
        console.error('   Detalles completos:', JSON.stringify(error, null, 2));
        
        // Verificar si es un error de autenticación
        if (error.response && error.response.name === 'AUTHENTICATION_FAILURE') {
          return res.status(401).json({ 
            error: 'Error de autenticación con PayPal. Verifica las credenciales en el archivo .env',
            details: 'Las credenciales PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET pueden estar incorrectas'
          });
        }
        
        return res.status(500).json({ 
          error: 'Error al crear pago PayPal',
          details: error.response?.details || error.message || 'Error desconocido',
          paypalError: error.response?.name || error.name
        });
      }

      // Guardar pago en BD
      const { DB_TYPE } = require('../config/database');
      let insertQuery = 'INSERT INTO pagos (usuario_id, monto, metodo_pago, estado, datos_pago) VALUES (?, ?, ?, ?, ?)';
      
      if (DB_TYPE === 'postgres') {
        insertQuery += ' RETURNING id';
      }
      
      const [pagoResult] = await pool.execute(
        insertQuery,
        [req.user.id, monto, 'paypal', 'pendiente', JSON.stringify({ paymentId: payment.id, ticketIds })]
      );

      // Obtener el ID del pago insertado
      let pagoId;
      if (DB_TYPE === 'postgres') {
        pagoId = pagoResult[0]?.id || pagoResult.insertId;
      } else {
        pagoId = pagoResult.insertId;
      }

      // Buscar approval URL
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');

      if (!approvalUrl || !approvalUrl.href) {
        return res.status(500).json({ 
          error: 'No se pudo obtener la URL de aprobación de PayPal',
          details: 'PayPal no devolvió la URL de aprobación'
        });
      }

      res.json({
        paymentId: payment.id,
        approvalUrl: approvalUrl.href,
        pagoId: pagoId
      });
    });
  } catch (error) {
    console.error('Error al crear pago PayPal:', error);
    res.status(500).json({ error: 'Error al crear pago PayPal' });
  }
});

// Endpoint para manejar retorno de PayPal (sin autenticación, PayPal redirige aquí)
router.get('/paypal/return', async (req, res) => {
  try {
    const { paymentId, PayerID, success } = req.query;

    if (success === 'false' || !paymentId || !PayerID) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:19006'}/pago/cancelado`);
    }

    // Redirigir a la app con los parámetros
    const redirectUrl = `sorteosapp://pago/paypal?paymentId=${paymentId}&PayerID=${PayerID}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error en retorno PayPal:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:19006'}/pago/error`);
  }
});

// Ejecutar pago PayPal
router.post('/paypal/execute', authenticateToken, async (req, res) => {
  try {
    const { paymentId, payerId, pagoId } = req.body;

    if (!paymentId || !payerId || !pagoId) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const execute_payment_json = {
      payer_id: payerId
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error('Error al ejecutar pago PayPal:', error);
        
        // Actualizar pago como fallido
        await pool.execute(
          'UPDATE pagos SET estado = "fallido" WHERE id = ?',
          [pagoId]
        );

        return res.status(500).json({ error: 'Error al ejecutar pago PayPal' });
      }

      if (payment.state === 'approved') {
        // Obtener datos del pago
        const [pagos] = await pool.execute('SELECT * FROM pagos WHERE id = ?', [pagoId]);
        const pago = pagos[0];
        const datosPago = JSON.parse(pago.datos_pago || '{}');
        const ticketIds = datosPago.ticketIds || [];

        // Actualizar tickets como vendidos
        for (const ticketId of ticketIds) {
          await pool.execute(
            'UPDATE tickets SET usuario_id = ?, estado = "vendido", fecha_compra = NOW() WHERE id = ? AND estado = "disponible"',
            [req.user.id, ticketId]
          );
        }

        // Actualizar pago como completado
        await pool.execute(
          'UPDATE pagos SET estado = "completado", transaccion_id = ? WHERE id = ?',
          [paymentId, pagoId]
        );

        res.json({
          success: true,
          message: 'Pago completado correctamente',
          payment
        });
      } else {
        res.status(400).json({ error: 'Pago no aprobado' });
      }
    });
  } catch (error) {
    console.error('Error al ejecutar pago PayPal:', error);
    res.status(500).json({ error: 'Error al ejecutar pago PayPal' });
  }
});

// Crear pago Transbank
router.post('/transbank/create', authenticateToken, async (req, res) => {
  try {
    const { ticketIds, monto } = req.body;

    if (!ticketIds || ticketIds.length === 0) {
      return res.status(400).json({ error: 'Se requieren tickets' });
    }

    // Guardar pago en BD primero
    const { DB_TYPE } = require('../config/database');
    let insertQuery = 'INSERT INTO pagos (usuario_id, monto, metodo_pago, estado, datos_pago) VALUES (?, ?, ?, ?, ?)';
    
    if (DB_TYPE === 'postgres') {
      insertQuery += ' RETURNING id';
    }
    
    const [pagoResult] = await pool.execute(
      insertQuery,
      [req.user.id, monto, 'transbank', 'pendiente', JSON.stringify({ ticketIds })]
    );

    // Obtener el ID del pago insertado
    let pagoId;
    if (DB_TYPE === 'postgres') {
      pagoId = pagoResult[0]?.id || pagoResult.insertId;
    } else {
      pagoId = pagoResult.insertId;
    }

    // Crear transacción en Transbank (Webpay Plus)
    const transbankConfig = {
      headers: {
        'Tbk-Api-Key-Id': process.env.TRANSBANK_API_KEY || '',
        'Tbk-Api-Key-Secret': process.env.TRANSBANK_SECRET_KEY || '',
        'Content-Type': 'application/json'
      }
    };

    const buyOrder = `TBK-${pagoId}-${Date.now()}`;
    const sessionId = `SESSION-${req.user.id}-${Date.now()}`;

    const transbankData = {
      buy_order: buyOrder,
      session_id: sessionId,
      amount: Math.round(monto),
      return_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/pagos/transbank/return`
    };

    const environment = process.env.TRANSBANK_ENVIRONMENT || 'integration';
    const transbankUrl = environment === 'production' 
      ? 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions'
      : 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions';

    try {
      const response = await axios.post(transbankUrl, transbankData, transbankConfig);

      // Actualizar pago con token de Transbank
      await pool.execute(
        'UPDATE pagos SET datos_pago = ?, transaccion_id = ? WHERE id = ?',
        [
          JSON.stringify({ ticketIds, buyOrder, sessionId, token: response.data.token }),
          buyOrder,
          pagoId
        ]
      );

      res.json({
        token: response.data.token,
        url: response.data.url,
        pagoId
      });
    } catch (transbankError) {
      // Si Transbank falla, marcar el pago como fallido
      await pool.execute(
        'UPDATE pagos SET estado = "fallido" WHERE id = ?',
        [pagoId]
      );
      throw transbankError;
    }
  } catch (error) {
    console.error('Error al crear pago Transbank:', error);
    res.status(500).json({ error: 'Error al crear pago Transbank' });
  }
});

// Confirmar pago Transbank
router.post('/transbank/confirm', authenticateToken, async (req, res) => {
  try {
    const { token_ws, pagoId } = req.body;

    // Obtener datos del pago
    const [pagos] = await pool.execute('SELECT * FROM pagos WHERE id = ?', [pagoId]);
    if (pagos.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const pago = pagos[0];
    const datosPago = JSON.parse(pago.datos_pago || '{}');

    // Confirmar transacción en Transbank
    const transbankConfig = {
      headers: {
        'Tbk-Api-Key-Id': process.env.TRANSBANK_API_KEY || '',
        'Tbk-Api-Key-Secret': process.env.TRANSBANK_SECRET_KEY || '',
        'Content-Type': 'application/json'
      }
    };

    const environment = process.env.TRANSBANK_ENVIRONMENT || 'integration';
    const transbankUrl = environment === 'production'
      ? `https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`
      : `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`;

    try {
      const response = await axios.put(transbankUrl, {}, transbankConfig);

      if (response.data.status === 'AUTHORIZED') {
        const ticketIds = datosPago.ticketIds || [];

        // Actualizar tickets como vendidos
        for (const ticketId of ticketIds) {
          await pool.execute(
            'UPDATE tickets SET usuario_id = ?, estado = "vendido", fecha_compra = NOW() WHERE id = ? AND estado = "disponible"',
            [req.user.id, ticketId]
          );
        }

        // Actualizar pago como completado
        await pool.execute(
          'UPDATE pagos SET estado = "completado", transaccion_id = ? WHERE id = ?',
          [token_ws, pagoId]
        );

        res.json({
          success: true,
          message: 'Pago completado correctamente',
          transaction: response.data
        });
      } else {
        await pool.execute(
          'UPDATE pagos SET estado = "fallido" WHERE id = ?',
          [pagoId]
        );

        res.status(400).json({ error: 'Pago no autorizado' });
      }
    } catch (transbankError) {
      await pool.execute(
        'UPDATE pagos SET estado = "fallido" WHERE id = ?',
        [pagoId]
      );
      throw transbankError;
    }
  } catch (error) {
    console.error('Error al confirmar pago Transbank:', error);
    res.status(500).json({ error: 'Error al confirmar pago Transbank' });
  }
});

module.exports = router;
