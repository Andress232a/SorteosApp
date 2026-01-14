# 🔐 Crear Usuario Administrador

## ✅ Método Recomendado (Más Fácil)

### Ejecuta este comando en la terminal:

```bash
cd backend
npm run create-admin
```

Esto creará automáticamente el usuario admin con:
- **Email:** admin@gmail.com
- **Contraseña:** 123456

## 📋 Qué hace el script:

1. Se conecta a la base de datos
2. Agrega la columna `rol` si no existe
3. Genera el hash correcto de la contraseña "123456"
4. Crea o actualiza el usuario administrador
5. Muestra la confirmación

## ✅ Verificación

Después de ejecutar el script, deberías ver:
```
✅ Usuario administrador creado/actualizado correctamente
✅ ¡Listo! Puedes iniciar sesión con:
   Email: admin@gmail.com
   Contraseña: 123456
```

## 🔄 Si ya ejecutaste el SQL manualmente

Si ya intentaste crear el admin con SQL y no funciona, ejecuta el script de Node.js que corregirá el hash de la contraseña:

```bash
cd backend
npm run create-admin
```

Esto actualizará el usuario existente con el hash correcto.

## 🚀 Después de crear el admin

1. Reinicia el backend si está corriendo
2. Inicia sesión en la app con:
   - Email: admin@gmail.com
   - Contraseña: 123456

