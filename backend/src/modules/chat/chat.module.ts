import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatRoom, ChatParticipant } from './chat-room.entity';
import { Message, MessageRead } from './message.entity';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';
import { Group } from '../groups/group.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { StorageService } from '../../services/storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatParticipant, Message, MessageRead, User, Student, Group]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, StorageService],
  exports: [ChatService],
})
export class ChatModule {}