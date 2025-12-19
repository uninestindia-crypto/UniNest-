
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Edit,
  Loader2,
  Package,
  Newspaper,
  UserPlus,
  Users,
  ShoppingBag,
  Heart,
  MapPin,
  Calendar,
  LinkIcon,
  Check,
  Trash2,
  RefreshCw,
  Trophy,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { PostWithAuthor, Product, Profile, CompetitionEntry, InternshipApplication } from '@/lib/types';
import ProductCard from '../marketplace/product-card';
import PostCard from '../feed/post-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import UserListCard from './user-list-card';
import { cn } from '@/lib/utils';
import { deleteOwnProduct, resubmitProduct } from '@/app/profile/user-actions';

type ProfileWithCounts = Profile & {
  follower_count: { count: number }[];
  following_count: { count: number }[];
  isMyProfile: boolean;
};

type ProfileContent = {
  listings: Product[];
  posts: PostWithAuthor[];
  followers: Profile[];
  following: Profile[];
  purchases?: Product[];
  favorites: Product[];
  competitionEntries?: CompetitionEntry[];
  internshipApplications?: InternshipApplication[];
};

type ProfileClientProps = {
  initialProfile: ProfileWithCounts;
  initialContent: ProfileContent;
};

export default function ProfileClient({
  initialProfile,
  initialContent,
}: ProfileClientProps) {
  const { user, loading: authLoading, supabase } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileWithCounts>(initialProfile);
  const [followerCount, setFollowerCount] = useState(
    initialProfile.follower_count?.[0]?.count ?? 0
  );
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>(
    initialContent.favorites || []
  );
  const [listings, setListings] = useState<Product[]>(initialContent.listings || []);
  const [processingProductId, setProcessingProductId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const handleUpdate = () => {
      router.refresh();
    };
    window.addEventListener('favorites-updated', handleUpdate);
    return () => window.removeEventListener('favorites-updated', handleUpdate);
  }, [router]);

  useEffect(() => {
    if (initialContent.favorites) {
      setFavoriteProducts(initialContent.favorites);
    }
  }, [initialContent.favorites]);

  useEffect(() => {
    if (initialContent.listings) {
      setListings(initialContent.listings);
    }
  }, [initialContent.listings]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isMyProfile = profile.isMyProfile;

  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    setProcessingProductId(productId);
    const result = await deleteOwnProduct(productId);
    setProcessingProductId(null);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Deleted', description: 'Listing has been removed.' });
      setListings(listings.filter(l => l.id !== productId));
    }
  };

  // Handle resubmit product
  const handleResubmitProduct = async (productId: number) => {
    setProcessingProductId(productId);
    const result = await resubmitProduct(productId);
    setProcessingProductId(null);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Resubmitted', description: 'Listing submitted for review.' });
      setListings(listings.map(l => l.id === productId ? { ...l, status: 'pending' } : l));
    }
  };

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!user || isMyProfile || !supabase) return;

      const { count } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)
        .eq('following_id', profile.id);
      setIsFollowing(count ? count > 0 : false);
    };
    checkFollowingStatus();
  }, [user, profile, isMyProfile, supabase]);

  const handleFollowToggle = async () => {
    if (!user || isMyProfile || !supabase) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please log in to follow users.',
      });
      return;
    }

    setIsFollowLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from('followers')
        .delete()
        .match({ follower_id: user.id, following_id: profile.id });
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not unfollow user.',
        });
      } else {
        setIsFollowing(false);
        setFollowerCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from('followers')
        .insert({ follower_id: user.id, following_id: profile.id });
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not follow user.',
        });
      } else {
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        await supabase.rpc('create_new_follower_notification', {
          followed_id_param: profile.id,
          follower_id_param: user.id,
        });
      }
    }
    setIsFollowLoading(false);
  };

  const handlePostAction = () => {
    toast({ title: 'Action not fully implemented in profile view.' });
  };

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-150px)] items-center justify-center">
        <Loader2 className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  const avatarUrl = profile.avatar_url;
  const profileFullName = profile.full_name || 'Anonymous User';
  const followingCount = profile.following_count?.[0]?.count ?? 0;
  const postsCount = initialContent.posts.length;
  const listingsCount = initialContent.listings.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Background */}
        <div className="h-48 md:h-64 lg:h-72 w-full overflow-hidden relative">
          <div className="absolute inset-0 primary-gradient opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMGMwLTItMi00LTItNHMtMiAyLTIgNCAyIDQgMiA0IDItMiAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        </div>

        {/* Profile Info Card */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-24 md:-mt-28">
            <Card className="glass-card border-0 shadow-2xl overflow-visible">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  {/* Avatar */}
                  <div className="relative -mt-20 md:-mt-24 flex-shrink-0 self-center md:self-auto">
                    <div className="relative">
                      <Avatar className="size-32 md:size-40 ring-4 ring-background shadow-xl">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                          {profileFullName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isMyProfile && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                          <Check className="size-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="space-y-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-headline tracking-tight">
                          {profileFullName}
                        </h1>
                        <Badge
                          variant="secondary"
                          className="self-center md:self-auto"
                        >
                          @{profile.handle}
                        </Badge>
                      </div>
                      {profile.bio && (
                        <p className="text-muted-foreground text-sm md:text-base max-w-xl mt-2">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8">
                      <StatItem value={postsCount} label="Posts" />
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden md:block"
                      />
                      <StatItem value={followerCount} label="Followers" />
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden md:block"
                      />
                      <StatItem value={followingCount} label="Following" />
                      <Separator
                        orientation="vertical"
                        className="h-8 hidden md:block"
                      />
                      <StatItem value={listingsCount} label="Listings" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 self-center md:self-end">
                    {isMyProfile ? (
                      <Link href="/settings">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto group hover:border-primary transition-colors"
                        >
                          <Edit className="mr-2 size-4 group-hover:text-primary transition-colors" />
                          Edit Profile
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading || !user}
                        className={cn(
                          'w-full sm:w-auto transition-all duration-300',
                          isFollowing
                            ? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground'
                            : 'bg-primary hover:bg-primary/90'
                        )}
                      >
                        {isFollowLoading ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : isFollowing ? (
                          <Check className="mr-2 size-4" />
                        ) : (
                          <UserPlus className="mr-2 size-4" />
                        )}
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="w-full flex-wrap justify-start bg-transparent border-b border-border h-auto p-0 pb-0 gap-1 rounded-none">
            <TabTriggerStyled value="activity" icon={Newspaper} label="Feed" />
            <TabTriggerStyled
              value="listings"
              icon={Package}
              label="Listings"
            />
            {isMyProfile && (
              <>
                <TabTriggerStyled
                  value="purchases"
                  icon={ShoppingBag}
                  label="Purchases"
                />
                <TabTriggerStyled
                  value="favorites"
                  icon={Heart}
                  label="Favorites"
                />
                <TabTriggerStyled
                  value="competitions"
                  icon={Trophy}
                  label="Competitions"
                />
                <TabTriggerStyled
                  value="internships"
                  icon={Briefcase}
                  label="Internships"
                />
              </>
            )}
            <TabTriggerStyled
              value="followers"
              icon={Users}
              label="Followers"
            />
            <TabTriggerStyled
              value="following"
              icon={Users}
              label="Following"
            />
          </TabsList>

          <div className="mt-8">
            <TabsContent
              value="activity"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="space-y-6">
                {initialContent.posts.length > 0 ? (
                  initialContent.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={user}
                      onDelete={handlePostAction}
                      onEdit={handlePostAction}
                      onComment={handlePostAction}
                      onLike={handlePostAction}
                      onFollow={async () => false}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Newspaper}
                    title="No posts yet"
                    description={`When ${profileFullName} shares updates, they'll appear here.`}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="listings"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.length > 0 ? (
                  listings.map((listing) => {
                    const isProcessing = processingProductId === listing.id;
                    return (
                      <div key={listing.id} className="h-full relative">
                        {/* Status badge overlay for owner's listings */}
                        {isMyProfile && listing.status && listing.status !== 'active' && (
                          <div className="absolute top-2 left-2 z-10">
                            {listing.status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm">
                                ⏳ Pending Review
                              </Badge>
                            )}
                            {listing.status === 'rejected' && (
                              <Badge className="bg-red-100 text-red-800 border-red-300 shadow-sm">
                                ❌ Rejected
                              </Badge>
                            )}
                          </div>
                        )}
                        {isMyProfile && listing.status === 'active' && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-green-100 text-green-800 border-green-300 shadow-sm">
                              ✓ Live
                            </Badge>
                          </div>
                        )}
                        <ProductCard
                          product={listing}
                          user={user}
                          onBuyNow={() => { }}
                          isBuying={false}
                          isRazorpayLoaded={false}
                        />
                        {/* Action buttons for owner */}
                        {isMyProfile && (
                          <div className="mt-2 flex gap-2">
                            <Link href={`/vendor/products/${listing.id}/edit`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Edit className="size-3 mr-1" /> Edit
                              </Button>
                            </Link>
                            {/* Resubmit button for rejected listings */}
                            {listing.status === 'rejected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleResubmitProduct(listing.id)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="size-3 mr-1 animate-spin" />
                                ) : (
                                  <RefreshCw className="size-3 mr-1" />
                                )}
                                Resubmit
                              </Button>
                            )}
                            {/* Delete button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteProduct(listing.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Package}
                      title={isMyProfile ? "You haven't listed anything yet" : "No active listings"}
                      description={isMyProfile ? "Create your first listing to sell on the marketplace." : "Items listed for sale will appear here."}
                    />
                    {isMyProfile && (
                      <div className="text-center mt-4">
                        <Link href="/marketplace/new">
                          <Button>Create Listing</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="purchases"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialContent.purchases &&
                  initialContent.purchases.length > 0 ? (
                  initialContent.purchases.map((product, idx) => (
                    <div key={`${product.id}-${idx}`} className="h-full">
                      <ProductCard
                        product={product}
                        user={user}
                        onBuyNow={() => { }}
                        isBuying={false}
                        isRazorpayLoaded={false}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={ShoppingBag}
                      title="No purchases yet"
                      description="Items you buy will show up here."
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="favorites"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProducts.length > 0 ? (
                  favoriteProducts.map((product) => (
                    <div key={product.id} className="h-full">
                      <ProductCard
                        product={product}
                        user={user}
                        onBuyNow={() => { }}
                        isBuying={false}
                        isRazorpayLoaded={true}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      icon={Heart}
                      title="No favorites yet"
                      description="Tap the heart on items you like to save them here."
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="followers"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <UserListCard
                users={initialContent.followers}
                emptyMessage="Not followed by any users yet."
              />
            </TabsContent>

            <TabsContent
              value="following"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <UserListCard
                users={initialContent.following}
                emptyMessage="Not following any users yet."
              />
            </TabsContent>

            {/* Competition Entries Tab */}
            <TabsContent
              value="competitions"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="space-y-4">
                {initialContent.competitionEntries && initialContent.competitionEntries.length > 0 ? (
                  initialContent.competitionEntries.map((entry) => {
                    const competition = entry.competitions;
                    const isWinner = competition.winner_id === entry.user_id;
                    const isPastDeadline = new Date(competition.deadline) < new Date();

                    return (
                      <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Competition Image */}
                            {competition.image_url && (
                              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={competition.image_url}
                                  alt={competition.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-lg truncate">{competition.title}</h3>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Trophy className="size-3.5" />
                                      Prize: ₹{competition.prize.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="size-3.5" />
                                      {new Date(competition.deadline).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isWinner && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                      🏆 Winner
                                    </Badge>
                                  )}
                                  {!isWinner && isPastDeadline && (
                                    <Badge variant="secondary">Completed</Badge>
                                  )}
                                  {!isPastDeadline && (
                                    <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-muted-foreground">
                                  Entered on {new Date(entry.created_at).toLocaleDateString()}
                                </p>
                                <Link href={`/workspace/competitions/${competition.id}`}>
                                  <Button variant="ghost" size="sm" className="text-primary">
                                    View Details <ExternalLink className="size-3 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={Trophy}
                    title="No competition entries"
                    description="Competitions you enter will appear here."
                  />
                )}
              </div>
            </TabsContent>

            {/* Internship Applications Tab */}
            <TabsContent
              value="internships"
              className="animate-fade-in-up m-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="space-y-4">
                {initialContent.internshipApplications && initialContent.internshipApplications.length > 0 ? (
                  initialContent.internshipApplications.map((application) => {
                    const internship = application.internships;
                    const isPastDeadline = new Date(internship.deadline) < new Date();

                    const statusBadge = {
                      pending: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⏳ Pending</Badge>,
                      approved: <Badge className="bg-green-100 text-green-800 border-green-300">✓ Approved</Badge>,
                      rejected: <Badge className="bg-red-100 text-red-800 border-red-300">❌ Rejected</Badge>,
                    }[application.status] || <Badge variant="secondary">{application.status}</Badge>;

                    return (
                      <Card key={application.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Internship Image */}
                            {internship.image_url && (
                              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={internship.image_url}
                                  alt={internship.role}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-lg truncate">{internship.role}</h3>
                                  <p className="text-sm text-muted-foreground">{internship.company}</p>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="size-3.5" />
                                      ₹{internship.stipend.toLocaleString()}/month
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="size-3.5" />
                                      {internship.location}
                                    </span>
                                  </div>
                                </div>

                                {statusBadge}
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-muted-foreground">
                                  Applied on {new Date(application.created_at).toLocaleDateString()}
                                </p>
                                <Link href={`/workspace/internships/${internship.id}`}>
                                  <Button variant="ghost" size="sm" className="text-primary">
                                    View Details <ExternalLink className="size-3 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No internship applications"
                    description="Internships you apply for will appear here."
                  />
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center group cursor-default">
      <p className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
        {value.toLocaleString()}
      </p>
      <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

function TabTriggerStyled({
  value,
  icon: Icon,
  label,
}: {
  value: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="relative px-4 py-3 text-sm font-medium text-muted-foreground transition-all data-[state=active]:text-primary data-[state=active]:font-semibold border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
    >
      <Icon className="mr-2 size-4 inline-block" />
      <span className="hidden sm:inline">{label}</span>
    </TabsTrigger>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
      <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
        <Icon className="size-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}
