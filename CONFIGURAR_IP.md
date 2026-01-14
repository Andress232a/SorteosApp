# 🔧 Configurar IP para Conectar con el Backend

## El Problema
"Network error" al intentar registrarse o hacer login - esto significa que la app no puede conectarse al backend.

## Solución Rápida

### 1. Encuentra tu IP local

**Windows:**
```cmd
ipconfig
```
Busca "IPv4 Address" en la sección de tu adaptador WiFi/Ethernet.
Ejemplo: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
# o
ip addr
```
Busca "inet" en tu interfaz de red (en0, wlan0, etc.)

### 2. Edita `services/api.ts`

Abre el archivo `services/api.ts` y cambia esta línea:

```typescript
const LOCAL_IP = '192.168.1.100'; // ⚠️ CAMBIA ESTA IP POR LA TUYA
```

Pon tu IP real. Por ejemplo, si tu IP es `192.168.0.50`:
```typescript
const LOCAL_IP = '192.168.0.50';
```

### 3. Verifica que el backend esté corriendo

En otra terminal:
```bash
cd backend
npm start
```

Deberías ver:
```
✅ Base de datos inicializada correctamente
🚀 Servidor corriendo en puerto 3001
```

### 4. Verifica la conexión

Abre en el navegador de tu teléfono (mientras estás en la misma WiFi):
```
http://TU_IP:3001/api/health
```

Deberías ver:
```json
{"status":"OK","message":"Servidor funcionando correctamente"}
```

### 5. Reinicia Expo

```bash
# Detén Expo (Ctrl+C)
npm start -- --clear
```

### 6. Prueba de nuevo

Intenta registrarte de nuevo en la app.

## Verificaciones Importantes

✅ Backend corriendo en puerto 3001
✅ IP configurada correctamente en `services/api.ts`
✅ Teléfono y computadora en la misma red WiFi
✅ Firewall de Windows no bloquea el puerto 3001
✅ Puedes acceder a `http://TU_IP:3001/api/health` desde el navegador del teléfono

## Si sigue sin funcionar

1. Prueba desactivar temporalmente el firewall de Windows
2. Verifica que MySQL esté corriendo
3. Revisa los logs del backend para ver si llegan las peticiones

