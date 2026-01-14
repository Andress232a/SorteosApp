const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sorteo'
    });

    console.log('✅ Conectado a la base de datos');

    // Agregar columna rol si no existe
    try {
      await connection.query(`
        ALTER TABLE usuarios 
        ADD COLUMN rol ENUM('usuario', 'admin') DEFAULT 'usuario'
      `);
      console.log('✅ Columna rol agregada o ya existe');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  Columna rol ya existe');
      } else {
        throw error;
      }
    }

    // Generar hash de la contraseña
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Hash de contraseña generado');

    // Crear o actualizar usuario admin
    const [result] = await connection.query(`
      INSERT INTO usuarios (nombre, email, password, rol) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        nombre = VALUES(nombre),
        password = VALUES(password),
        rol = VALUES(rol)
    `, ['Administrador', 'admin@gmail.com', hashedPassword, 'admin']);

    if (result.affectedRows > 0) {
      console.log('✅ Usuario administrador creado/actualizado correctamente');
    }

    // Verificar que se creó
    const [users] = await connection.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = ?',
      ['admin@gmail.com']
    );

    if (users.length > 0) {
      console.log('\n📋 Usuario creado:');
      console.log('   Email:', users[0].email);
      console.log('   Nombre:', users[0].nombre);
      console.log('   Rol:', users[0].rol);
      console.log('\n✅ ¡Listo! Puedes iniciar sesión con:');
      console.log('   Email: admin@gmail.com');
      console.log('   Contraseña: 123456');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();

