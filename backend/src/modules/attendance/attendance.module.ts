import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { Activity } from './activity.entity';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Activity, Student, User])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [TypeOrmModule, AttendanceService],
})
export class AttendanceModule {}