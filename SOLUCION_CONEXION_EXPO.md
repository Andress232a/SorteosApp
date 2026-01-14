# 🔧 Solución: "Could not connect to the server" en Expo Go

## El Problema
Expo está usando `127.0.0.1:8081` (localhost) que no funciona en dispositivos físicos.

## Solución Rápida (3 pasos)

### 1. Detén Expo actual
Presiona `Ctrl+C` en la terminal donde está corriendo Expo.

### 2. Inicia Expo con modo Tunnel (RECOMENDADO)
```bash
npm start -- --tunnel
```

O usa el script ya configurado:
```bash
npm run start:tunnel
```

Esto usa los servidores de Expo y funciona mejor con dispositivos físicos.

### 3. Escanea el nuevo QR
- El QR que aparece ahora será diferente
- Escanéalo de nuevo con Expo Go
- Espera a que cargue (puede tardar un poco la primera vez)

## Alternativa: Modo LAN

Si el tunnel no funciona, prueba con LAN:

```bash
npm start -- --lan
```

O:
```bash
npm run start:lan
```

Esto usará tu IP local automáticamente.

## Verificaciones

✅ **Backend corriendo**: Asegúrate de que el backend esté corriendo en otra terminal:
```bash
cd backend
npm start
```

✅ **Misma red WiFi**: Tu teléfono y computadora deben estar en la misma red WiFi

✅ **Firewall**: Si sigue sin funcionar, desactiva temporalmente el firewall de Windows

## Si Nada Funciona

Prueba con el emulador:
```bash
npm start -- --android
```

Esto abrirá la app en un emulador Android (si lo tienes instalado).

