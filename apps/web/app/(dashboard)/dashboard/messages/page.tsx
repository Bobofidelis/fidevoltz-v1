"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageCircle, Mail, Send, Loader2, Search, Users } from 'lucide-react';
import { useWhatsAppSettings } from '@/lib/hooks/use-conversations';
import { useUsers, useSendDirectMessage, useUserMessages } from '@/lib/hooks/use-admin-users';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

// Non-admin view: Messages & Support
function NonAdminMessagesView({
  session,
  whatsappSettings,
}: {
  session: any;
  whatsappSettings: any;
}) {
  const { data: messages, isLoading, refetch } = useUserMessages(session?.user?.id || '');
  const [showCompose, setShowCompose] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleWhatsAppClick = () => {
    if (whatsappSettings?.phoneNumber) {
      const cleanNumber = whatsappSettings.phoneNumber.replace(/\D/g, '');
      const msg = encodeURIComponent(`Hello! I'm ${session?.user?.name || session?.user?.email || 'a user'}`);
      window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject.trim() || undefined,
          message: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast.success('Message sent to admin successfully');
      setNewSubject('');
      setNewMessage('');
      setShowCompose(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Messages & Support
        </h1>
        <p className="text-gray-600 mt-1">Get in touch with our team and view your messages</p>
      </div>

      <Tabs defaultValue="messages" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            My Messages
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            WhatsApp Support
          </TabsTrigger>
        </TabsList>

        {/* My Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Conversation with Admin
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct communications with the admin team
                  </p>
                </div>
                <Button
                  onClick={() => setShowCompose(!showCompose)}
                  size="sm"
                  variant={showCompose ? 'outline' : 'default'}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {showCompose ? 'Cancel' : 'Send Message'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compose Form */}
              {showCompose && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-3">
                  <h4 className="font-semibold text-blue-900 text-sm">Send Message to Admin</h4>
                  <div className="space-y-2">
                    <Label htmlFor="nonadmin-subject" className="text-xs">Subject (Optional)</Label>
                    <Input
                      id="nonadmin-subject"
                      placeholder="Message subject..."
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nonadmin-message" className="text-xs">Message *</Label>
                    <Textarea
                      id="nonadmin-message"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={4}
                      className="resize-none bg-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompose(false)}
                      disabled={isSending}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSending ? (
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
                  </div>
                </div>
              )}

              {/* Messages Feed */}
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Loading messages...</p>
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  {messages.map((msg: any) => {
                    const isFromAdmin = msg.sender?.role === 'ADMIN' || msg.senderId !== session?.user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3",
                          isFromAdmin ? "justify-start" : "justify-end"
                        )}
                      >
                        {isFromAdmin && (
                          <Avatar className="h-9 w-9 mt-1 flex-shrink-0">
                            <AvatarImage src={msg.sender?.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold">
                              AD
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl p-4 shadow-sm space-y-1.5",
                            isFromAdmin
                              ? "bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border border-purple-200 text-gray-900 rounded-tl-sm"
                              : "bg-gradient-to-br from-blue-50/80 to-blue-100/80 border border-blue-200 text-gray-900 rounded-tr-sm"
                          )}
                        >
                          <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs">
                                {isFromAdmin ? (msg.sender?.name || 'Admin') : 'You'}
                              </span>
                              {isFromAdmin && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-purple-100 text-purple-700 border-purple-300">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </span>
                          </div>

                          {msg.subject && (
                            <h5 className={cn(
                              "font-semibold text-sm",
                              isFromAdmin ? "text-purple-950" : "text-blue-950"
                            )}>
                              {msg.subject}
                            </h5>
                          )}

                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </p>
                        </div>

                        {!isFromAdmin && (
                          <Avatar className="h-9 w-9 mt-1 flex-shrink-0">
                            <AvatarImage src={session?.user?.avatar || session?.user?.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold">
                              {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'ME'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                    <MessageCircle className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
                    You haven't received any direct messages from the admin team yet. If you have questions, send a message below or reach out on WhatsApp.
                  </p>
                  <Button onClick={() => setShowCompose(true)} className="gap-2">
                    <Send className="h-4 w-4" />
                    Send a Message to Admin
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Support Tab */}
        <TabsContent value="whatsapp">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === 'ADMIN';

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

  // User view - Messages & WhatsApp contact
  if (!isAdmin) {
    return <NonAdminMessagesView session={session} whatsappSettings={whatsappSettings} />;
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
