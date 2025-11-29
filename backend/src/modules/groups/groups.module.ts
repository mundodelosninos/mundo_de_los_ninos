import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, Student])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [TypeOrmModule, GroupsService],
})
export class GroupsModule {}