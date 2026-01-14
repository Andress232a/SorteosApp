# 🔧 Solución: Conflicto de Dependencias

## El Problema
Conflicto entre versiones de React Navigation (v6 vs v7).

## Solución

### Opción 1: Usar --legacy-peer-deps (Recomendado)
```bash
npm install --legacy-peer-deps
```

Esto instalará las dependencias ignorando los conflictos de peer dependencies.

### Opción 2: Actualizar @react-navigation/stack también
Ya actualicé el package.json para usar @react-navigation/stack v7, ahora ejecuta:
```bash
npm install --legacy-peer-deps
```

### Opción 3: Si sigue fallando, reinstalar todo
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

## Después de instalar

```bash
npm start -- --clear
```

