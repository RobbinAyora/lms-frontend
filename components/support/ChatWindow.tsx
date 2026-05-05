import React from 'react';

interface ChatWindowProps {
  messages: any[];
  loading: boolean;
}

export const ChatWindow = ({ messages, loading }: ChatWindowProps) => {
  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-blue-500">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No messages yet. Start the conversation!</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m: any) => (
        <div key={m.id} className={`flex ${m.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
          <div className={`px-4 py-2 rounded max-w-xs ${m.senderRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 border'}`}>
            <p className="break-words">{m.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
      <div ref={/* bottomRef will be passed from parent */} />
    </div>
  );
};