"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Loader2, X } from 'lucide-react';
import { useSendMessage } from '@/lib/hooks/use-conversations';

interface MessageComposerProps {
  recipientId: string;
  onMessageSent?: () => void;
}

export function MessageComposer({ recipientId, onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [showSubject, setShowSubject] = useState(false);

  const sendMessage = useSendMessage();

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage.mutate(
      {
        recipientId,
        subject: subject || undefined,
        message,
      },
      {
        onSuccess: () => {
          setMessage('');
          setSubject('');
          setShowSubject(false);
          onMessageSent?.();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-gray-50">
      <div className="space-y-3">
        {/* Subject field (optional) */}
        {showSubject ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject" className="text-sm">
                Subject (Optional)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSubject(false);
                  setSubject('');
                }}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              id="subject"
              placeholder="Message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-white"
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSubject(true)}
            className="text-xs text-gray-600 h-6"
          >
            + Add subject
          </Button>
        )}

        {/* Message input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Type your message... (Ctrl+Enter to send)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="resize-none bg-white"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {message.length} characters
            </span>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          </div>
        </div>
      </div>
    </div>
  );
}
