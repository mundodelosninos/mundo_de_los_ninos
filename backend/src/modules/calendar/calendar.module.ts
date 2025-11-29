import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent, EventParticipant } from './calendar-event.entity';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarIntegrationService } from './calendar-integration.service';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';
import { Group } from '../groups/group.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarEvent,
      EventParticipant,
      User,
      Student,
      Group,
    ]),
    AuthModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService, CalendarIntegrationService],
  exports: [CalendarService, TypeOrmModule],
})
export class CalendarModule {}