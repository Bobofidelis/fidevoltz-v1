"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductReviews, useSubmitReview } from "@/lib/hooks/use-reviews";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const { data, isLoading } = useProductReviews(productId);
  const submitReview = useSubmitReview(productId);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const reviews = data?.reviews || [];
  const stats = data?.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: {} };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      alert("Please sign in to submit a review");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      alert("Comment must be at least 10 characters");
      return;
    }

    submitReview.mutate(
      { rating, title: title.trim() || undefined, comment: comment.trim() },
      {
        onSuccess: () => {
          setRating(0);
          setTitle("");
          setComment("");
          setShowForm(false);
        },
      }
    );
  };

  const renderStars = (value: number, interactive = false, size = "w-5 h-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size,
              "cursor-pointer transition-colors",
              star <= (interactive ? (hoverRating || rating) : value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const dist = stats.ratingDistribution;
    const total = stats.totalReviews;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = dist[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-12 text-right">{star} star</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header & Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-sm text-gray-600">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>{renderRatingDistribution()}</div>
          </div>

          {/* Write Review Button */}
          {session ? (
            <div className="mt-6">
              {!showForm ? (
                <Button onClick={() => setShowForm(true)} className="w-full">
                  Write a Review
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setShowForm(false)} className="w-full">
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Please sign in to write a review
              </p>
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm && session && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                {renderStars(rating, true, "w-8 h-8")}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Review Title (Optional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={100}
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product (minimum 10 characters)"
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length} characters (minimum 10)
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitReview.isPending || rating === 0 || comment.trim().length < 10}
                className="w-full"
              >
                {submitReview.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                {/* Review Header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatar} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{review.user.name || "Anonymous"}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating, false, "w-4 h-4")}
                      <Badge variant="secondary" className="text-xs">
                        Verified Purchase
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h5 className="font-semibold mb-2">{review.title}</h5>
                )}
                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* Admin Reply */}
                {review.adminReply && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600">Store Response</Badge>
                      {review.repliedAt && (
                        <span className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(review.repliedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800">{review.adminReply}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
