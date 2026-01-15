# Guía de Despliegue en Vercel

## Pasos para desplegar el backend en Vercel

### 1. Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Haz clic en "Sign Up"
3. Inicia sesión con GitHub (recomendado)

### 2. Importar proyecto
1. En el Dashboard de Vercel, haz clic en "Add New..." → "Project"
2. Conecta tu repositorio de GitHub:
   - Autoriza Vercel para acceder a tus repositorios
   - Selecciona el repositorio `Andress232a/SorteosApp`

### 3. Configurar el proyecto
1. **Framework Preset**: Deja "Other" o selecciona "Other"
2. **Root Directory**: `backend` (MUY IMPORTANTE - haz clic en "Edit" y cambia a `backend`)
3. **Build Command**: `npm install` (o déjalo vacío, Vercel lo detectará)
4. **Output Directory**: Déjalo vacío
5. **Install Command**: `npm install`

### 4. Configurar variables de entorno
Antes de hacer clic en "Deploy", despliega "Environment Variables" y agrega:

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
1. Haz clic en "Deploy"
2. Vercel comenzará a construir y desplegar
3. Esto tomará unos minutos

### 6. Obtener la URL de producción
1. Una vez desplegado, Vercel generará una URL automática
2. La URL será algo como: `https://sorteos-app-xxxxx.vercel.app`
3. Copia esta URL

### 7. Actualizar API_URL
1. En el proyecto de Vercel, ve a "Settings" → "Environment Variables"
2. Agrega: `API_URL=https://tu-proyecto.vercel.app/api`
3. Vercel redeployará automáticamente

### 8. Actualizar frontend
En `services/api.ts`, actualiza:
```typescript
const PRODUCTION_API_URL = 'https://tu-proyecto.vercel.app/api';
```

## Notas importantes

- **Root Directory**: Es CRUCIAL configurar `backend` como Root Directory
- **Variables de Entorno**: Todas deben estar configuradas en Vercel
- **HTTPS**: Vercel proporciona HTTPS automáticamente
- **Serverless**: Vercel funciona con funciones serverless, pero Express también funciona

## Verificar el despliegue

Una vez desplegado, visita:
- `https://tu-proyecto.vercel.app/api/health`
- Deberías ver: `{"status":"OK","message":"Servidor funcionando correctamente"}`

## Troubleshooting

Si hay errores:
1. Revisa los logs en Vercel (pestaña "Deployments" → selecciona el deployment → "Logs")
2. Verifica que "Root Directory" esté configurado como `backend`
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Verifica que el build se complete correctamente

