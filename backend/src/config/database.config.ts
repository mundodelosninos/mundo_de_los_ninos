import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  // Usar DATABASE_URL si está disponible (Railway, Render, Heroku)
  // Si no, usar variables individuales (desarrollo local)
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'guarderia_user',
        password: process.env.DB_PASSWORD || 'guarderia_password',
        database: process.env.DB_NAME || 'guarderia_db',
      }),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,  // Temporarily disabled for migration
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// DataSource para migraciones
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});