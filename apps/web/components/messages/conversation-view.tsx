"use client";

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Phone } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMarkAsRead } from '@/lib/hooks/use-conversations';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatar: string | null;
  };
  message: string;
  subject: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface ConversationViewProps {
  messages: Message[];
  currentUserId: string;
  participant: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatar: string | null;
  };
  isLoading?: boolean;
  whatsappNumber?: string;
}

export function ConversationView({
  messages,
  currentUserId,
  participant,
  isLoading,
  whatsappNumber,
}: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markAsRead = useMarkAsRead();
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    messages.forEach((msg) => {
      if (
        !msg.isRead &&
        msg.recipientId === currentUserId &&
        !markedIds.has(msg.id)
      ) {
        markAsRead.mutate(msg.id);
        setMarkedIds((prev) => new Set(prev).add(msg.id));
      }
    });
  }, [messages, currentUserId, markAsRead, markedIds]);

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {participant.name?.substring(0, 2).toUpperCase() ||
                  participant.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {participant.name || participant.email}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  participant.role === 'ADMIN'
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : "bg-blue-100 text-blue-800 border-blue-200"
                )}
              >
                {participant.role}
              </Badge>
            </div>
          </div>

          {whatsappNumber && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppClick}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isSentByMe = message.senderId === currentUserId;
            const showDate =
              index === 0 ||
              new Date(messages[index - 1].createdAt).toDateString() !==
                new Date(message.createdAt).toDateString();

            return (
              <div key={message.id}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                      {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                    </div>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={cn(
                    "flex gap-3",
                    isSentByMe ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender.avatar || undefined} />
                    <AvatarFallback
                      className={cn(
                        "text-white text-xs font-semibold",
                        isSentByMe
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-purple-500 to-purple-600"
                      )}
                    >
                      {message.sender.name?.substring(0, 2).toUpperCase() ||
                        message.sender.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "max-w-[70%] space-y-1",
                      isSentByMe ? "items-end" : "items-start"
                    )}
                  >
                    {message.subject && (
                      <div
                        className={cn(
                          "text-xs font-semibold",
                          isSentByMe ? "text-blue-700" : "text-purple-700"
                        )}
                      >
                        {message.subject}
                      </div>
                    )}

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 shadow-sm",
                        isSentByMe
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                          : "bg-gradient-to-br from-purple-50 to-purple-100 text-gray-900 border border-purple-200 rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        isSentByMe ? "justify-end text-blue-600" : "text-gray-500"
                      )}
                    >
                      <span>
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {isSentByMe && message.isRead && (
                        <span className="text-blue-600">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
