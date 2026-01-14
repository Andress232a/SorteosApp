# Backend - Aplicación de Sorteos

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
- Copiar `.env.example` a `.env`
- Configurar las variables necesarias (base de datos, PayPal, Transbank)

3. Asegurarse de que MySQL esté corriendo y la base de datos `sorteo` exista

4. Iniciar el servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints principales

- `/api/auth` - Autenticación (registro, login)
- `/api/sorteos` - Gestión de sorteos
- `/api/tickets` - Gestión de tickets
- `/api/pagos` - Integración de pagos (PayPal, Transbank)
- `/api/tombola` - Realización de sorteos (tómbola digital)

