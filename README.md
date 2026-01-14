# Sorteos App - Aplicación Completa de Sorteos

Aplicación completa para gestionar sorteos de productos con soporte para web, iOS y Android.

## 🚀 Características

- ✅ Creación de sorteos con múltiples productos
- ✅ Sistema de tickets (individual y promoción de 3)
- ✅ Tómbola digital para selección aleatoria de ganadores
- ✅ Integración con PayPal y Transbank
- ✅ Autenticación de usuarios
- ✅ Gestión de sorteos, tickets y pagos
- ✅ Interfaz moderna y responsive

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MySQL
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app en tu dispositivo móvil (para pruebas)

## 🔧 Instalación

### Backend

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
- Copia `.env.example` a `.env`
- Configura tus credenciales de MySQL, PayPal y Transbank

4. Asegúrate de que MySQL esté corriendo y crea la base de datos:
```sql
CREATE DATABASE sorteo;
```

5. Inicia el servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Frontend

1. En la raíz del proyecto, instala las dependencias:
```bash
npm install
```

2. Configura la URL de la API en `services/api.ts`:
- Para emulador: `http://localhost:3001/api`
- Para dispositivo físico: `http://TU_IP_LOCAL:3001/api` (ej: `http://192.168.1.100:3001/api`)

3. Inicia Expo:
```bash
npm start
```

4. Escanea el código QR con Expo Go en tu dispositivo móvil

## 📱 Uso con Expo Go

1. Instala Expo Go en tu dispositivo móvil (iOS o Android)
2. Asegúrate de que tu dispositivo y computadora estén en la misma red WiFi
3. Inicia el servidor backend
4. Inicia Expo con `npm start`
5. Escanea el QR code con Expo Go
6. La app se cargará en tu dispositivo

## 🔑 Configuración de Pagos

### PayPal
1. Crea una cuenta en [PayPal Developer](https://developer.paypal.com/)
2. Crea una aplicación y obtén Client ID y Secret
3. Configúralos en el archivo `.env` del backend

### Transbank
1. Regístrate en [Transbank Developers](https://www.transbank.cl/developers)
2. Obtén tus credenciales de API
3. Configúralas en el archivo `.env` del backend

## 📁 Estructura del Proyecto

```
SorteosApp/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sorteos.js
│   │   ├── tickets.js
│   │   ├── pagos.js
│   │   └── tombola.js
│   ├── server.js
│   └── package.json
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── sorteos.tsx
│   │   ├── mis-tickets.tsx
│   │   └── profile.tsx
│   ├── sorteo/
│   │   └── [id].tsx
│   ├── comprar-ticket/
│   │   └── [id].tsx
│   └── resultados/
│       └── [id].tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   └── api.ts
└── package.json
```

## 🎯 Funcionalidades Principales

### Para Usuarios
- Registro e inicio de sesión
- Ver sorteos disponibles
- Comprar tickets (individual o promoción)
- Ver mis tickets
- Ver resultados de sorteos finalizados

### Para Administradores
- Crear sorteos con productos
- Generar tickets
- Realizar sorteos (tómbola digital)
- Ver estadísticas

## 🐛 Solución de Problemas

### Error de conexión en Expo Go
- Verifica que el backend esté corriendo
- Asegúrate de usar la IP correcta en `services/api.ts`
- Verifica que ambos dispositivos estén en la misma red WiFi
- En Android, puede ser necesario usar `http://10.0.2.2:3001` para el emulador

### Error de base de datos
- Verifica que MySQL esté corriendo
- Confirma que la base de datos `sorteo` existe
- Revisa las credenciales en `.env`

## 📝 Notas

- Esta aplicación está configurada para funcionar perfectamente con Expo Go
- Los pagos en modo sandbox son para pruebas
- Para producción, configura las credenciales reales de PayPal y Transbank

## 📄 Licencia

Este proyecto es privado y está desarrollado para uso específico.

