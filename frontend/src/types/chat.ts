import { User } from './user';

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  chatRoomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  attachments?: MessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
  readBy?: MessageRead[];
}

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  avatar?: string;
  description?: string;
  participants?: ChatParticipant[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatParticipant {
  id: string;
  chatRoomId: string;
  userId: string;
  user: User;
  role: 'admin' | 'member';
  joinedAt: Date;
}