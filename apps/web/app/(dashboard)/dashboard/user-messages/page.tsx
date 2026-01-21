"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, MessageCircle, Mail, Send, Loader2 } from 'lucide-react';
import { useWhatsAppSettings } from '@/lib/hooks/use-conversations';
import { useUserMessages } from '@/lib/hooks/use-admin-users';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function UserMessagesPage() {
  const { data: session } = useSession();
  const { data: whatsappSettings } = useWhatsAppSettings();
  const { data: messages, isLoading, refetch } = useUserMessages(session?.user?.id || '');
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleWhatsAppClick = () => {
    if (whatsappSettings?.phoneNumber) {
      const cleanNumber = whatsappSettings.phoneNumber.replace(/\D/g, '');
      const msg = encodeURIComponent(`Hello! I'm ${session?.user.name || session?.user.email}`);
      window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
    }
  };

  const handleSendReply = async () => {
    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject || undefined,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast.success('Message sent to admin successfully');
      setSubject('');
      setMessage('');
      setShowReplyForm(false);
      refetch();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-gray-600 mt-1">View and reply to admin messages</p>
      </div>

      {/* Messages from Admin */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Conversation with Admin
            </CardTitle>
            <Button onClick={() => setShowReplyForm(!showReplyForm)} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {showReplyForm ? 'Cancel' : 'Reply to Admin'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reply Form */}
          {showReplyForm && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              <h4 className="font-semibold text-blue-900">Send Message to Admin</h4>
              
              <div className="space-y-2">
                <Label htmlFor="reply-subject">Subject (Optional)</Label>
                <Input
                  id="reply-subject"
                  placeholder="Message subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-message">Message *</Label>
                <Textarea
                  id="reply-message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendReply}
                  disabled={!message.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
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
                <Button variant="outline" onClick={() => setShowReplyForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Messages List */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg: any) => {
                const isFromAdmin = msg.sender?.role === 'ADMIN' || msg.senderId !== session?.user?.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      isFromAdmin
                        ? 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
                        : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {msg.subject && (
                          <h4 className={`font-semibold mb-1 ${isFromAdmin ? 'text-purple-900' : 'text-blue-900'}`}>
                            {msg.subject}
                          </h4>
                        )}
                        <p className={`text-xs ${isFromAdmin ? 'text-purple-700' : 'text-blue-700'}`}>
                          {isFromAdmin ? 'From Admin' : 'You'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mb-4">Start a conversation with admin</p>
              <Button onClick={() => setShowReplyForm(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send First Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Contact Card */}
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
            <div className="text-center py-8">
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
