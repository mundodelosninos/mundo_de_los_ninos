'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiUrl, getSocketUrl } from '@/config/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'announcement';
  createdById?: string;
  participants: {
    id: string;
    user: User;
    role: string;
  }[];
  lastMessage?: {
    content: string;
    createdAt: Date;
    sender: User;
  };
}

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  sender: User;
  createdAt: Date;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    uploadedAt: Date;
  }[];
}

interface ChatManagementProps {
  userRole: string;
}

interface AttachmentDisplayProps {
  attachment: {
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    uploadedAt: Date;
  };
  isOwn: boolean;
  getSignedUrl: (fileKey: string) => Promise<string>;
}

const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({ attachment, isOwn, getSignedUrl }) => {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      if (attachment.fileKey) {
        const url = await getSignedUrl(attachment.fileKey);
        setSignedUrl(url);
      }
      setLoading(false);
    };
    fetchUrl();
  }, [attachment.fileKey, getSignedUrl]);

  const isImage = attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{
      backgroundColor: isOwn ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding: '8px',
      marginTop: '4px'
    }}>
      {loading ? (
        <div style={{ padding: '8px', fontSize: '12px', opacity: 0.7 }}>
          Cargando...
        </div>
      ) : (
        <>
          {isImage && signedUrl && (
            <div style={{ marginBottom: '8px' }}>
              <img
                src={signedUrl}
                alt={attachment.fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(signedUrl, '_blank')}
              />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>
                {attachment.fileName}
              </p>
              <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>
                {formatFileSize(attachment.fileSize)}
              </p>
            </div>
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: isOwn ? '#fff' : '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '600',
                  marginLeft: '8px'
                }}
              >
                Descargar
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const ChatManagement: React.FC<ChatManagementProps> = ({ userRole }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Chat state
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Signed URLs cache
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<ChatRoom | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (token && user) {
      initializeSocket();
      fetchChatRooms();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const newSocket = io(getSocketUrl('chat'), {
      auth: {
        token: token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('new_message', (message: any) => {
      setMessages(prev => [...prev, {
        id: message.id,
        content: message.content,
        type: message.type,
        sender: message.sender,
        createdAt: message.createdAt,
        attachments: message.attachments
      }]);
      // Refresh chat rooms to update last message
      fetchChatRooms();
    });

    newSocket.on('message_updated', ({ message }: { message: any }) => {
      // Update the message in the local state
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? message : msg
      ));
    });

    newSocket.on('user_typing', ({ userId, userName }: { userId: string; userName: string }) => {
      if (userId !== user?.id) {
        setTypingUsers(prev => [...prev.filter(u => u !== userName), userName]);
      }
    });

    newSocket.on('user_stopped_typing', ({ userId, userName }: { userId: string; userName: string }) => {
      if (userId !== user?.id) {
        setTypingUsers(prev => prev.filter(u => u !== userName));
      }
    });

    newSocket.on('error', ({ message }: { message: string }) => {
      setError(message);
    });

    setSocket(newSocket);
  };

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(getApiUrl('chat/rooms'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const rooms = await response.json();
        setChatRooms(rooms);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(getApiUrl(`chat/rooms/${roomId}/messages`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const roomMessages = await response.json();
        setMessages(roomMessages.reverse());

        // Mark messages as read via HTTP as backup (WebSocket also does this)
        try {
          await fetch(getApiUrl(`chat/rooms/${roomId}/mark-read`), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.error('Error marking messages as read:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const getSignedUrl = async (fileKey: string): Promise<string> => {
    // Check if we already have a cached signed URL
    if (signedUrls[fileKey]) {
      return signedUrls[fileKey];
    }

    try {
      // URL encode the file key
      const encodedFileKey = encodeURIComponent(fileKey);
      const response = await fetch(getApiUrl(`chat/files/${encodedFileKey}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Cache the signed URL
        setSignedUrls(prev => ({ ...prev, [fileKey]: data.url }));
        return data.url;
      }
    } catch (error) {
      console.error('Error fetching signed URL:', error);
    }

    // Fallback to the direct URL if signing fails
    return '';
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(getApiUrl('chat/users/available'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const users = await response.json();
        setAvailableUsers(users);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const selectRoom = async (room: ChatRoom) => {
    if (selectedRoom) {
      socket?.emit('leave_room', { chatRoomId: selectedRoom.id });
    }

    setSelectedRoom(room);
    setMessages([]);
    setTypingUsers([]);
    setMobileSidebarOpen(false); // Close sidebar on mobile when room is selected

    if (socket) {
      socket.emit('join_room', { chatRoomId: room.id });
    }

    await fetchMessages(room.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !socket) return;

    const messageData = {
      content: newMessage,
      type: 'text',
      chatRoomId: selectedRoom.id,
    };

    try {
      // Send via WebSocket (which also handles persistence)
      socket.emit('send_message', messageData);

      setNewMessage('');
      stopTyping();
    } catch (error) {
      setError('Error enviando mensaje');
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedRoom) return;

    setIsUploading(true);

    try {
      // First create a message for the file
      const messageData = {
        content: `📎 ${selectedFile.name}`,
        type: 'file',
        chatRoomId: selectedRoom.id,
      };

      const messageResponse = await fetch(getApiUrl('chat/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (messageResponse.ok) {
        const message = await messageResponse.json();

        // Upload the file
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch(getApiUrl(`chat/messages/${message.id}/files`), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          const updatedMessage = await uploadResponse.json();

          // Update local messages state with the file attachment
          setMessages(prev => prev.map(msg =>
            msg.id === message.id ? updatedMessage : msg
          ));

          // Broadcast the updated message to other users in the room
          socket?.emit('message_updated', {
            chatRoomId: selectedRoom.id,
            message: updatedMessage,
          });

          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
    } catch (error) {
      setError('Error subiendo archivo');
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const startTyping = () => {
    if (!isTyping && selectedRoom && socket) {
      setIsTyping(true);
      socket.emit('typing_start', { chatRoomId: selectedRoom.id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping && selectedRoom && socket) {
      setIsTyping(false);
      socket.emit('typing_stop', { chatRoomId: selectedRoom.id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const startDirectChat = async (otherUser: User) => {
    try {
      const response = await fetch(getApiUrl(`chat/rooms/direct/${otherUser.id}`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const chatRoom = await response.json();
        setChatRooms(prev => [...prev.filter(r => r.id !== chatRoom.id), chatRoom]);
        await selectRoom(chatRoom);
        setShowUserList(false);
      }
    } catch (error) {
      setError('Error iniciando chat directo');
      console.error('Error starting direct chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'direct') {
      const otherParticipant = room.participants?.find(p => p.user?.id !== user?.id);
      return `${otherParticipant?.user?.firstName || 'Usuario'} ${otherParticipant?.user?.lastName || ''}`;
    }
    return room.name?.replace('group_', 'Grupo ') || 'Chat';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const deleteChatRoom = async (room: ChatRoom) => {
    try {
      const response = await fetch(getApiUrl(`chat/rooms/${room.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Remove from chat rooms list
        setChatRooms(prev => prev.filter(r => r.id !== room.id));

        // If the deleted room was selected, clear selection
        if (selectedRoom?.id === room.id) {
          setSelectedRoom(null);
          setMessages([]);
        }

        setShowDeleteConfirm(false);
        setRoomToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error eliminando chat');
      }
    } catch (error) {
      setError('Error eliminando chat');
      console.error('Error deleting chat room:', error);
    }
  };

  const canUserDeleteRoom = (room: ChatRoom): boolean => {
    if (!user) return false;

    // Admin can delete any room
    if (user.role === 'admin') return true;

    // Room creator can delete their own rooms
    if (room.createdById === user.id) return true;

    // Teachers can delete group chats they manage
    if (user.role === 'teacher' && room.type === 'group') return true;

    return false;
  };

  const canManageChats = userRole === 'admin' || userRole === 'teacher' || userRole === 'parent';

  return (
    <div style={{
      display: 'flex',
      height: '85vh',
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      position: 'relative'
    }}>
      {/* Mobile Header */}
      {!mobileSidebarOpen && selectedRoom && (
        <div className="mobile-chat-header" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          backgroundColor: 'white',
          borderBottom: '1px solid #e0f2fe',
          zIndex: 10,
          display: 'none'
        }}>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            style={{
              padding: '0.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: '600'
            }}
          >
            ← Chats
          </button>
        </div>
      )}

      {/* Sidebar with Chat List */}
      <div className="chat-sidebar" style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#f0f8ff',
        borderRight: '1px solid #e0f2fe',
        display: mobileSidebarOpen ? 'flex' : 'none',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 20
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #e0f2fe',
          backgroundColor: '#f0f8ff'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#333',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💬 Chat
            </h2>
            {canManageChats && (
              <button
                onClick={() => {
                  setShowUserList(true);
                  fetchAvailableUsers();
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                ✨ Nuevo
              </button>
            )}
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}
        </div>

        {/* Chat List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatRooms.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💭</div>
              <p style={{ fontSize: '16px', margin: 0 }}>No hay chats disponibles</p>
              <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>
                Inicia una nueva conversación
              </p>
            </div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => selectRoom(room)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #e0f2fe',
                  backgroundColor: selectedRoom?.id === room.id ? '#e0f2fe' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedRoom?.id !== room.id) {
                    e.currentTarget.style.backgroundColor = '#f0f8ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRoom?.id !== room.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: room.type === 'group' ? '#7c3aed' : '#06b6d4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {room.type === 'group' ? '👥' : (() => {
                      const otherParticipant = room.participants?.find(p => p.user?.id !== user?.id);
                      const firstName = otherParticipant?.user?.firstName || '';
                      const lastName = otherParticipant?.user?.lastName || '';
                      return getInitials(firstName, lastName);
                    })()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0369a1',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {getRoomDisplayName(room)}
                    </div>
                    {room.lastMessage && (
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {room.lastMessage.content}
                      </div>
                    )}
                  </div>
                  {canUserDeleteRoom(room) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoomToDelete(room);
                        setShowDeleteConfirm(true);
                      }}
                      style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontSize: '16px',
                        opacity: 0.7,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.opacity = '0.7';
                      }}
                      title="Eliminar chat"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main" style={{
        flex: 1,
        display: mobileSidebarOpen ? 'none' : 'flex',
        flexDirection: 'column',
        width: '100%'
      }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e0f2fe',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: selectedRoom.type === 'group' ? '#7c3aed' : '#06b6d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white'
              }}>
                {selectedRoom.type === 'group' ? '👥' : (() => {
                  const otherParticipant = selectedRoom.participants?.find(p => p.user?.id !== user?.id);
                  const firstName = otherParticipant?.user?.firstName || '';
                  const lastName = otherParticipant?.user?.lastName || '';
                  return getInitials(firstName, lastName);
                })()}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#333',
                  margin: 0,
                  marginBottom: '2px'
                }}>
                  {getRoomDisplayName(selectedRoom)}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: 0
                }}>
                  {selectedRoom.participants?.length || 0} participante{(selectedRoom.participants?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              backgroundColor: '#f8fafc'
            }}>
              {messages.map((message, index) => {
                const isOwn = message.sender.id === user?.id;
                const showSender = !isOwn && (index === 0 || messages[index - 1]?.sender.id !== message.sender.id);

                return (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isOwn ? 'flex-end' : 'flex-start'
                    }}>
                      {showSender && (
                        <span style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                          marginBottom: '4px',
                          marginLeft: isOwn ? 0 : '12px',
                          marginRight: isOwn ? '12px' : 0
                        }}>
                          {message.sender.firstName} {message.sender.lastName}
                        </span>
                      )}
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '18px',
                        backgroundColor: isOwn ? '#3b82f6' : '#374151',
                        color: isOwn ? 'white' : '#f1f5f9',
                        fontSize: '15px',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        {message.content}

                        {message.attachments && message.attachments.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            {message.attachments.map((attachment, idx) => (
                              <AttachmentDisplay
                                key={idx}
                                attachment={attachment}
                                isOwn={isOwn}
                                getSignedUrl={getSignedUrl}
                              />
                            ))}
                          </div>
                        )}

                        <div style={{
                          fontSize: '11px',
                          color: isOwn ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                          marginTop: '4px',
                          textAlign: 'right'
                        }}>
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: '#374151',
                    borderRadius: '18px',
                    padding: '12px 16px',
                    color: '#94a3b8',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '2px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#94a3b8',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#94a3b8',
                        animation: 'pulse 1.5s ease-in-out infinite 0.5s'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#94a3b8',
                        animation: 'pulse 1.5s ease-in-out infinite 1s'
                      }}></div>
                    </div>
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'están'} escribiendo...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e0f2fe',
              backgroundColor: 'white'
            }}>
              {selectedFile && (
                <div style={{
                  marginBottom: '12px',
                  padding: '12px',
                  backgroundColor: '#e0f2fe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #0284c7'
                }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', margin: 0 }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: isUploading ? 0.5 : 1
                      }}
                    >
                      {isUploading ? 'Subiendo...' : 'Enviar'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#f0f8ff',
                borderRadius: '24px',
                padding: '4px',
                border: '1px solid #e0f2fe'
              }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.mp4,.mov"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#0284c7',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📎
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    startTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    color: '#333'
                  }}
                />

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '12px',
                    backgroundColor: newMessage.trim() ? '#3b82f6' : '#cbd5e1',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    color: 'white',
                    transition: 'all 0.2s ease',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  🚀
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>💬</div>
              <p style={{ fontSize: '24px', fontWeight: '600', margin: 0, marginBottom: '8px', color: '#0284c7' }}>
                Selecciona un chat
              </p>
              <p style={{ fontSize: '16px', margin: 0, opacity: 0.7 }}>
                Elige una conversación para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User List Modal */}
      {showUserList && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '600px',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#333',
              margin: 0,
              marginBottom: '20px'
            }}>
              Iniciar nuevo chat
            </h3>

            {availableUsers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <p style={{ fontSize: '16px', margin: 0 }}>
                  No hay usuarios disponibles para chatear
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                {availableUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    onClick={() => startDirectChat(availableUser)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {getInitials(availableUser.firstName, availableUser.lastName)}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0369a1',
                        margin: 0,
                        marginBottom: '2px'
                      }}>
                        {availableUser.firstName} {availableUser.lastName}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#666',
                        margin: 0,
                        textTransform: 'capitalize'
                      }}>
                        {availableUser.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUserList(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #0284c7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bfdbfe'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && roomToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#333',
              margin: 0,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🗑️ Eliminar Chat
            </h3>

            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: 0,
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              ¿Estás seguro de que quieres eliminar el chat <strong style={{ color: '#0369a1' }}>"{getRoomDisplayName(roomToDelete)}"</strong>?
              <br />
              <br />
              Esta acción no se puede deshacer y se eliminarán todos los mensajes.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRoomToDelete(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #0284c7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bfdbfe'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteChatRoom(roomToDelete)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Eliminar Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @media (min-width: 769px) {
          .chat-sidebar {
            display: flex !important;
          }

          .chat-main {
            display: flex !important;
          }

          .mobile-chat-header {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .chat-sidebar {
            max-width: 100% !important;
            border-right: none !important;
          }

          .mobile-chat-header {
            display: block !important;
          }

          .chat-main {
            padding-top: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatManagement;