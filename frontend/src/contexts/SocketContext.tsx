'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

import { useAuth } from './AuthContext';
import { Message, ChatRoom } from '@/types/chat';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: { [chatRoomId: string]: string[] };
  joinRoom: (chatRoomId: string) => void;
  leaveRoom: (chatRoomId: string) => void;
  sendMessage: (chatRoomId: string, content: string, type?: 'text' | 'image' | 'file') => void;
  startTyping: (chatRoomId: string) => void;
  stopTyping: (chatRoomId: string) => void;
  onNewMessage: (callback: (message: Message) => void) => void;
  onUserOnline: (callback: (userId: string, userName: string) => void) => void;
  onUserOffline: (callback: (userId: string, userName: string) => void) => void;
  onNotification: (callback: (notification: any) => void) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [chatRoomId: string]: string[] }>({});
  
  const messageCallbacks = useRef<((message: Message) => void)[]>([]);
  const userOnlineCallbacks = useRef<((userId: string, userName: string) => void)[]>([]);
  const userOfflineCallbacks = useRef<((userId: string, userName: string) => void)[]>([]);
  const notificationCallbacks = useRef<((notification: any) => void)[]>([]);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Initialize socket connection
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL + '/chat', {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        toast.success('Conectado al chat', { duration: 2000 });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
        setOnlineUsers([]);
        setTypingUsers({});
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Error de conexión al chat');
      });

      // User status events
      newSocket.on('user_online', (data: { userId: string; userName: string }) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        userOnlineCallbacks.current.forEach(callback => callback(data.userId, data.userName));
      });

      newSocket.on('user_offline', (data: { userId: string; userName: string }) => {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        userOfflineCallbacks.current.forEach(callback => callback(data.userId, data.userName));
      });

      // Message events
      newSocket.on('new_message', (message: Message) => {
        messageCallbacks.current.forEach(callback => callback(message));
        
        // Show notification if the message is not from current user
        if (message.sender.id !== user.id) {
          toast.success(`Nuevo mensaje de ${message.sender.name}`, {
            duration: 3000,
          });
        }
      });

      // Typing events
      newSocket.on('user_typing', (data: { userId: string; userName: string; chatRoomId: string }) => {
        if (data.userId !== user.id) {
          setTypingUsers(prev => ({
            ...prev,
            [data.chatRoomId]: [
              ...(prev[data.chatRoomId] || []).filter(name => name !== data.userName),
              data.userName,
            ],
          }));
        }
      });

      newSocket.on('user_stopped_typing', (data: { userId: string; userName: string; chatRoomId: string }) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatRoomId]: (prev[data.chatRoomId] || []).filter(name => name !== data.userName),
        }));
      });

      // Room events
      newSocket.on('joined_room', (data: { chatRoomId: string }) => {
        console.log('Joined room:', data.chatRoomId);
      });

      newSocket.on('left_room', (data: { chatRoomId: string }) => {
        console.log('Left room:', data.chatRoomId);
      });

      // Notification events
      newSocket.on('notification', (notification: any) => {
        notificationCallbacks.current.forEach(callback => callback(notification));
        
        // Show toast notification
        toast(notification.message, {
          icon: notification.type === 'success' ? '✅' : 
                notification.type === 'warning' ? '⚠️' : 
                notification.type === 'error' ? '❌' : 'ℹ️',
          duration: 4000,
        });
      });

      // Error handling
      newSocket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Error en el chat');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setTypingUsers({});
      };
    } else if (socket) {
      // User logged out, disconnect socket
      socket.close();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
      setTypingUsers({});
    }
  }, [isAuthenticated, token, user]);

  // Socket methods
  const joinRoom = (chatRoomId: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', { chatRoomId });
    }
  };

  const leaveRoom = (chatRoomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { chatRoomId });
    }
  };

  const sendMessage = (chatRoomId: string, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        chatRoomId,
        content,
        type,
      });
    }
  };

  const startTyping = (chatRoomId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { chatRoomId });
    }
  };

  const stopTyping = (chatRoomId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { chatRoomId });
    }
  };

  // Event listeners
  const onNewMessage = (callback: (message: Message) => void) => {
    messageCallbacks.current.push(callback);
    
    // Return cleanup function
    return () => {
      messageCallbacks.current = messageCallbacks.current.filter(cb => cb !== callback);
    };
  };

  const onUserOnline = (callback: (userId: string, userName: string) => void) => {
    userOnlineCallbacks.current.push(callback);
    
    return () => {
      userOnlineCallbacks.current = userOnlineCallbacks.current.filter(cb => cb !== callback);
    };
  };

  const onUserOffline = (callback: (userId: string, userName: string) => void) => {
    userOfflineCallbacks.current.push(callback);
    
    return () => {
      userOfflineCallbacks.current = userOfflineCallbacks.current.filter(cb => cb !== callback);
    };
  };

  const onNotification = (callback: (notification: any) => void) => {
    notificationCallbacks.current.push(callback);
    
    return () => {
      notificationCallbacks.current = notificationCallbacks.current.filter(cb => cb !== callback);
    };
  };

  const value: SocketContextValue = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserOnline,
    onUserOffline,
    onNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}