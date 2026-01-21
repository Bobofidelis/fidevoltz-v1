"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Phone, MessageCircle, Mail, Send, Loader2, Search, Users } from 'lucide-react';
import { useWhatsAppSettings } from '@/lib/hooks/use-conversations';
import { useUsers, useSendDirectMessage, useUserMessages } from '@/lib/hooks/use-admin-users';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { useEffect } from 'react';

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user.role === 'ADMIN';

  // Redirect non-admin users to user-messages page
  useEffect(() => {
    if (session && !isAdmin) {
      router.push('/dashboard/user-messages');
    }
  }, [session, isAdmin, router]);

  const { data: whatsappSettings } = useWhatsAppSettings();
  const { data: usersData } = useUsers({});
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const { data: messages, refetch: refetchMessages } = useUserMessages(selectedUserId || '');
  const sendMessage = useSendDirectMessage();

  const users = usersData?.users || [];
  const selectedUser = users.find((u: any) => u.id === selectedUserId);

  // Filter users by search
  const filteredUsers = users.filter((user: any) => {
    const search = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  const handleSendMessage = () => {
    if (!selectedUserId || !message.trim()) {
      toast.error('Message is required');
      return;
    }

    sendMessage.mutate(
      {
        userId: selectedUserId,
        subject: subject || undefined,
        message,
      },
      {
        onSuccess: () => {
          toast.success('Message sent successfully');
          setSubject('');
          setMessage('');
          setShowMessageModal(false);
          refetchMessages();
        },
      }
    );
  };

  // Only show admin view
  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  const handleWhatsAppClick = () => {
    if (whatsappSettings?.phoneNumber) {
      const cleanNumber = whatsappSettings.phoneNumber.replace(/\D/g, '');
      const msg = encodeURIComponent(`Hello! I'm ${session?.user.name || session?.user.email}`);
      window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
    }
  };

  // User view - WhatsApp contact
  if (!isAdmin) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact Admin
          </h1>
          <p className="text-gray-600 mt-1">Get in touch with our team</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              WhatsApp Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            {whatsappSettings?.enabled && whatsappSettings?.phoneNumber ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Chat with us on WhatsApp</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Click the button below to start a conversation with our admin team
                </p>
                <Button
                  onClick={handleWhatsAppClick}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Open WhatsApp Chat
                </Button>
                <p className="text-sm text-gray-500 mt-4">{whatsappSettings.phoneNumber}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  WhatsApp contact not available
                </h3>
                <p className="text-sm text-gray-500">Please contact the administrator for support</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin view - User messages management
  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            User Messages
          </h1>
          <p className="text-gray-600 mt-1">View and manage conversations with users</p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            WhatsApp Settings
          </Button>
        </Link>
      </div>

      <Card className="h-[calc(100vh-16rem)] flex overflow-hidden">
        {/* Users List */}
        <div className="w-full md:w-96 border-r flex-shrink-0 flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Users className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={cn(
                      "w-full p-4 text-left transition-colors hover:bg-gray-50",
                      selectedUserId === user.id && "bg-purple-50 border-l-4 border-purple-600"
                    )}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{user.name || user.email}</h4>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages View */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {selectedUser.name?.substring(0, 2).toUpperCase() || selectedUser.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedUser.name || selectedUser.email}</h3>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowMessageModal(true)} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages && messages.length > 0 ? (
                  messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {msg.subject && <h4 className="font-semibold text-purple-900">{msg.subject}</h4>}
                          <p className="text-xs text-purple-700">
                            From: {msg.sender.name || msg.sender.email}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6">
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a user</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Choose a user from the list to view message history and send messages
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Send Message Modal */}
      {showMessageModal && (
        <Dialog open onOpenChange={setShowMessageModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Message to {selectedUser?.name || selectedUser?.email}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder="Message subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
