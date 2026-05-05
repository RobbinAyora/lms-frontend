import React from 'react';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: string;
  latestMessage?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface TicketListProps {
  tickets: SupportTicket[];
  selectedTicketId: string | null;
  onTicketSelect: (ticket: SupportTicket) => void;
  role: string;
}

export const TicketList = ({ tickets, selectedTicketId, onTicketSelect, role }: TicketListProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {tickets.length === 0 ? (
        <p className="p-4 text-gray-500">No tickets found</p>
      ) : (
        tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onTicketSelect(ticket)}
            className={`w-full text-left p-4 border-b hover:bg-gray-50 ${
              selectedTicketId === ticket.id
                ? 'bg-blue-50 border-l-4 border-blue-600'
                : ''
            }`}
          >
            <div className="flex flex-col">
              <p className="font-semibold">{ticket.subject}</p>
              {role === 'ADMIN' && ticket.user ? (
                <p className="text-xs text-gray-500">{ticket.user.name}</p>
              ) : null}
              <p className="text-xs">
                {ticket.status === 'open' ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Open
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    Closed
                  </span>
                )}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  );
};