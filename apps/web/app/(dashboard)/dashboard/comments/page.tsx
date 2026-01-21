"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Eye,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Ban,
} from 'lucide-react';
import {
  useAdminComments,
  useUpdateComment,
  useReplyToComment,
  useDeleteComment,
  useWarnUser,
  useBanUser,
} from '@/lib/hooks/use-comments';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminCommentsPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [warnReason, setWarnReason] = useState('');
  const [banReason, setBanReason] = useState('');

  const { data, isLoading } = useAdminComments({
    status: statusFilter,
    flagged: flaggedOnly,
  });
  const updateComment = useUpdateComment();
  const replyToComment = useReplyToComment();
  const deleteComment = useDeleteComment();
  const warnUser = useWarnUser();
  const banUser = useBanUser();

  const comments = data?.comments || [];
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0, flagged: 0 };

  // Filter by search
  const filteredComments = comments.filter((comment: any) => {
    const search = searchQuery.toLowerCase();
    return (
      comment.content.toLowerCase().includes(search) ||
      comment.user?.name?.toLowerCase().includes(search) ||
      comment.user?.email?.toLowerCase().includes(search) ||
      comment.post?.title?.toLowerCase().includes(search)
    );
  });

  const handleApprove = (commentId: string) => {
    updateComment.mutate({ commentId, status: 'APPROVED' });
  };

  const handleReject = (commentId: string) => {
    updateComment.mutate({ commentId, status: 'REJECTED' });
  };

  const handleFlag = (commentId: string, flag: boolean) => {
    updateComment.mutate({ commentId, isFlagged: flag, flagReason: flag ? flagReason : undefined });
    setFlagReason('');
  };

  const handleReply = () => {
    if (!selectedComment || !adminReply.trim()) return;

    replyToComment.mutate(
      { commentId: selectedComment.id, reply: adminReply },
      {
        onSuccess: () => {
          setAdminReply('');
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment.mutate(commentId);
    }
  };

  const handleWarn = () => {
    if (!selectedComment || !warnReason.trim()) return;

    warnUser.mutate(
      { userId: selectedComment.userId, reason: warnReason },
      {
        onSuccess: () => {
          setWarnReason('');
        },
      }
    );
  };

  const handleBan = (ban: boolean) => {
    if (!selectedComment) return;

    if (ban && !banReason.trim()) {
      alert('Please provide a reason for banning');
      return;
    }

    banUser.mutate(
      { userId: selectedComment.userId, ban, reason: ban ? banReason : undefined },
      {
        onSuccess: () => {
          setBanReason('');
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      FLAGGED: { color: 'bg-orange-100 text-orange-800', icon: Flag },
    };

    const variant = variants[status] || variants.PENDING;
    const Icon = variant.icon;

    return (
      <Badge className={cn('text-xs', variant.color)} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Comments Management
        </h1>
        <p className="text-gray-600 mt-1">Moderate and manage all user comments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <p className="text-sm text-yellow-700">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
            <p className="text-sm text-green-700">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
            <p className="text-sm text-red-700">Rejected</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-800">{stats.flagged}</div>
            <p className="text-sm text-orange-700">Flagged</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PENDING')}
                className={statusFilter === 'PENDING' ? 'bg-yellow-600' : ''}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('APPROVED')}
                className={statusFilter === 'APPROVED' ? 'bg-green-600' : ''}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('REJECTED')}
                className={statusFilter === 'REJECTED' ? 'bg-red-600' : ''}
              >
                Rejected
              </Button>
              <Button
                variant={flaggedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFlaggedOnly(!flaggedOnly)}
                className={flaggedOnly ? 'bg-orange-600' : ''}
              >
                <Flag className="h-4 w-4 mr-1" />
                Flagged Only
              </Button>
            </div>

            <Input
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No comments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.map((comment: any) => (
                    <TableRow key={comment.id} className={comment.isFlagged ? 'bg-orange-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{comment.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{comment.user?.email}</p>
                          {comment.user?.isBanned && (
                            <Badge variant="destructive" className="text-xs mt-1">Banned</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{comment.content}</p>
                          {comment.isFlagged && (
                            <Badge variant="outline" className="text-xs mt-1 bg-orange-100 text-orange-800">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/projects/${comment.post?.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {comment.post?.title}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(comment.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedComment(comment);
                              setShowDetailsModal(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(comment.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment Details Modal */}
      {selectedComment && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* User Info */}
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{selectedComment.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{selectedComment.user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Warnings: {selectedComment.user?.warningCount || 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedComment.user?.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Info */}
              <div className="bg-blue-50 p-3 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Post: {selectedComment.post?.title}</p>
                    <p className="text-xs text-gray-500">Slug: {selectedComment.post?.slug}</p>
                  </div>
                  <a
                    href={`/projects/${selectedComment.post?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Post
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Comment Content */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Comment:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedComment.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Posted {formatDistanceToNow(new Date(selectedComment.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedComment.status === 'APPROVED' ? 'default' : 'outline'}
                      onClick={() => handleApprove(selectedComment.id)}
                      disabled={updateComment.isPending}
                      className={`flex-1 transition-all ${
                        selectedComment.status === 'APPROVED'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedComment.status === 'REJECTED' ? 'default' : 'outline'}
                      onClick={() => handleReject(selectedComment.id)}
                      disabled={updateComment.isPending}
                      className={`flex-1 transition-all ${
                        selectedComment.status === 'REJECTED'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                      }`}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Flag</label>
                  <div className="flex gap-2">
                    {selectedComment.isFlagged ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFlag(selectedComment.id, false)}
                        disabled={updateComment.isPending}
                        className="flex-1 hover:bg-gray-100 transition-all"
                      >
                        Unflag
                      </Button>
                    ) : (
                      <>
                        <Input
                          placeholder="Reason"
                          value={flagReason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlag(selectedComment.id, true)}
                          disabled={updateComment.isPending || !flagReason.trim()}
                          className="hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all"
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Reply */}
              {selectedComment.adminReply ? (
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm font-semibold mb-2">Admin Reply:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedComment.adminReply}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Reply</label>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={!adminReply.trim() || replyToComment.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 transition-all"
                  >
                    {replyToComment.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* User Moderation */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-sm">User Moderation</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Warn User</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Warning reason"
                      value={warnReason}
                      onChange={(e) => setWarnReason(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleWarn}
                      disabled={!warnReason.trim() || warnUser.isPending}
                      className="hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 transition-all"
                    >
                      {warnUser.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-1" />
                      )}
                      Warn
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ban User</label>
                  {selectedComment.user?.isBanned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBan(false)}
                      disabled={banUser.isPending}
                      className="w-full hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all"
                    >
                      {banUser.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Unbanning...
                        </>
                      ) : (
                        'Unban User'
                      )}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ban reason"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBan(true)}
                        disabled={!banReason.trim() || banUser.isPending}
                        className="hover:bg-red-700 transition-all"
                      >
                        {banUser.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Ban className="h-4 w-4 mr-1" />
                        )}
                        Ban
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
