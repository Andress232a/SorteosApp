# ✅ Actualización a SDK 54 - Instrucciones

## Cambios realizados:
- ✅ Expo actualizado de SDK 50 a SDK 54
- ✅ React Native actualizado a 0.76.5
- ✅ React actualizado a 18.3.1
- ✅ Todas las dependencias de Expo actualizadas

## Pasos para aplicar:

### 1. Eliminar node_modules y package-lock.json
```bash
# En la raíz del proyecto
rm -rf node_modules
rm package-lock.json
```

En Windows PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

### 2. Instalar dependencias actualizadas
```bash
npm install
```

### 3. Limpiar caché de Expo
```bash
npm start -- --clear
```

### 4. Reiniciar Expo
```bash
npm start
```

O con tunnel (recomendado):
```bash
npm run start:tunnel
```

## Verificación:

Después de instalar, deberías poder:
1. Escanear el código QR con Expo Go
2. La app debería cargar sin el error de incompatibilidad de SDK

## Si hay errores:

Si encuentras errores de importación o dependencias:
```bash
# Reinstalar todo desde cero
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

## Nota importante:

- La primera vez que cargue puede tardar más (descarga de dependencias)
- Asegúrate de tener buena conexión a internet
- El backend sigue usando el puerto 3001

