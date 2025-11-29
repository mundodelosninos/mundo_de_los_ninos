import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../../services/storage.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly storageService: StorageService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('rooms')
  async getChatRooms(@CurrentUser() currentUser: any) {
    const userId = currentUser.userId || currentUser.id;
    return this.chatService.getChatRoomsForUser(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() currentUser: any) {
    const userId = currentUser.userId || currentUser.id;
    const count = await this.chatService.getUnreadMessageCount(userId);
    return { unreadCount: count };
  }

  @Post('rooms/:roomId/mark-read')
  async markRoomAsRead(
    @Param('roomId') roomId: string,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.userId || currentUser.id;
    await this.chatService.markMessagesAsRead(userId, roomId);
    return { message: 'Messages marked as read' };
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @CurrentUser() currentUser: any,
    @Query('limit') limit?: number,
  ) {
    const userId = currentUser.userId || currentUser.id;
    return this.chatService.getMessagesWithPermissions(
      roomId,
      userId,
      limit || 50,
    );
  }

  @Post('rooms/group/:groupId')
  async createGroupChatRoom(
    @Param('groupId') groupId: string,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.userId || currentUser.id;
    return this.chatService.createGroupChatRoom(groupId, userId);
  }

  @Post('rooms/direct/:userId')
  async createDirectChatRoom(
    @Param('userId') otherUserId: string,
    @CurrentUser() currentUser: any,
  ) {
    console.log('Chat controller currentUser:', currentUser);
    console.log('currentUser.userId:', currentUser?.userId);
    console.log('currentUser.id:', currentUser?.id);
    console.log('Object.keys(currentUser):', Object.keys(currentUser || {}));

    if (!currentUser) {
      throw new BadRequestException('Usuario no autenticado correctamente.');
    }

    const userId = currentUser.userId || currentUser.id;
    if (!userId) {
      throw new BadRequestException('No se pudo obtener el ID del usuario autenticado.');
    }

    return this.chatService.createDirectChatRoom(userId, otherUserId);
  }

  @Post('messages')
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.userId || currentUser.id;
    return this.chatService.createMessage(userId, createMessageDto);
  }

  @Post('messages/:messageId/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        // Allow images, documents, and common file types
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'video/mp4',
          'video/quicktime',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Tipo de archivo no permitido'), false);
        }
      },
    }),
  )
  async uploadFile(
    @Param('messageId') messageId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Check if R2 is configured
    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('R2 storage is not configured');
    }

    try {
      // Upload file to R2
      const result = await this.storageService.uploadFile(file, 'chat');

      // Add file metadata to message
      return this.chatService.addFileToMessage(
        messageId,
        result.url,
        result.key,
        file.originalname,
        file.size,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Upload failed: ${errorMessage}`);
    }
  }

  @Get('files/:fileKey')
  async getFile(@Param('fileKey') fileKey: string) {
    // Generate a signed URL for the file from R2
    // The fileKey should be in format: chat/uuid.ext

    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('R2 storage is not configured');
    }

    try {
      // Generate a signed URL valid for 1 hour
      const signedUrl = await this.storageService.getSignedUrl(fileKey, 3600);

      return {
        url: signedUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to get file: ${errorMessage}`);
    }
  }

  @Get('users/available')
  async getAvailableUsers(@CurrentUser() currentUser: any) {
    // Get users that the current user can chat with based on role permissions
    return this.getAvailableChatUsers(currentUser);
  }

  @Delete('rooms/:roomId')
  async deleteChatRoom(
    @Param('roomId') roomId: string,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.userId || currentUser.id;
    if (!userId) {
      throw new BadRequestException('No se pudo obtener el ID del usuario autenticado.');
    }

    await this.chatService.deleteChatRoom(roomId, userId);
    return { message: 'Chat eliminado exitosamente' };
  }

  private async getAvailableChatUsers(currentUser: User) {
    // This method would return users that the current user can start chats with
    // based on their role and relationships (teacher-parent, parent-parent in same groups, etc.)

    const availableUsers = [];

    switch (currentUser.role) {
      case 'admin':
        availableUsers.push(
          ...(await this.userRepository.find({ select: ['id', 'firstName', 'lastName', 'email', 'role'] })),
        );
        break;

      case 'teacher':
        // Teachers can chat with parents of their students and other teachers
        availableUsers.push(
          ...(await this.getParentsOfTeacherStudents(currentUser.id)),
          ...(await this.getAllTeachers()),
        );
        break;

      case 'parent':
        // Parents can chat with all teachers and administrators
        availableUsers.push(
          ...(await this.getAllTeachers()),
          ...(await this.getAllAdmins()),
        );
        break;
    }

    // Remove duplicates based on user ID
    const uniqueUsers = availableUsers.filter((user, index, self) =>
      index === self.findIndex(u => u.id === user.id)
    );

    // Filter out the current user
    return uniqueUsers.filter(user => user.id !== currentUser.id);
  }

  // Helper methods
  private async getParentsOfTeacherStudents(teacherId: string) {
    // Get parents of students that this teacher teaches
    const groups = await this.chatService.getGroupsForTeacher(teacherId);
    const parents = [];

    for (const group of groups) {
      for (const student of group.students) {
        if (student.parent) {
          parents.push(student.parent);
        }
      }
    }

    // Remove duplicates
    const uniqueParents = parents.filter((parent, index, self) =>
      index === self.findIndex(p => p.id === parent.id)
    );

    return uniqueParents.map(parent => ({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      role: parent.role
    }));
  }

  private async getAllTeachers() {
    return this.userRepository.find({
      where: { role: UserRole.TEACHER },
      select: ['id', 'firstName', 'lastName', 'email', 'role']
    });
  }

  private async getAllAdmins() {
    return this.userRepository.find({
      where: { role: UserRole.ADMIN },
      select: ['id', 'firstName', 'lastName', 'email', 'role']
    });
  }

  private async getTeachersOfParentChildren(parentId: string) {
    // Get teachers of this parent's children
    const students = await this.chatService.getStudentsForParent(parentId);
    const teachers = [];

    for (const student of students) {
      for (const group of student.groups) {
        if (group.teacher) {
          teachers.push(group.teacher);
        }
      }
    }

    // Remove duplicates
    const uniqueTeachers = teachers.filter((teacher, index, self) =>
      index === self.findIndex(t => t.id === teacher.id)
    );

    return uniqueTeachers.map(teacher => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      role: teacher.role
    }));
  }

  private async getParentsInSameGroups(parentId: string) {
    // This method is no longer used for parents, but keeping for potential future use
    return [];
  }
}