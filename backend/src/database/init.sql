-- Inicialización de la base de datos para Guardería
-- Este archivo se ejecuta automáticamente cuando se crea la base de datos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar zona horaria
SET timezone = 'America/Mexico_City';

-- Configuraciones de la base de datos
ALTER DATABASE guarderia_db SET timezone = 'America/Mexico_City';

-- Comentario sobre el propósito de la base de datos
COMMENT ON DATABASE guarderia_db IS 'Base de datos para sistema de gestión de guardería infantil';