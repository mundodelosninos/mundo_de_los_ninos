FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache postgresql-client

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con cache mount para mejor rendimiento
RUN npm ci

# Copiar código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 4000

# Para desarrollo, usar start:dev que no requiere build
CMD ["npm", "run", "start:dev"]