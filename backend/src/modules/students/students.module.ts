import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { User } from '../users/user.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { EmailService } from '../../services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User])],
  controllers: [StudentsController],
  providers: [StudentsService, EmailService],
  exports: [TypeOrmModule, StudentsService],
})
export class StudentsModule {}