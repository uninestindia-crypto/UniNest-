'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { ProductReview } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type ProductReviewsProps = {
    productId: number;
    initialReviews: ProductReview[];
};

function StarRating({ rating, setRating, readOnly = false, size = 'md' }: { rating: number, setRating?: (r: number) => void, readOnly?: boolean, size?: 'sm' | 'md' | 'lg' }) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                    <button
                        key={star}
                        type="button"
                        className={cn(
                            "transition-all duration-200",
                            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
                            size === 'sm' && "h-3 w-3",
                            size === 'md' && "h-5 w-5",
                            size === 'lg' && "h-8 w-8",
                        )}
                        onClick={() => !readOnly && setRating?.(star)}
                        onMouseEnter={() => !readOnly && setHoverRating(star)}
                        onMouseLeave={() => !readOnly && setHoverRating(0)}
                        disabled={readOnly}
                    >
                        <Star
                            className={cn(
                                "w-full h-full",
                                isFilled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 fill-muted/10"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export default function ProductReviews({ productId, initialReviews }: ProductReviewsProps) {
    const { user, supabase } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isFormOpen, setIsFormOpen] = useState(false);

    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const ratingCounts = reviews.reduce((acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const handleSubmitReview = async () => {
        if (!user || !supabase) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please login to leave a review.' });
            return;
        }
        if (!newReview.comment.trim()) {
            toast({ variant: 'destructive', title: 'Review Required', description: 'Please write a comment about the product.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('product_reviews')
                .insert({
                    product_id: productId,
                    user_id: user.id,
                    rating: newReview.rating,
                    comment: newReview.comment,
                })
                .select(`
          *,
          profile:user_id (
            full_name,
            avatar_url
          )
        `) // Assuming relationship is via user_id -> profiles.id, otherwise we rely on server refresh
                .single();

            if (error) throw error;

            // Optimistically update
            if (data) {
                // Safe cast as we know the structure or we refresh
                setReviews([data as any, ...reviews]);
                setNewReview({ rating: 5, comment: '' });
                setIsFormOpen(false);
                toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit review. You may have already reviewed this product.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8" id="reviews">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    Customer Reviews
                    <span className="text-lg font-normal text-muted-foreground">({reviews.length})</span>
                </h2>
                {!isFormOpen && (
                    <Button onClick={() => setIsFormOpen(true)} disabled={!user}>
                        Write a Review
                    </Button>
                )}
            </div>

            <div className="grid md:grid-cols-[300px_1fr] gap-8">
                {/* Summary Side */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                        <div className="text-5xl font-bold text-foreground">{averageRating}</div>
                        <div className="space-y-1">
                            <StarRating rating={Number(averageRating)} readOnly />
                            <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingCounts[star] || 0;
                            const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1 w-12 shrink-0">
                                        <span className="font-medium">{star}</span>
                                        <Star className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews List & Form */}
                <div className="space-y-8">
                    {isFormOpen && (
                        <div className="bg-muted/30 p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg">Write your review</h3>
                                <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Overall Rating</label>
                                    <StarRating
                                        rating={newReview.rating}
                                        setRating={(r) => setNewReview(prev => ({ ...prev, rating: r }))}
                                        size="lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Your Review</label>
                                    <Textarea
                                        placeholder="What did you like or dislike? What did you use this product for?"
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                        className="min-h-[100px] resize-none bg-background"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Review
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="group border-b pb-6 last:border-0">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-10 h-10 border">
                                            <AvatarImage src={review.profile?.avatar_url || undefined} />
                                            <AvatarFallback>{review.profile?.full_name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">
                                                        {review.profile?.full_name || 'Anonymous User'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <StarRating rating={review.rating} readOnly size="sm" />
                                                        <span className="text-xs text-muted-foreground">• {format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                                                    </div>
                                                </div>
                                                {/* Potential spot for verification badge if user bought it */}
                                            </div>

                                            <p className="text-muted-foreground leading-relaxed text-sm">
                                                {review.comment}
                                            </p>

                                            <div className="flex items-center gap-4 pt-2">
                                                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    Helpful
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
