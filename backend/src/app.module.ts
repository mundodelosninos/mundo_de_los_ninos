import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Módulos de la aplicación
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { GroupsModule } from './modules/groups/groups.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ChatModule } from './modules/chat/chat.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { FilesModule } from './modules/files/files.module';
import { MediaModule } from './modules/media/media.module';

// Configuración de la base de datos
import { databaseConfig } from './config/database.config';

// Controllers
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // Configuración del entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de la base de datos
    TypeOrmModule.forRoot(databaseConfig),

    // Limitador de requests
    ThrottlerModule.forRoot({
      ttl: 60000,
      limit: 100,
    }),

    // Tareas programadas
    ScheduleModule.forRoot(),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    GroupsModule,
    AttendanceModule,
    ChatModule,
    CalendarModule,
    FilesModule,
    MediaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}