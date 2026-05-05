import React from 'react';

interface SupportMessage {
  id: string;
  message: string;
  senderRole: 'admin' | 'user';
  senderId: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: SupportMessage;
  currentUserId: string;
}

export const MessageBubble = ({ message, currentUserId }: MessageBubbleProps) => {
  const isCurrentUser = message.senderId === currentUserId;
  const isAdmin = message.senderRole === 'admin';

  return (
    <div className={`flex ${
      isCurrentUser ? 'justify-end' : 'justify-start'
    }`}>
      <div
        className={`px-4 py-2 rounded max-w-xs ${
          isCurrentUser
            ? isAdmin
              ? 'bg-blue-600 text-white'
              : 'bg-green-600 text-white'
            : 'bg-gray-100 border'
        }`}
      >
        <p className="break-words">{message.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};