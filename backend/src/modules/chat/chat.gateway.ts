import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/user.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { socket: Socket; user: User }>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extraer token del handshake
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // Verificar y decodificar el token
      const payload = this.jwtService.verify(token);
      const user = await this.chatService.getUserById(payload.sub);
      
      if (!user) {
        client.disconnect();
        return;
      }

      // Guardar conexión del usuario
      this.connectedUsers.set(client.id, { socket: client, user });

      // Unir al usuario a sus salas de chat
      const chatRooms = await this.chatService.getChatRoomsForUser(user.id);
      chatRooms.forEach(room => {
        client.join(room.id);
      });

      // Notificar que el usuario está online
      this.server.emit('user_online', {
        userId: user.id,
        userName: user.fullName,
      });

      console.log(`Usuario ${user.fullName} conectado al chat`);
    } catch (error) {
      console.error('Error en conexión de chat:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const connection = this.connectedUsers.get(client.id);
    if (connection) {
      // Notificar que el usuario está offline
      this.server.emit('user_offline', {
        userId: connection.user.id,
        userName: connection.user.fullName,
      });

      this.connectedUsers.delete(client.id);
      console.log(`Usuario ${connection.user.fullName} desconectado del chat`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const connection = this.connectedUsers.get(client.id);
      if (!connection) {
        return;
      }

      // Crear el mensaje en la base de datos
      const message = await this.chatService.createMessage(
        connection.user.id,
        createMessageDto,
      );

      // Emitir el mensaje a todos los participantes de la sala
      this.server.to(createMessageDto.chatRoomId).emit('new_message', {
        id: message.id,
        content: message.content,
        type: message.type,
        sender: {
          id: connection.user.id,
          name: connection.user.fullName,
          avatar: connection.user.avatar,
        },
        createdAt: message.createdAt,
        attachments: message.attachments,
      });

      // Enviar notificación push a usuarios offline
      await this.chatService.sendNotificationToOfflineUsers(
        createMessageDto.chatRoomId,
        message,
      );

    } catch (error) {
      client.emit('error', { message: 'Error al enviar mensaje' });
      console.error('Error al enviar mensaje:', error);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { chatRoomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      return;
    }

    try {
      // Verificar que el usuario tiene acceso a la sala
      const hasAccess = await this.chatService.userHasAccessToRoom(
        connection.user.id,
        data.chatRoomId,
      );

      if (hasAccess) {
        client.join(data.chatRoomId);

        // Marcar mensajes como leídos
        await this.chatService.markMessagesAsRead(
          connection.user.id,
          data.chatRoomId,
        );

        client.emit('joined_room', { chatRoomId: data.chatRoomId });
      } else {
        client.emit('error', { message: 'Sin acceso a esta sala de chat' });
      }
    } catch (error) {
      client.emit('error', { message: 'Error al unirse a la sala' });
      console.error('Error al unirse a la sala:', error);
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { chatRoomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.chatRoomId);
    client.emit('left_room', { chatRoomId: data.chatRoomId });
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { chatRoomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      return;
    }

    client.to(data.chatRoomId).emit('user_typing', {
      userId: connection.user.id,
      userName: connection.user.fullName,
      chatRoomId: data.chatRoomId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { chatRoomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      return;
    }

    client.to(data.chatRoomId).emit('user_stopped_typing', {
      userId: connection.user.id,
      userName: connection.user.fullName,
      chatRoomId: data.chatRoomId,
    });
  }

  @SubscribeMessage('message_updated')
  handleMessageUpdated(
    @MessageBody() data: { chatRoomId: string; message: any },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      return;
    }

    // Broadcast the updated message to all users in the room except the sender
    client.to(data.chatRoomId).emit('message_updated', {
      message: data.message,
    });
  }

  // Método para enviar notificaciones desde otros servicios
  async sendNotificationToRoom(chatRoomId: string, notification: any) {
    this.server.to(chatRoomId).emit('notification', notification);
  }

  // Método para obtener usuarios conectados en una sala
  getUsersInRoom(chatRoomId: string): User[] {
    const users: User[] = [];
    const room = this.server.sockets.adapter.rooms.get(chatRoomId);
    
    if (room) {
      room.forEach(socketId => {
        const connection = this.connectedUsers.get(socketId);
        if (connection) {
          users.push(connection.user);
        }
      });
    }
    
    return users;
  }
}