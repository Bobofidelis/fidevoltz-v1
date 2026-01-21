"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageCircle, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Conversation {
  participant: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatar: string | null;
  };
  lastMessage: {
    message: string;
    createdAt: Date;
    isSentByMe: boolean;
  } | null;
  unreadCount: number;
  totalMessages: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedPartnerId: string | null;
  onSelectConversation: (partnerId: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedPartnerId,
  onSelectConversation,
  isLoading,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.participant.name?.toLowerCase().includes(searchLower) ||
      conv.participant.email.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.message.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Try a different search term'
                : 'Start a conversation to see it here'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.participant.id === selectedPartnerId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation.participant.id}
                  onClick={() => onSelectConversation(conversation.participant.id)}
                  className={cn(
                    "w-full p-4 text-left transition-colors hover:bg-gray-50",
                    isSelected && "bg-blue-50 border-l-4 border-blue-600"
                  )}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conversation.participant.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {conversation.participant.name?.substring(0, 2).toUpperCase() ||
                          conversation.participant.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "font-semibold truncate",
                            hasUnread ? "text-gray-900" : "text-gray-700"
                          )}>
                            {conversation.participant.name || conversation.participant.email}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              conversation.participant.role === 'ADMIN'
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            )}
                          >
                            {conversation.participant.role}
                          </Badge>
                        </div>
                        {hasUnread && (
                          <Badge className="bg-red-500 text-white text-xs px-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <>
                          <p className={cn(
                            "text-sm truncate mb-1",
                            hasUnread ? "font-medium text-gray-900" : "text-gray-600"
                          )}>
                            {conversation.lastMessage.isSentByMe && "You: "}
                            {conversation.lastMessage.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
