import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ChatRoom } from './chat-room.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: 'json', nullable: true })
  attachments: any[];

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ name: 'senderId' })
  senderId: string;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
  @JoinColumn({ name: 'chatRoomId' })
  chatRoom: ChatRoom;

  @Column({ name: 'chatRoomId' })
  chatRoomId: string;

  @OneToMany(() => MessageRead, (messageRead) => messageRead.message)
  readBy: MessageRead[];
}

@Entity('message_reads')
export class MessageRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  readAt: Date;

  @ManyToOne(() => Message, (message) => message.readBy)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column({ name: 'messageId' })
  messageId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: string;
}