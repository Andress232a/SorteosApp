# 🚀 Guía de Configuración Completa

## Requisitos del Sistema

- Node.js 16+ instalado
- MySQL 5.7+ o MariaDB instalado y corriendo
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Expo Go app en tu dispositivo móvil

## Configuración Paso a Paso

### 1. Backend Setup

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=sorteo
# JWT_SECRET=genera_un_secret_aleatorio_aqui
# PORT=3001

# Crear base de datos en MySQL
mysql -u root -p
CREATE DATABASE sorteo;
exit;

# Iniciar servidor
npm run dev
```

### 2. Frontend Setup

```bash
# En la raíz del proyecto
npm install

# IMPORTANTE: Configurar la URL de la API
# Edita services/api.ts y cambia API_URL según tu caso:
# - Emulador: http://localhost:3001/api
# - Dispositivo físico: http://TU_IP:3001/api

# Iniciar Expo
npm start
```

### 3. Configurar IP para Expo Go

**Encontrar tu IP local:**

**Windows:**
```cmd
ipconfig
# Busca "IPv4 Address" (ej: 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# Busca "inet" en la interfaz WiFi (ej: 192.168.1.100)
```

**Actualizar services/api.ts:**
```typescript
const API_URL = 'http://192.168.1.100:3001/api'; // Tu IP aquí
```

### 4. Probar la Aplicación

1. Abre Expo Go en tu dispositivo móvil
2. Asegúrate de estar en la misma red WiFi que tu computadora
3. Escanea el código QR que aparece en la terminal
4. La app debería cargar automáticamente

## Verificación

### Verificar Backend

Abre en tu navegador: `http://localhost:3001/api/health`

Deberías ver:
```json
{
  "status": "OK",
  "message": "Servidor funcionando correctamente"
}
```

### Verificar Base de Datos

```sql
USE sorteo;
SHOW TABLES;
-- Deberías ver: usuarios, sorteos, productos, tickets, pagos, ganadores
```

## Configuración de Pagos (Opcional para Pruebas)

### PayPal Sandbox

1. Ve a https://developer.paypal.com/
2. Crea una cuenta de desarrollador
3. Crea una aplicación
4. Obtén Client ID y Secret
5. Agrega al `.env`:
   ```
   PAYPAL_CLIENT_ID=tu_client_id
   PAYPAL_CLIENT_SECRET=tu_secret
   PAYPAL_MODE=sandbox
   ```

### Transbank Integration

1. Ve a https://www.transbank.cl/developers
2. Regístrate y obtén credenciales
3. Agrega al `.env`:
   ```
   TRANSBANK_API_KEY=tu_api_key
   TRANSBANK_SECRET_KEY=tu_secret_key
   TRANSBANK_ENVIRONMENT=integration
   ```

## Estructura de Archivos Importantes

```
SorteosApp/
├── backend/
│   ├── .env                    # ⚠️ Configura tus credenciales aquí
│   ├── server.js              # Servidor principal
│   └── routes/                # Rutas de la API
├── services/
│   └── api.ts                 # ⚠️ Configura la URL aquí
└── app/                       # Pantallas de la app
```

## Comandos Útiles

```bash
# Backend
cd backend
npm run dev          # Iniciar en modo desarrollo
npm start            # Iniciar en modo producción

# Frontend
npm start            # Iniciar Expo
npm start -- --clear # Limpiar caché y reiniciar
```

## Solución de Problemas

### "Cannot connect to server"
- Verifica que el backend esté corriendo
- Verifica la IP en `services/api.ts`
- Asegúrate de estar en la misma red WiFi
- Prueba acceder a `http://TU_IP:3001/api/health` desde el navegador del teléfono

### "Database connection failed"
- Verifica que MySQL esté corriendo
- Verifica credenciales en `backend/.env`
- Verifica que la base de datos `sorteo` exista

### La app no carga
- Cierra y vuelve a abrir Expo Go
- Ejecuta `npm start -- --clear`
- Reinicia el servidor backend

## Próximos Pasos

1. ✅ Backend corriendo
2. ✅ Base de datos configurada
3. ✅ Frontend configurado con IP correcta
4. ✅ App cargando en Expo Go
5. 🎉 ¡Listo para usar!

## Notas Finales

- La base de datos se crea automáticamente al iniciar el servidor
- Los tokens de autenticación se guardan automáticamente
- Para producción, cambia las credenciales de sandbox por las reales
- La app está optimizada para funcionar perfectamente con Expo Go

