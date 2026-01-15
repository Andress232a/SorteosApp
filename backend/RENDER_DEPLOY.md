# Guía de Despliegue en Render

## Pasos para desplegar el backend en Render

### 1. Crear cuenta en Render
1. Ve a https://render.com
2. Haz clic en "Get Started for Free"
3. Inicia sesión con GitHub (recomendado)

### 2. Crear nuevo servicio
1. En el Dashboard de Render, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub:
   - Autoriza Render para acceder a tus repositorios
   - Selecciona el repositorio `Andress232a/SorteosApp`

### 3. Configurar el servicio
1. **Name**: `sorteos-backend` (o el nombre que prefieras)
2. **Region**: Selecciona la región más cercana (ej: "Oregon (US West)")
3. **Branch**: `main`
4. **Root Directory**: `backend` (MUY IMPORTANTE)
5. **Runtime**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `node server.js`

### 4. Configurar variables de entorno
En la sección "Environment Variables", agrega todas estas variables:

```
DB_TYPE=postgres
DB_HOST=db.acbalohxkapyephaqefm.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=MAMATEAMO123.k
DB_NAME=postgres
DB_SSL=true
JWT_SECRET=premioclick_jwt_secret_2025_super_seguro_cambiar_en_produccion
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=sandbox
PORT=3001
HOST=0.0.0.0
```

### 5. Desplegar
1. Haz clic en "Create Web Service"
2. Render comenzará a construir y desplegar tu aplicación
3. Esto tomará unos minutos

### 6. Obtener la URL de producción
1. Una vez desplegado, Render generará una URL automática
2. La URL será algo como: `https://sorteos-backend.onrender.com`
3. Copia esta URL

### 7. Actualizar API_URL
1. En Render, ve a "Environment" en el servicio
2. Agrega la variable: `API_URL=https://sorteos-backend.onrender.com/api`
3. Render reiniciará automáticamente el servicio

### 8. Actualizar frontend
En `services/api.ts`, actualiza:
```typescript
const PRODUCTION_API_URL = 'https://sorteos-backend.onrender.com/api';
```

## Notas importantes

- **Plan Gratuito**: Render ofrece un plan gratuito, pero el servicio se "duerme" después de 15 minutos de inactividad. La primera petición después de dormir puede tardar ~30 segundos.
- **Root Directory**: Es CRUCIAL configurar `backend` como Root Directory, de lo contrario Render buscará `package.json` en la raíz.
- **Variables de Entorno**: Todas las variables deben estar configuradas en Render, no en el archivo `.env` (que no se sube a GitHub).
- **HTTPS**: Render proporciona HTTPS automáticamente.

## Troubleshooting

Si hay errores:
1. Revisa los logs en Render (pestaña "Logs")
2. Verifica que "Root Directory" esté configurado como `backend`
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Verifica que el build se complete correctamente

## Verificar el despliegue

Una vez desplegado, visita:
- `https://tu-servicio.onrender.com/api/health`
- Deberías ver: `{"status":"OK","message":"Servidor funcionando correctamente"}`

