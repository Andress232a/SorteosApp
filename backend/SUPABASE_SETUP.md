# Configuración de Supabase para SorteosApp

## Pasos para configurar Supabase

### 1. Crear proyecto en Supabase
1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota las credenciales de conexión

### 2. Obtener credenciales de conexión
En el dashboard de Supabase:
- Ve a **Settings** > **Database**
- Busca la sección **Connection string** > **URI**
- O usa los valores individuales:
  - **Host**: `db.xxxxx.supabase.co`
  - **Port**: `5432`
  - **Database**: `postgres`
  - **User**: `postgres.xxxxx`
  - **Password**: (la que configuraste al crear el proyecto)

### 3. Crear las tablas en Supabase
Ve a **SQL Editor** en Supabase y ejecuta este script:

```sql
-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla sorteos
CREATE TABLE IF NOT EXISTS sorteos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_sorteo TIMESTAMP NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'cancelado')),
  created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  imagenes TEXT
);

-- Tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  sorteo_id INTEGER NOT NULL REFERENCES sorteos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url VARCHAR(500),
  posicion_premio INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla tickets
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  sorteo_id INTEGER NOT NULL REFERENCES sorteos(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  numero_ticket VARCHAR(50) UNIQUE NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido', 'ganador')),
  fecha_compra TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_sorteo ON tickets(sorteo_id);
CREATE INDEX IF NOT EXISTS idx_tickets_numero ON tickets(numero_ticket);

-- Tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE SET NULL,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('paypal', 'transbank')),
  transaccion_id VARCHAR(255),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')),
  datos_pago TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla ganadores
CREATE TABLE IF NOT EXISTS ganadores (
  id SERIAL PRIMARY KEY,
  sorteo_id INTEGER NOT NULL REFERENCES sorteos(id) ON DELETE CASCADE,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  posicion_premio INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sorteo_id, posicion_premio)
);

-- Tabla promociones (si existe)
CREATE TABLE IF NOT EXISTS promociones (
  id SERIAL PRIMARY KEY,
  sorteo_id INTEGER NOT NULL REFERENCES sorteos(id) ON DELETE CASCADE,
  cantidad_tickets INTEGER NOT NULL,
  precio_total DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para updated_at en usuarios
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sorteos_updated_at BEFORE UPDATE ON sorteos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Configurar variables de entorno
Crea o actualiza el archivo `backend/.env`:

```env
DB_TYPE=postgres
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres.xxxxx
DB_PASSWORD=tu_password_aqui
DB_NAME=postgres
DB_SSL=true

JWT_SECRET=tu_jwt_secret_super_seguro_aqui
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_MODE=sandbox

PORT=3001
HOST=0.0.0.0
API_URL=https://tu-servidor.com/api
```

### 5. Instalar dependencias
```bash
cd backend
npm install
```

### 6. Probar la conexión
```bash
npm start
```

Deberías ver: `✅ Conectado a PostgreSQL (Supabase)`

## Notas importantes

- **SSL**: Supabase requiere SSL, por eso `DB_SSL=true`
- **Migración de datos**: Si tienes datos en MySQL local, necesitarás exportarlos e importarlos a Supabase
- **Backup**: Supabase tiene backups automáticos, pero siempre es bueno tener uno manual


