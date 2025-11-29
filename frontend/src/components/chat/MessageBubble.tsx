'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar } from '@/components/ui';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0 mr-3">
            <Avatar
              src={message.sender.avatar}
              alt={message.sender.name}
              size="sm"
            />
          </div>
        )}
        
        {/* Mensaje */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Nombre del remitente */}
          {showAvatar && !isOwn && (
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2 px-3">
              {message.sender.name}
            </span>
          )}

          {/* Burbuja del mensaje */}
          <div
            className={`relative px-5 py-3 rounded-2xl shadow-md ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-bl-md'
            }`}
          >
            {/* Contenido del mensaje */}
            {message.type === 'text' && (
              <p className={`text-base font-normal leading-relaxed chat-message whitespace-pre-wrap ${
                isOwn ? 'text-white' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {message.content}
              </p>
            )}
            
            {message.type === 'image' && (
              <div className="space-y-2">
                {message.attachments?.map((attachment, index) => (
                  <img
                    key={index}
                    src={attachment.url}
                    alt={attachment.originalName}
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '200px' }}
                  />
                ))}
                {message.content && (
                  <p className="text-sm mt-2 chat-message">
                    {message.content}
                  </p>
                )}
              </div>
            )}
            
            {message.type === 'file' && (
              <div className="space-y-2">
                {message.attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs opacity-75">
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <a
                      href={attachment.url}
                      download={attachment.originalName}
                      className="flex-shrink-0 text-xs underline hover:no-underline"
                    >
                      Descargar
                    </a>
                  </div>
                ))}
                {message.content && (
                  <p className="text-sm mt-2 chat-message">
                    {message.content}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Hora del mensaje */}
          <span className={`text-xs font-medium mt-1 px-3 ${
            isOwn
              ? 'text-blue-100 text-right'
              : 'text-gray-600 dark:text-gray-400 text-left'
          }`}>
            {formatTime(message.createdAt)}
          </span>
        </div>
        
        {/* Espaciador para mensajes propios */}
        {showAvatar && isOwn && (
          <div className="flex-shrink-0 ml-3 w-8" />
        )}
      </div>
    </motion.div>
  );
}