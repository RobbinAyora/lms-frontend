import React from 'react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled: boolean;
  loading: boolean;
}

export const MessageInput = ({ onSend, disabled, loading }: MessageInputProps) => {
  const [message, setMessage] = React.useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    await onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSend} className="p-4 border-t bg-blue-50 flex gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        className="flex-1 border p-3 rounded"
        placeholder="Type message..."
        rows={2}
      />
      <button
        onClick={handleSend}
        disabled={disabled || loading}
        className="bg-blue-600 text-white px-5 rounded"
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};