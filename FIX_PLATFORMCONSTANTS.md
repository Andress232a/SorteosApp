# 🔧 Solución: Error PlatformConstants en SDK 54

## El Problema
Error: `'PlatformConstants' could not be found` - Esto indica incompatibilidad de versiones.

## Solución (Paso a Paso)

### 1. Eliminar node_modules y reinstalar con expo install
```bash
# Detén Expo (Ctrl+C)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

### 2. Instalar dependencias base
```bash
npm install
```

### 3. Usar expo install para versiones correctas
```bash
npx expo install --fix
```

Esto ajustará automáticamente todas las versiones a las compatibles con SDK 54.

### 4. Instalar dependencias específicas de Expo
```bash
npx expo install expo-router expo-status-bar expo-linking expo-web-browser expo-image-picker expo-linear-gradient @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens
```

### 5. Limpiar y reiniciar
```bash
npm start -- --clear
```

## Si el error persiste:

### Opción 1: Verificar versión de Expo Go
Asegúrate de tener la última versión de Expo Go instalada desde la App Store/Play Store.

### Opción 2: Usar SDK 52 (más estable)
Si SDK 54 sigue dando problemas, podemos bajar a SDK 52 que es más estable:

```bash
npx expo install expo@~52.0.0
npx expo install --fix
```

### Opción 3: Verificar babel.config.js
Asegúrate de que babel.config.js tenga:
```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

## Verificación

Después de ejecutar `npx expo install --fix`, deberías poder:
1. Iniciar Expo sin errores
2. Cargar la app en Expo Go sin el error de PlatformConstants

