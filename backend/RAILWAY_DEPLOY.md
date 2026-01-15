# Guía de Despliegue en Railway

## Pasos para desplegar el backend en Railway

### 1. Crear cuenta en Railway
1. Ve a https://railway.app
2. Haz clic en "Start a New Project"
3. Inicia sesión con GitHub (recomendado)

### 2. Conectar el repositorio
1. En Railway, selecciona "Deploy from GitHub repo"
2. Autoriza Railway para acceder a tus repositorios
3. Selecciona el repositorio `SorteosApp`
4. Railway detectará automáticamente que es un proyecto Node.js

### 3. Configurar el proyecto
1. Railway creará un servicio automáticamente
2. Haz clic en el servicio para abrir la configuración

### 4. Configurar variables de entorno
En la pestaña "Variables" de Railway, agrega todas estas variables:

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

### 5. Configurar el directorio raíz
1. En "Settings" del servicio
2. Busca "Root Directory"
3. Establece: `backend`
4. Esto le dice a Railway que el código está en la carpeta `backend`

### 6. Obtener la URL de producción
1. En la pestaña "Settings" del servicio
2. Busca "Domains" o "Generate Domain"
3. Railway generará una URL automática como: `https://tu-proyecto.up.railway.app`
4. Copia esta URL

### 7. Actualizar API_URL
Una vez tengas la URL de Railway, actualiza:
- En Railway: Agrega la variable `API_URL=https://tu-proyecto.up.railway.app/api`
- En `backend/.env` local: Actualiza `API_URL` con la misma URL

### 8. Verificar el despliegue
1. Railway desplegará automáticamente cuando hagas push a GitHub
2. Ve a la pestaña "Deployments" para ver el estado
3. Cuando esté listo, visita: `https://tu-proyecto.up.railway.app/api/health`
4. Deberías ver: `{"status":"OK","message":"Servidor funcionando correctamente"}`

## Notas importantes

- Railway detecta automáticamente Node.js y ejecuta `npm install` y `npm start`
- El archivo `Procfile` le dice a Railway cómo iniciar el servidor
- Las variables de entorno en Railway sobrescriben las del archivo `.env`
- Railway proporciona HTTPS automáticamente
- El backend estará disponible 24/7

## Troubleshooting

Si hay errores:
1. Revisa los logs en Railway (pestaña "Deployments" > "View Logs")
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el "Root Directory" esté configurado como `backend`

