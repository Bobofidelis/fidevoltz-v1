"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOrderMessages, useSendOrderMessage } from '@/lib/hooks/use-orders';
import { Send, Loader2 } from 'lucide-react';

interface OrderMessagingProps {
  orderId: string;
}

export function OrderMessaging({ orderId }: OrderMessagingProps) {
  const { data: session } = useSession();
  const { data: messages, isLoading } = useOrderMessages(orderId);
  const sendMessage = useSendOrderMessage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    sendMessage.mutate(
      { orderId, message: newMessage },
      {
        onSuccess: () => {
          setNewMessage('');
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg: any) => {
              const isOwnMessage = msg.senderId === session?.user?.id;
              const isAdmin = msg.sender.role === 'ADMIN';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.avatar || undefined} />
                    <AvatarFallback>
                      {msg.sender.name?.[0] || msg.sender.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {msg.sender.name || msg.sender.email}
                      </span>
                      {isAdmin && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </span>
                    </div>

                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : isAdmin
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessage.isPending}
              size="icon"
              className="h-auto"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
