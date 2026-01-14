# 🔧 Solución: "Could not connect to the server" en Expo Go

## Problema
Expo Go no puede conectarse al servidor de desarrollo de Expo (puerto 8082).

## Soluciones (prueba en este orden):

### 1. Verificar que Expo esté corriendo
```bash
# En la raíz del proyecto
npm start
```

Deberías ver un código QR y opciones como:
- Press `a` to open Android
- Press `i` to open iOS simulator
- Press `w` to open web

### 2. Usar modo Tunnel (más confiable)
```bash
npm start -- --tunnel
```

Esto usa los servidores de Expo y funciona mejor con dispositivos físicos.

### 3. Verificar conexión de red
- ✅ Asegúrate de que tu teléfono y computadora estén en la **misma red WiFi**
- ✅ Desactiva temporalmente el firewall de Windows
- ✅ Verifica que no estés usando una VPN

### 4. Limpiar caché y reiniciar
```bash
# Detén Expo (Ctrl+C) y luego:
npm start -- --clear
```

### 5. Usar la IP manualmente
Si nada funciona, puedes especificar la IP manualmente:

1. Encuentra tu IP local:
   ```cmd
   ipconfig
   ```
   Busca "IPv4 Address" (ej: 192.168.1.100)

2. Inicia Expo con la IP:
   ```bash
   set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
   npm start
   ```

3. O usa el modo LAN:
   ```bash
   npm start -- --lan
   ```

### 6. Verificar puertos
Asegúrate de que los puertos 8081, 8082, 19000, 19001 estén libres.

### 7. Alternativa: Usar Expo Dev Client
Si Expo Go sigue dando problemas, considera usar un build de desarrollo.

## Pasos recomendados ahora:

1. **Cierra Expo Go completamente** en tu teléfono
2. **Detén el servidor de Expo** (Ctrl+C en la terminal)
3. **Inicia de nuevo con tunnel:**
   ```bash
   npm start -- --tunnel
   ```
4. **Escanea el nuevo código QR** que aparece
5. **Espera a que cargue** (puede tardar un poco la primera vez)

## Si sigue sin funcionar:

Prueba con el emulador:
- Android: `npm start -- --android`
- iOS: `npm start -- --ios` (solo Mac)

