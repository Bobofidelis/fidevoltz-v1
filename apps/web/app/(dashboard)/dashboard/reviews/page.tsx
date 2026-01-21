"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Star,
  Check,
  X,
  MessageSquare,
  Trash2,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import {
  useAdminReviews,
  useUpdateReviewStatus,
  useReplyToReview,
  useDeleteReview,
} from '@/lib/hooks/use-reviews';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useAdminReviews({ status: statusFilter });
  const updateStatus = useUpdateReviewStatus();
  const replyToReview = useReplyToReview();
  const deleteReview = useDeleteReview();

  const reviews = data?.reviews || [];
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };

  // Filter reviews by search
  const filteredReviews = reviews.filter((review: any) => {
    const search = searchQuery.toLowerCase();
    return (
      review.product.name.toLowerCase().includes(search) ||
      review.user.name?.toLowerCase().includes(search) ||
      review.comment.toLowerCase().includes(search)
    );
  });

  const handleApprove = (reviewId: string) => {
    updateStatus.mutate({ reviewId, status: 'APPROVED' });
  };

  const handleReject = (reviewId: string) => {
    updateStatus.mutate({ reviewId, status: 'REJECTED' });
  };

  const handleDelete = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview.mutate(reviewId);
    }
  };

  const handleReply = () => {
    if (!selectedReview || !replyText.trim()) return;

    replyToReview.mutate(
      { reviewId: selectedReview.id, reply: replyText },
      {
        onSuccess: () => {
          setShowReplyModal(false);
          setReplyText('');
          setSelectedReview(null);
        },
      }
    );
  };

  const openReplyModal = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setShowReplyModal(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };

    const variant = variants[status] || variants.PENDING;
    return (
      <Badge className={cn('text-xs', variant.color)} variant="outline">
        {variant.label}
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
          Reviews Management
        </h1>
        <p className="text-gray-600 mt-1">Manage and moderate product reviews</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Reviews</p>
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
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
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
                Pending ({stats.pending})
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
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review: any) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {review.product.image && (
                            <img
                              src={review.product.image}
                              alt={review.product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{review.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.user.avatar} />
                            <AvatarFallback>
                              {review.user.name?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{review.user.name || review.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {review.title && (
                            <p className="font-semibold text-sm mb-1">{review.title}</p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          {review.status !== 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(review.id)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {review.status !== 'REJECTED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(review.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openReplyModal(review)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Reply"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(review.id)}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <Dialog open onOpenChange={setShowReplyModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to Review</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Review Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <Avatar>
                    <AvatarImage src={selectedReview.user.avatar} />
                    <AvatarFallback>
                      {selectedReview.user.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{selectedReview.user.name}</span>
                      {renderStars(selectedReview.rating)}
                    </div>
                    {selectedReview.title && (
                      <p className="font-medium mb-1">{selectedReview.title}</p>
                    )}
                    <p className="text-sm text-gray-700">{selectedReview.comment}</p>
                  </div>
                </div>
              </div>

              {/* Reply Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Reply</label>
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReplyModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={!replyText.trim() || replyToReview.isPending}
              >
                {replyToReview.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reply'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
