# 🔍 Verificar Usuario Admin

## Problema: Admin ve pantalla de usuario normal

## Solución 1: Verificar en la base de datos

Ejecuta esto en MySQL:

```sql
USE sorteo;

-- Ver todos los usuarios y sus roles
SELECT id, nombre, email, rol FROM usuarios;

-- Verificar que el admin tenga rol 'admin'
SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@gmail.com';
```

Si el rol es NULL o 'usuario', ejecuta:

```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@gmail.com';
```

## Solución 2: Recrear el admin

Ejecuta en la terminal:

```bash
cd backend
npm run create-admin
```

Esto creará/actualizará el usuario admin con el rol correcto.

## Solución 3: Verificar en la app

Después de hacer login, revisa la consola (en Expo Go, sacude el dispositivo y selecciona "Debug Remote JS"). Deberías ver:

```
Usuario logueado: { id: X, nombre: '...', email: '...', rol: 'admin' }
```

Si el rol no es 'admin', el problema está en la base de datos.

## Solución 4: Cerrar sesión y volver a iniciar

1. Cierra sesión completamente
2. Reinicia la app
3. Inicia sesión de nuevo con admin@gmail.com / 123456

## Verificación rápida

En MySQL, ejecuta:
```sql
SELECT email, rol FROM usuarios WHERE email = 'admin@gmail.com';
```

Debería mostrar: `rol = 'admin'`

Si no, ejecuta:
```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@gmail.com';
```

