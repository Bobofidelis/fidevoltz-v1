"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Send, User, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface CommentSectionProps {
  postSlug: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  isAdmin: boolean;
  adminReply?: string;
  parentId?: string;
  user?: {
    id: true;
    name?: string;
    avatar?: string;
  };
  replies?: Comment[];
}

// Helper function for initials
const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Separate CommentItem component to prevent re-creation
function CommentItem({
  comment,
  depth = 0,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  isPending,
  session,
}: {
  comment: Comment;
  depth?: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmitReply: (parentId: string) => void;
  isPending: boolean;
  session: any;
}) {
  const maxDepth = 5;
  const isNested = depth > 0;
  const canReply = depth < maxDepth;

  return (
    <div className={`${isNested ? 'ml-8 mt-4 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex items-start gap-4">
        <Avatar className={`${isNested ? 'h-8 w-8' : 'h-10 w-10'} flex-shrink-0`}>
          <AvatarImage src={comment.user?.avatar} />
          <AvatarFallback className="bg-blue-100 text-blue-700">
            {getInitials(comment.user?.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-gray-900 ${isNested ? 'text-sm' : ''}`}>
              {comment.user?.name || 'Anonymous'}
            </span>
            {comment.isAdmin && (
              <Badge variant="default" className="bg-purple-600 text-xs">
                Admin
              </Badge>
            )}
            <span className={`text-gray-500 ${isNested ? 'text-xs' : 'text-sm'}`}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          <p className={`text-gray-700 whitespace-pre-wrap ${isNested ? 'text-sm' : ''}`}>
            {comment.content}
          </p>

          {comment.adminReply && (
            <div className="mt-3 bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-purple-600 text-xs">
                  Admin Reply
                </Badge>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.adminReply}</p>
            </div>
          )}

          {session && canReply && (
            <div className="pt-1">
              {replyingTo === comment.id ? (
                <div className="space-y-2 mt-2">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim() || isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3 mr-1" />
                          Post Reply
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs h-7 px-2"
                >
                  <CornerDownRight className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleSubmitReply={handleSubmitReply}
                  isPending={isPending}
                  session={session}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`);
      if (response.ok) {
        const result = await response.json();
        setComments(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and polling
  // Initial fetch and polling
  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isPending) return;

    setIsPending(true);
    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isPending) return;

    setIsPending(true);
    try {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsPending(false);
    }
  };

  const topLevelComments = comments.filter((c) => !c.parentId);
  const commentCount = comments.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Discussion
          <Badge variant="outline" className="ml-2">
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </Badge>
        </h2>
      </div>

      {session ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave a Comment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isPending}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {session.user.role === 'ADMIN'
                  ? 'Your comment will be posted immediately.'
                  : 'Your comment will be reviewed before being published.'}
              </p>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-center text-gray-700">
              <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                Sign in
              </Link>{' '}
              to join the discussion and leave a comment.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : commentCount === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No comments yet</p>
              <p className="text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <Card key={comment.id} className="overflow-hidden">
              <CardContent className="p-6">
                <CommentItem
                  comment={comment}
                  depth={0}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleSubmitReply={handleSubmitReply}
                  isPending={isPending}
                  session={session}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
