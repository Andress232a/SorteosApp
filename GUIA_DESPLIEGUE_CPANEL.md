# Guía Completa: Desplegar SorteosApp en Hosting cPanel

## 📋 Información del Hosting
- **Dominio:** premioclick.cl
- **IP:** 152.53.54.168
- **Usuario cPanel:** premioclick
- **Password:** Ernesto2026++
- **URL cPanel:** https://premioclick.cl/cpanel

---

## 🎯 PASO 1: Acceder a cPanel

1. Ve a: **https://premioclick.cl/cpanel**
2. Ingresa con:
   - **Usuario:** `premioclick`
   - **Contraseña:** `Ernesto2026++`

---

## 🗄️ PASO 2: Crear Base de Datos MySQL

1. En cPanel, busca la sección **"Bases de datos"** o **"MySQL Databases"**
2. Haz clic en **"Crear nueva base de datos"** o **"Create New Database"**
3. Nombre sugerido: `premioclick_db` (o el que prefieras)
4. Haz clic en **"Crear base de datos"**

### Crear Usuario de Base de Datos

1. En la misma sección, baja a **"Usuarios de MySQL"** o **"MySQL Users"**
2. Crea un nuevo usuario:
   - **Nombre de usuario:** `premioclick_user` (o el que prefieras)
   - **Contraseña:** Genera una contraseña segura (guárdala, la necesitarás)
3. Haz clic en **"Crear usuario"**

### Asignar Usuario a Base de Datos

1. En **"Agregar usuario a base de datos"** o **"Add User To Database"**
2. Selecciona el usuario que acabas de crear
3. Selecciona la base de datos que creaste
4. Haz clic en **"Agregar"**
5. Marca **"ALL PRIVILEGES"** (todos los privilegios)
6. Haz clic en **"Hacer cambios"**

### Anotar Información de Conexión

Anota esta información (la necesitarás después):
- **Host de MySQL:** Generalmente `localhost` o `127.0.0.1`
- **Nombre de BD:** `premioclick_db` (o el que hayas creado)
- **Usuario:** `premioclick_user` (o el que hayas creado)
- **Contraseña:** (la que generaste)

---

## 📦 PASO 3: Importar Base de Datos

### Opción A: Si tienes datos en Supabase (PostgreSQL)

1. En cPanel, busca **"phpMyAdmin"** en la sección de bases de datos
2. Haz clic en **"phpMyAdmin"**
3. Selecciona tu base de datos en el panel izquierdo
4. Ve a la pestaña **"Importar"** o **"Import"**
5. Necesitarás exportar primero desde Supabase y convertir a MySQL

### Opción B: Crear Base de Datos desde Cero

1. Abre **phpMyAdmin** en cPanel
2. Selecciona tu base de datos
3. Ve a la pestaña **"SQL"**
4. Copia y pega el contenido del archivo `backend/supabase-schema.sql`
5. **IMPORTANTE:** Necesitarás adaptar el SQL de PostgreSQL a MySQL (ver más abajo)

### Script SQL para MySQL

Ejecuta este script en phpMyAdmin (pestaña SQL):

```sql
-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla sorteos
CREATE TABLE IF NOT EXISTS sorteos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_sorteo TIMESTAMP NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'cancelado')),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  imagenes TEXT,
  imagen_portada TEXT,
  link VARCHAR(500),
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagenes TEXT,
  posicion_premio INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
);

-- Tabla tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  usuario_id INT,
  numero_ticket VARCHAR(50) UNIQUE NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido', 'ganador')),
  fecha_compra TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_tickets_sorteo (sorteo_id),
  INDEX idx_tickets_numero (numero_ticket),
  INDEX idx_tickets_usuario (usuario_id)
);

-- Tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT,
  usuario_id INT,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('paypal', 'transbank')),
  transaccion_id VARCHAR(255),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')),
  datos_pago TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla ganadores
CREATE TABLE IF NOT EXISTS ganadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  ticket_id INT NOT NULL,
  producto_id INT NOT NULL,
  posicion_premio INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Tabla promociones
CREATE TABLE IF NOT EXISTS promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sorteo_id INT NOT NULL,
  cantidad_tickets INT NOT NULL,
  precio_total DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
);

-- Crear usuario admin por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Admin', 'admin@premioclick.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin')
ON DUPLICATE KEY UPDATE nombre=nombre;
```

---

## 📁 PASO 4: Subir Archivos del Backend

### 4.1 Preparar Archivos

1. En tu computadora, crea una carpeta temporal llamada `backend_upload`
2. Copia TODOS los archivos de la carpeta `backend` EXCEPTO:
   - `node_modules/` (no copiar)
   - `.env` (lo crearemos después)
   - Cualquier archivo `.log`

### 4.2 Subir vía File Manager

1. En cPanel, busca **"Administrador de archivos"** o **"File Manager"**
2. Navega a la carpeta `public_html` (o la carpeta raíz de tu dominio)
3. Crea una carpeta llamada `api` o `backend`
4. Sube todos los archivos del backend a esa carpeta

### 4.3 O Subir vía FTP

1. En cPanel, busca **"Información de FTP"** o **"FTP Accounts"**
2. Anota:
   - **Servidor FTP:** `premioclick.cl` o `152.53.54.168`
   - **Usuario:** `premioclick`
   - **Puerto:** `21`
3. Usa un cliente FTP (FileZilla, WinSCP, etc.)
4. Conéctate y sube los archivos a `public_html/api/` o `public_html/backend/`

---

## 🌐 PASO 5: Subir Archivos de la Web

1. En el **File Manager** de cPanel
2. Navega a `public_html`
3. Sube TODOS los archivos de la carpeta `web` directamente a `public_html`
   - `index.html`
   - `script.js`
   - `styles.css`
   - `logo.png`
   - `detalle-sorteo.html`
   - `detalle-sorteo.js`
   - `escoger-ganadores.html`
   - `escoger-ganadores.js`

---

## ⚙️ PASO 6: Configurar Node.js en cPanel

### Verificar si tu hosting soporta Node.js

1. En cPanel, busca **"Node.js"** o **"Setup Node.js App"**
2. Si NO aparece esta opción, tu hosting NO soporta Node.js directamente
3. En ese caso, necesitarás usar una solución alternativa (ver PASO 6B)

### Opción A: Si SÍ soporta Node.js

1. Haz clic en **"Create Application"** o **"Crear aplicación"**
2. Configura:
   - **Node.js Version:** Selecciona la más reciente (18.x o 20.x)
   - **Application Mode:** `Production`
   - **Application Root:** `public_html/api` (o donde subiste el backend)
   - **Application URL:** `/api` o `/backend`
   - **Application Startup File:** `server.js`
3. Haz clic en **"Create"**

### Configurar Variables de Entorno en Node.js App

1. En la aplicación Node.js que creaste, busca **"Environment Variables"**
2. Agrega estas variables:

```
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=premioclick_user
DB_PASSWORD=tu_password_de_mysql
DB_NAME=premioclick_db
DB_SSL=false

JWT_SECRET=premioclick_jwt_secret_2025_super_seguro_cambiar_en_produccion
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=sandbox

PORT=3001
HOST=0.0.0.0
API_URL=https://premioclick.cl/api
```

3. Haz clic en **"Save"**

### Instalar Dependencias

1. En la aplicación Node.js, busca **"NPM Install"** o **"Run NPM Install"**
2. Haz clic para instalar todas las dependencias
3. Espera a que termine

### Iniciar la Aplicación

1. En la aplicación Node.js, busca **"Restart App"** o **"Iniciar aplicación"**
2. Haz clic para iniciar

### Opción B: Si NO soporta Node.js (Solución Alternativa)

Si tu hosting NO soporta Node.js, necesitarás:

1. **Usar un servicio externo para el backend** (Railway, Render, etc.)
2. O **configurar un proxy reverso** desde el hosting
3. O **migrar el backend a PHP** (requiere reescribir código)

**Recomendación:** Si no soporta Node.js, mejor mantener el backend en Vercel/Railway y solo cambiar la URL en el frontend.

---

## 🔧 PASO 7: Configurar .htaccess para Rutas

1. En el **File Manager**, navega a `public_html`
2. Crea o edita el archivo `.htaccess`
3. Agrega este contenido:

```apache
# Habilitar rewrite engine
RewriteEngine On

# Redirigir todas las peticiones /api/* al backend Node.js
# (Si Node.js está configurado en /api)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# Si el backend está en otra ubicación, ajusta la URL

# Permitir CORS (si es necesario)
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

---

## 🔗 PASO 8: Actualizar URLs en el Frontend

1. Edita el archivo `public_html/script.js`
2. Busca la línea que define `API_URL`
3. Cámbiala a:

```javascript
const API_URL = 'https://premioclick.cl/api';
```

4. Haz lo mismo en:
   - `public_html/detalle-sorteo.js`
   - `public_html/escoger-ganadores.js`

---

## ✅ PASO 9: Verificar que Todo Funciona

1. Abre en el navegador: **https://premioclick.cl**
2. Deberías ver la página principal
3. Abre: **https://premioclick.cl/api/health**
4. Deberías ver: `{"status":"OK","message":"Servidor funcionando correctamente"}`

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
- **Solución:** Asegúrate de haber ejecutado `npm install` en el servidor

### Error: "Port already in use"
- **Solución:** Cambia el puerto en las variables de entorno a otro (ej: 3002)

### Error: "Database connection failed"
- **Solución:** Verifica que las credenciales de MySQL sean correctas

### Error: "404 Not Found" en /api
- **Solución:** Verifica la configuración de Node.js App y el .htaccess

---

## 📝 Notas Importantes

1. **Backup:** Siempre haz backup de la base de datos antes de hacer cambios
2. **SSL:** Asegúrate de tener SSL habilitado (Let's Encrypt en cPanel)
3. **Firewall:** Verifica que el puerto de Node.js esté abierto
4. **Logs:** Revisa los logs de Node.js en cPanel para ver errores

---

## 🆘 Si Necesitas Ayuda

Si algo no funciona:
1. Revisa los logs de Node.js en cPanel
2. Revisa los logs del servidor web
3. Verifica que todas las variables de entorno estén correctas
4. Asegúrate de que la base de datos esté creada y accesible
