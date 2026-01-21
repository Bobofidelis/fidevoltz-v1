"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Reply, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface CommentItemProps {
  comment: any;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

export function CommentItem({ comment, currentUserId, onReply, onDelete, isReply = false }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setIsReplying(false);
      setReplyContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = comment.user?.role === 'ADMIN' || comment.isAdmin;
  const isOwner = comment.user?.id === currentUserId;

  return (
    <div className={cn("flex gap-4", isReply ? "mt-4" : "py-6 border-b border-slate-100 last:border-0")}>
      <Avatar className="h-10 w-10 border border-slate-200">
        <AvatarImage src={comment.user?.avatar} />
        <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{comment.user?.name || 'Anonymous'}</span>
            {isAdmin && (
              <Badge variant="default" className="bg-blue-600 text-[10px] h-5 px-1.5">
                Admin
              </Badge>
            )}
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          {isOwner && (
             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => onDelete(comment.id)}>
               <Trash2 className="h-4 w-4" />
             </Button>
          )}
        </div>
        
        <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </div>

        <div className="flex items-center gap-4 pt-1">
          {!isReply && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-slate-500 hover:text-blue-600"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>Cancel</Button>
              <Button size="sm" onClick={handleReply} disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-slate-100">
            {comment.replies.map((reply: any) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
