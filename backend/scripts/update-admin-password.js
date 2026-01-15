const bcrypt = require('bcryptjs');

// Generar hash de la contraseña
const password = 'admin123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error al generar hash:', err);
    return;
  }
  
  console.log('\n✅ Hash generado para la contraseña "admin123":');
  console.log(hash);
  console.log('\n📋 Ejecuta este SQL en Supabase (SQL Editor):');
  console.log('---');
  console.log(`UPDATE usuarios`);
  console.log(`SET password = '${hash}'`);
  console.log(`WHERE email = 'admin@premioclick.com';`);
  console.log('---');
  console.log('\n✅ Después de ejecutar el SQL, podrás iniciar sesión con:');
  console.log('   Email: admin@premioclick.com');
  console.log('   Contraseña: admin123');
});

