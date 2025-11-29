import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  }

  @Get('db')
  async checkDatabase() {
    // Esta ruta puede ser extendida para verificar la conexión a la base de datos
    return {
      status: 'ok',
      message: 'Database connection endpoint',
    };
  }
}
