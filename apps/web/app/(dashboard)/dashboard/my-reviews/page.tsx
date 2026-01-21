"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MyReviewsPage() {
  const { data: session } = useSession();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const response = await fetch('/api/user/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-5 w-5',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string; description: string }> = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        label: 'Pending Review',
        description: 'Your review is awaiting admin approval'
      },
      APPROVED: { 
        color: 'bg-green-100 text-green-800 border-green-300', 
        label: 'Approved',
        description: 'Your review is now visible to everyone'
      },
      REJECTED: { 
        color: 'bg-red-100 text-red-800 border-red-300', 
        label: 'Rejected',
        description: 'Your review was not approved'
      },
    };

    const variant = variants[status] || variants.PENDING;
    return (
      <div className="flex flex-col gap-1">
        <Badge className={cn('text-xs w-fit', variant.color)} variant="outline">
          {variant.label}
        </Badge>
        <p className="text-xs text-gray-500">{variant.description}</p>
      </div>
    );
  };

  const stats = {
    total: reviews?.length || 0,
    pending: reviews?.filter((r: any) => r.status === 'PENDING').length || 0,
    approved: reviews?.filter((r: any) => r.status === 'APPROVED').length || 0,
    rejected: reviews?.filter((r: any) => r.status === 'REJECTED').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Reviews
        </h1>
        <p className="text-gray-600 mt-1">View all your product reviews and their status</p>
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

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">You haven't written any reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Purchase a product and share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Product Info */}
                  <div className="flex items-start gap-4 mb-4">
                    {review.product.image && (
                      <img
                        src={review.product.image}
                        alt={review.product.name}
                        className="h-20 w-20 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{review.product.name}</h3>
                      <div className="flex items-center gap-3 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {getStatusBadge(review.status)}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-3">
                    {review.title && (
                      <h4 className="font-semibold text-gray-900">{review.title}</h4>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>

                    {/* Admin Reply */}
                    {review.adminReply && (
                      <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-blue-900 text-sm">
                              Admin Response
                              {review.repliedAt && (
                                <span className="text-xs text-blue-600 ml-2 font-normal">
                                  {formatDistanceToNow(new Date(review.repliedAt), { addSuffix: true })}
                                </span>
                              )}
                            </p>
                            <p className="text-gray-700 mt-1">{review.adminReply}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
