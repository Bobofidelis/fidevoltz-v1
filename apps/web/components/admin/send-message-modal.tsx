"use client";

import { useState } from 'react';
import { useSendDirectMessage, useUserDetails } from '@/lib/hooks/use-admin-users';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';

interface SendMessageModalProps {
  userId: string;
  onClose: () => void;
}

export function SendMessageModal({ userId, onClose }: SendMessageModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const { data: user } = useUserDetails(userId);
  const sendMessage = useSendDirectMessage();

  const handleSend = async () => {
    if (!message.trim()) return;

    sendMessage.mutate(
      { userId, subject, message },
      {
        onSuccess: () => {
          setSubject('');
          setMessage('');
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message to {user?.name || user?.email}</DialogTitle>
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

          <div className="text-sm text-gray-600">
            The user will receive a notification about this message.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
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
  );
}
