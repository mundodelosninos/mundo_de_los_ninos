import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  console.log('🔄 Starting bootstrap...');
  const app = await NestFactory.create(AppModule);
  console.log('✅ NestFactory.create completed');

  // Middleware de seguridad
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Centro Lúdico API')
    .setDescription('API completa para sistema de gestión de centro lúdico')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 Documentación en http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Error during bootstrap:', error);
  process.exit(1);
});

