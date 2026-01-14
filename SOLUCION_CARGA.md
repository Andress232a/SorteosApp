# 🔧 Solución: "Opening project..." se queda cargando

## Solución Rápida (prueba en este orden):

### 1. Cerrar y reiniciar todo
```bash
# En la terminal donde corre Expo, presiona Ctrl+C para detenerlo
# Luego:
npm start -- --clear
```

### 2. Cerrar Expo Go completamente
- En iOS: Desliza hacia arriba y cierra Expo Go
- En Android: Presiona el botón de tareas y cierra Expo Go

### 3. Reiniciar con modo Tunnel
```bash
npm run start:tunnel
```
Espera a que aparezca el código QR y escanea de nuevo.

### 4. Verificar que el servidor esté corriendo
En la terminal deberías ver algo como:
```
Metro waiting on exp://...
```

Si no ves esto, el servidor no está corriendo correctamente.

### 5. Verificar conexión a internet
- Asegúrate de tener buena conexión WiFi
- Prueba reiniciar el router
- Desactiva VPN si tienes una activa

### 6. Verificar logs en la terminal
Mira la terminal donde corre `npm start` - si hay errores, aparecerán ahí.

### 7. Probar con modo LAN
```bash
npm run start:lan
```

### 8. Si nada funciona - Reinstalar dependencias
```bash
# Detén Expo (Ctrl+C)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm start -- --clear
```

## Verificación del Backend

Asegúrate de que el backend también esté corriendo:
```bash
cd backend
npm start
```

Deberías ver:
```
✅ Base de datos inicializada correctamente
🚀 Servidor corriendo en puerto 3001
```

## Tiempo de espera normal

- Primera carga: 2-5 minutos (descarga dependencias)
- Cargas siguientes: 30-60 segundos

Si pasa más de 5 minutos, hay un problema.

