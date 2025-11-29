import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message, MessageRead } from './message.entity';
import { ChatRoom, ChatRoomType, ChatParticipant } from './chat-room.entity';
import { User, UserRole } from '../users/user.entity';
import { Student } from '../students/student.entity';
import { Group } from '../groups/group.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepository: Repository<ChatParticipant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(MessageRead)
    private readonly messageReadRepository: Repository<MessageRead>,
  ) {}

  async createMessage(
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const { content, chatRoomId, type } = createMessageDto;

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
    });

    const message = this.messageRepository.create({
      content,
      type,
      sender,
      chatRoom,
    });

    return this.messageRepository.save(message);
  }

  async getMessages(chatRoomId: string, limit = 50): Promise<Message[]> {
    return this.messageRepository.find({
      where: { chatRoom: { id: chatRoomId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    const participantRooms = await this.chatParticipantRepository.find({
      where: { userId },
      relations: ['chatRoom'],
    });

    return participantRooms.map(participant => participant.chatRoom);
  }

  async createChatRoom(
    name: string,
    participantIds: string[],
    type: ChatRoomType = ChatRoomType.GROUP,
  ): Promise<ChatRoom> {
    const chatRoom = this.chatRoomRepository.create({
      name,
      type,
      createdById: participantIds[0],
    });

    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

    // Create participants
    for (const participantId of participantIds) {
      const participant = this.chatParticipantRepository.create({
        userId: participantId,
        chatRoomId: savedChatRoom.id,
        joinedAt: new Date(),
      });
      await this.chatParticipantRepository.save(participant);
    }

    return savedChatRoom;
  }

  async getUserById(userId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async userHasAccessToRoom(userId: string, roomId: string): Promise<boolean> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });

    console.log('userHasAccessToRoom - userId:', userId);
    console.log('userHasAccessToRoom - roomId:', roomId);
    console.log('userHasAccessToRoom - chatRoom found:', !!chatRoom);
    console.log('userHasAccessToRoom - participants:', chatRoom?.participants?.map(p => ({ id: p.id, userId: p.userId })));

    return chatRoom?.participants?.some(participant => participant.userId === userId) || false;
  }

  async markMessagesAsRead(userId: string, roomId: string): Promise<void> {
    // Get all unread messages in this room for this user
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.readBy', 'readBy', 'readBy.userId = :userId', { userId })
      .where('message.chatRoomId = :roomId', { roomId })
      .andWhere('message.senderId != :userId', { userId }) // Don't mark own messages as read
      .andWhere('readBy.id IS NULL') // Only messages not yet read by this user
      .getMany();

    // Mark each message as read
    for (const message of messages) {
      const messageRead = this.messageReadRepository.create({
        messageId: message.id,
        userId: userId,
        readAt: new Date(),
      });
      await this.messageReadRepository.save(messageRead);
    }
  }

  async sendNotificationToOfflineUsers(roomId: string, message: Message): Promise<void> {
    // Implement push notification logic here
    // This would typically check user online status and send notifications
  }

  // Role-based chat room management
  async getChatRoomsForUser(userId: string): Promise<ChatRoom[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['children', 'groups'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let chatRooms: ChatRoom[] = [];

    switch (user.role) {
      case UserRole.ADMIN:
        // Admin can see all chat rooms
        chatRooms = await this.chatRoomRepository.find({
          where: { isActive: true },
          relations: ['participants', 'participants.user'],
          order: { updatedAt: 'DESC' },
        });
        break;

      case UserRole.TEACHER:
        // Teachers can see group chats for their groups and direct messages
        const teacherGroups = await this.groupRepository.find({
          where: { teacherId: userId },
          relations: ['students'],
        });

        const groupChatRoomIds = teacherGroups.map(group => `group_${group.id}`);

        chatRooms = await this.chatRoomRepository
          .createQueryBuilder('chatRoom')
          .leftJoinAndSelect('chatRoom.participants', 'participants')
          .leftJoinAndSelect('participants.user', 'user')
          .where('chatRoom.isActive = :isActive', { isActive: true })
          .andWhere(
            '(chatRoom.name IN (:...groupNames) OR EXISTS (SELECT 1 FROM chat_participants cp WHERE cp."chatRoomId" = chatRoom.id AND cp."userId" = :userId))',
            { groupNames: groupChatRoomIds, userId }
          )
          .orderBy('chatRoom.updatedAt', 'DESC')
          .getMany();
        break;

      case UserRole.PARENT:
        // Parents can only see chats related to their children
        const parentStudents = await this.studentRepository.find({
          where: { parentId: userId },
          relations: ['groups'],
        });

        const studentGroupIds = parentStudents.flatMap(student =>
          student.groups.map(group => `group_${group.id}`)
        );

        chatRooms = await this.chatRoomRepository
          .createQueryBuilder('chatRoom')
          .leftJoinAndSelect('chatRoom.participants', 'participants')
          .leftJoinAndSelect('participants.user', 'user')
          .where('chatRoom.isActive = :isActive', { isActive: true })
          .andWhere(
            '(chatRoom.name IN (:...groupNames) OR EXISTS (SELECT 1 FROM chat_participants cp WHERE cp."chatRoomId" = chatRoom.id AND cp."userId" = :userId))',
            { groupNames: studentGroupIds, userId }
          )
          .orderBy('chatRoom.updatedAt', 'DESC')
          .getMany();
        break;

      default:
        chatRooms = [];
    }

    return chatRooms;
  }

  async createGroupChatRoom(groupId: string, createdById: string): Promise<ChatRoom> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['teacher', 'students', 'students.parent'],
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const creator = await this.userRepository.findOne({
      where: { id: createdById },
    });

    if (!creator) {
      throw new NotFoundException('Usuario creador no encontrado');
    }

    // Verify permissions
    if (creator.role === UserRole.PARENT) {
      const hasChildInGroup = group.students.some(student => student.parentId === createdById);
      if (!hasChildInGroup) {
        throw new ForbiddenException('No tienes permisos para crear chat en este grupo');
      }
    } else if (creator.role === UserRole.TEACHER && group.teacherId !== createdById) {
      throw new ForbiddenException('Solo el maestro del grupo puede crear el chat');
    }

    // Check if chat room already exists
    const existingRoom = await this.chatRoomRepository.findOne({
      where: { name: `group_${groupId}` },
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Create chat room
    const chatRoom = this.chatRoomRepository.create({
      name: `group_${groupId}`,
      description: `Chat del grupo ${group.name}`,
      type: ChatRoomType.GROUP,
      createdById,
    });

    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

    // Add participants (teacher and parents)
    const participants = [group.teacher];
    group.students.forEach(student => {
      if (student.parent) {
        participants.push(student.parent);
      }
    });

    for (const participant of participants) {
      const chatParticipant = this.chatParticipantRepository.create({
        userId: participant.id,
        chatRoomId: savedChatRoom.id,
        joinedAt: new Date(),
        role: participant.id === group.teacherId ? 'admin' : 'member',
      });
      await this.chatParticipantRepository.save(chatParticipant);
    }

    return savedChatRoom;
  }

  async createDirectChatRoom(user1Id: string, user2Id: string): Promise<ChatRoom> {
    console.log('createDirectChatRoom called with:', { user1Id, user2Id });

    if (!user1Id || !user2Id) {
      console.log('Missing user IDs - user1Id:', user1Id, 'user2Id:', user2Id);
      throw new BadRequestException('IDs de usuario requeridos');
    }

    if (user1Id === user2Id) {
      throw new BadRequestException('No puedes crear un chat contigo mismo');
    }

    const [user1, user2] = await Promise.all([
      this.userRepository.findOne({ where: { id: user1Id } }),
      this.userRepository.findOne({ where: { id: user2Id } }),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('Uno o ambos usuarios no encontrados');
    }

    // Check if users can chat with each other
    await this.validateDirectChatPermissions(user1, user2);

    // Check if direct chat already exists
    const existingRoom = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .leftJoin('chatRoom.participants', 'p1')
      .leftJoin('chatRoom.participants', 'p2')
      .where('chatRoom.type = :type', { type: ChatRoomType.DIRECT })
      .andWhere('p1.userId = :user1Id', { user1Id })
      .andWhere('p2.userId = :user2Id', { user2Id })
      .getOne();

    if (existingRoom) {
      return existingRoom;
    }

    // Create direct chat room
    const chatRoom = this.chatRoomRepository.create({
      name: `${user1.firstName}_${user2.firstName}`,
      description: `Chat directo entre ${user1.firstName} y ${user2.firstName}`,
      type: ChatRoomType.DIRECT,
      createdById: user1Id,
    });

    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);

    // Add both participants
    for (const userId of [user1Id, user2Id]) {
      const participant = this.chatParticipantRepository.create({
        userId,
        chatRoomId: savedChatRoom.id,
        joinedAt: new Date(),
        role: 'member',
      });
      await this.chatParticipantRepository.save(participant);
    }

    return savedChatRoom;
  }

  private async validateDirectChatPermissions(user1: User, user2: User): Promise<void> {
    // Admin can chat with everyone
    if (user1.role === UserRole.ADMIN || user2.role === UserRole.ADMIN) {
      return;
    }

    // Teachers and parents can chat if they share students
    if (user1.role === UserRole.TEACHER && user2.role === UserRole.PARENT) {
      const teacherGroups = await this.groupRepository.find({
        where: { teacherId: user1.id },
        relations: ['students'],
      });

      const parentStudents = await this.studentRepository.find({
        where: { parentId: user2.id },
        relations: ['groups'],
      });

      const hasSharedStudents = teacherGroups.some(group =>
        group.students.some(student =>
          parentStudents.some(parentStudent => parentStudent.id === student.id)
        )
      );

      if (!hasSharedStudents) {
        throw new ForbiddenException('No tienes estudiantes en común con este maestro');
      }
      return;
    }

    if (user1.role === UserRole.PARENT && user2.role === UserRole.TEACHER) {
      return this.validateDirectChatPermissions(user2, user1);
    }

    // Teachers can chat with other teachers
    if (user1.role === UserRole.TEACHER && user2.role === UserRole.TEACHER) {
      return;
    }

    // Parents generally cannot chat directly unless they share groups
    if (user1.role === UserRole.PARENT && user2.role === UserRole.PARENT) {
      const user1Students = await this.studentRepository.find({
        where: { parentId: user1.id },
        relations: ['groups'],
      });

      const user2Students = await this.studentRepository.find({
        where: { parentId: user2.id },
        relations: ['groups'],
      });

      const hasSharedGroups = user1Students.some(s1 =>
        s1.groups.some(g1 =>
          user2Students.some(s2 =>
            s2.groups.some(g2 => g1.id === g2.id)
          )
        )
      );

      if (!hasSharedGroups) {
        throw new ForbiddenException('No tienes hijos en grupos comunes con este padre');
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos para chatear con este usuario');
  }

  async getMessagesWithPermissions(chatRoomId: string, userId: string, limit = 50): Promise<Message[]> {
    // Verify user has access to this chat room
    const hasAccess = await this.userHasAccessToRoom(userId, chatRoomId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }

    return this.getMessages(chatRoomId, limit);
  }

  async addFileToMessage(
    messageId: string,
    fileUrl: string,
    fileKey: string,
    fileName: string,
    fileSize: number
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Note: fileUrl will be the public CDN URL
    // If CDN is not configured, files should be accessed via signed URLs
    // using GET /api/chat/files/:fileKey endpoint
    const fileAttachment = {
      fileName,
      fileUrl,    // R2 public URL (or use signed URL endpoint if CDN not configured)
      fileKey,    // R2 object key for deletion/management
      fileSize,
      uploadedAt: new Date(),
    };

    message.attachments = message.attachments ? [...message.attachments, fileAttachment] : [fileAttachment];

    return this.messageRepository.save(message);
  }

  async deleteChatRoom(chatRoomId: string, currentUserId: string): Promise<void> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['participants', 'participants.user'],
    });

    if (!chatRoom) {
      throw new NotFoundException('Chat no encontrado');
    }

    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check permissions
    const canDelete = this.canUserDeleteChatRoom(currentUser, chatRoom);
    if (!canDelete) {
      throw new ForbiddenException('No tienes permisos para eliminar este chat');
    }

    // Delete all messages in the chat room first
    await this.messageRepository.delete({ chatRoom: { id: chatRoomId } });

    // Delete all participants
    await this.chatParticipantRepository.delete({ chatRoomId });

    // Delete the chat room
    await this.chatRoomRepository.remove(chatRoom);
  }

  private canUserDeleteChatRoom(user: User, chatRoom: ChatRoom): boolean {
    // Admin can delete any chat room
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Chat room creator can delete their own chat rooms
    if (chatRoom.createdById === user.id) {
      return true;
    }

    // For group chats, teachers can delete chats for their groups
    if (chatRoom.type === ChatRoomType.GROUP && user.role === UserRole.TEACHER) {
      // Check if the group chat belongs to a group managed by this teacher
      // This would require checking if the chat name follows pattern "group_${groupId}"
      // and if the teacher manages that group
      return chatRoom.name?.startsWith('group_') || false;
    }

    return false;
  }

  async getGroupsForTeacher(teacherId: string) {
    return this.groupRepository.find({
      where: { teacherId },
      relations: ['students', 'students.parent'],
    });
  }

  async getStudentsForParent(parentId: string) {
    return this.studentRepository.find({
      where: { parentId },
      relations: ['groups', 'groups.teacher'],
    });
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    // Get all chat rooms for the user
    const chatRooms = await this.getChatRoomsForUser(userId);
    const chatRoomIds = chatRooms.map(room => room.id);

    if (chatRoomIds.length === 0) {
      return 0;
    }

    // Count messages in these rooms that haven't been read by this user
    const unreadCount = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.readBy', 'readBy', 'readBy.userId = :userId', { userId })
      .where('message.chatRoomId IN (:...chatRoomIds)', { chatRoomIds })
      .andWhere('message.senderId != :userId', { userId }) // Don't count user's own messages
      .andWhere('readBy.id IS NULL') // Message hasn't been read by this user
      .getCount();

    return unreadCount;
  }
}