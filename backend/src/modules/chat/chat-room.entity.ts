import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

export enum ChatRoomType {
  DIRECT = 'direct',
  GROUP = 'group',
  ANNOUNCEMENT = 'announcement',
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ChatRoomType })
  type: ChatRoomType;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ name: 'createdById' })
  createdById: string;

  @OneToMany(() => Message, (message) => message.chatRoom)
  messages: Message[];

  @OneToMany(() => ChatParticipant, (participant) => participant.chatRoom)
  participants: ChatParticipant[];
}

@Entity('chat_participants')
export class ChatParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['admin', 'member'], default: 'member' })
  role: string;

  @Column({ type: 'timestamp' })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.participants)
  @JoinColumn({ name: 'chatRoomId' })
  chatRoom: ChatRoom;

  @Column({ name: 'chatRoomId' })
  chatRoomId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: string;
}