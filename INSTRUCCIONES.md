# 📱 Instrucciones de Configuración - Sorteos App

## ⚡ Configuración Rápida para Expo Go

### Paso 1: Configurar Backend

1. **Instalar dependencias del backend:**
```bash
cd backend
npm install
```

2. **Configurar base de datos MySQL:**
   - Asegúrate de que MySQL esté corriendo
   - Crea la base de datos:
   ```sql
   CREATE DATABASE sorteo;
   ```

3. **Configurar variables de entorno:**
   - Copia `backend/.env.example` a `backend/.env`
   - Edita `backend/.env` con tus credenciales:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=sorteo
   JWT_SECRET=tu_secret_key_muy_segura
   PORT=3001
   ```

4. **Iniciar el servidor backend:**
```bash
cd backend
npm run dev
```

El servidor estará en `http://localhost:3001`

### Paso 2: Configurar Frontend

1. **Instalar dependencias:**
```bash
# En la raíz del proyecto
npm install
```

2. **IMPORTANTE: Configurar URL de la API**

   Edita el archivo `services/api.ts` y cambia la URL según tu caso:

   **Para emulador Android:**
   ```typescript
   const API_URL = 'http://10.0.2.2:3001/api';
   ```

   **Para emulador iOS:**
   ```typescript
   const API_URL = 'http://localhost:3001/api';
   ```

   **Para dispositivo físico (más común con Expo Go):**
   ```typescript
   const API_URL = 'http://TU_IP_LOCAL:3001/api';
   ```
   
   Para encontrar tu IP local:
   - Windows: Abre CMD y ejecuta `ipconfig`, busca "IPv4 Address"
   - Mac/Linux: Ejecuta `ifconfig` o `ip addr`
   - Ejemplo: `http://192.168.1.100:3001/api`

3. **Iniciar Expo:**
```bash
npm start
```

### Paso 3: Probar en Expo Go

1. **Instala Expo Go** en tu dispositivo móvil:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Conecta tu dispositivo:**
   - Asegúrate de que tu teléfono y computadora estén en la **misma red WiFi**
   - Escanea el código QR que aparece en la terminal
   - La app se cargará automáticamente

## 🔧 Solución de Problemas Comunes

### Error: "Network request failed" o "Cannot connect to server"

**Solución:**
1. Verifica que el backend esté corriendo (`http://localhost:3001/api/health`)
2. Verifica que la IP en `services/api.ts` sea correcta
3. Asegúrate de que ambos dispositivos estén en la misma red WiFi
4. En Windows, puede ser necesario desactivar el firewall temporalmente
5. Prueba acceder a `http://TU_IP:3001/api/health` desde el navegador de tu teléfono

### Error: "Database connection failed"

**Solución:**
1. Verifica que MySQL esté corriendo
2. Verifica las credenciales en `backend/.env`
3. Asegúrate de que la base de datos `sorteo` exista

### La app no carga en Expo Go

**Solución:**
1. Cierra y vuelve a abrir Expo Go
2. Limpia la caché: `npm start -- --clear`
3. Reinicia el servidor de Expo

### Error al comprar tickets

**Solución:**
1. Verifica que las credenciales de PayPal/Transbank estén configuradas en `backend/.env`
2. Para pruebas, usa el modo sandbox
3. Verifica que el backend esté accesible desde tu dispositivo

## 📝 Notas Importantes

- **Para desarrollo:** Usa el modo sandbox de PayPal y Transbank
- **Para producción:** Cambia a credenciales reales y modo producción
- **Base de datos:** Se crea automáticamente al iniciar el servidor por primera vez
- **Tokens:** Se guardan automáticamente en AsyncStorage

## 🎯 Próximos Pasos

1. Configura tus credenciales de PayPal y Transbank en `backend/.env`
2. Crea tu primer sorteo desde la app
3. Genera tickets para el sorteo
4. Prueba la compra de tickets
5. Realiza un sorteo de prueba

## 📞 Soporte

Si encuentras problemas, verifica:
- Logs del backend en la terminal
- Logs de Expo en la terminal
- Consola de Expo Go (sacude el dispositivo y selecciona "Debug Remote JS")

