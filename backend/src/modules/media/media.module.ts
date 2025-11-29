import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentMedia } from './student-media.entity';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageService } from '../../services/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentMedia, Student, User, Group])],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [TypeOrmModule, MediaService],
})
export class MediaModule {}
