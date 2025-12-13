
'use client';


import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Edit, Loader2, Package, Newspaper, UserPlus, Users, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { PostWithAuthor, Product, Profile } from '@/lib/types';
import ProductCard from '../marketplace/product-card';
import PostCard from '../feed/post-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import UserListCard from './user-list-card';

type ProfileWithCounts = Profile & {
  follower_count: { count: number }[];
  following_count: { count: number }[];
  isMyProfile: boolean;
}

type ProfileContent = {
  listings: Product[];
  posts: PostWithAuthor[];
  followers: Profile[];
  following: Profile[];
  purchases?: Product[];
  favorites: Product[];
}

type ProfileClientProps = {
  initialProfile: ProfileWithCounts;
  initialContent: ProfileContent;
}

export default function ProfileClient({ initialProfile, initialContent }: ProfileClientProps) {
  const { user, loading: authLoading, supabase } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileWithCounts>(initialProfile);
  const [followerCount, setFollowerCount] = useState(initialProfile.follower_count?.[0]?.count ?? 0);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>(initialContent.favorites || []);

  const router = useRouter();

  // Listen for favorite updates (from ProductCard) and refresh data
  useEffect(() => {
    const handleUpdate = () => {
      // Refetch data by refreshing the route
      router.refresh();
    }
    window.addEventListener('favorites-updated', handleUpdate);
    return () => window.removeEventListener('favorites-updated', handleUpdate);
  }, [router]);

  // Sync from props if they change (e.g. after router.refresh())
  useEffect(() => {
    if (initialContent.favorites) {
      setFavoriteProducts(initialContent.favorites);
    }
  }, [initialContent.favorites]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // isMyProfile is now passed down from the server component
  const isMyProfile = profile.isMyProfile;

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!user || isMyProfile || !supabase) return;

      const { count } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', user.id).eq('following_id', profile.id);
      setIsFollowing(count ? count > 0 : false);
    };
    checkFollowingStatus();
  }, [user, profile, isMyProfile, supabase]);


  const handleFollowToggle = async () => {
    if (!user || isMyProfile || !supabase) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to follow users.' });
      return;
    }

    setIsFollowLoading(true);

    if (isFollowing) {
      const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: profile.id });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not unfollow user.' });
      } else {
        setIsFollowing(false);
        setFollowerCount(c => c - 1);
      }
    } else {
      const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: profile.id });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not follow user.' });
      } else {
        setIsFollowing(true);
        setFollowerCount(c => c + 1);
        // Create notification for the followed user
        await supabase.rpc('create_new_follower_notification', {
          followed_id_param: profile.id,
          follower_id_param: user.id
        });
      }
    }
    setIsFollowLoading(false);
  }

  const handlePostAction = () => {
    toast({ title: 'Action not fully implemented in profile view.' });
  }

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
  const highlightCandidates = initialContent.listings.slice(0, 5).map((item) => ({
    id: `listing-${item.id}`,
    label: item.name || 'Listing',
    image: item.image_url,
  }));
  const displayHighlights = highlightCandidates.length > 0 ? highlightCandidates : [
    {
      id: 'profile-highlight',
      label: profileFullName,
      image: avatarUrl,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <div className="hidden md:block h-32 md:h-48 primary-gradient" />
        <CardContent className="p-4 md:p-6 md:pt-0">
          <div className="md:-mt-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
              <div className="flex items-center gap-6 md:items-end md:gap-8">
                <Avatar className="size-24 md:size-32 border-2 md:border-4 border-card">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-4xl">{profileFullName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 items-center justify-around text-center text-xs font-semibold uppercase text-muted-foreground md:hidden">
                  <div>
                    <p className="text-lg font-bold text-foreground">{postsCount}</p>
                    <p>Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{followerCount}</p>
                    <p>Followers</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{followingCount}</p>
                    <p>Following</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">{profileFullName}</h1>
                    <p className="text-muted-foreground">@{profile.handle}</p>
                    <p className="text-sm text-muted-foreground md:hidden">{listingsCount} listings · {postsCount} posts</p>
                  </div>
                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <span className="block text-xl font-semibold text-foreground">{postsCount}</span>
                      <span className="text-muted-foreground">Posts</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xl font-semibold text-foreground">{followerCount}</span>
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-xl font-semibold text-foreground">{followingCount}</span>
                      <span className="text-muted-foreground">Following</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    {isMyProfile ? (
                      <Link href="/settings">
                        <Button variant="outline">
                          <Edit className="mr-2 size-4" />
                          Edit Profile
                        </Button>
                      </Link>
                    ) : (
                      <Button onClick={handleFollowToggle} disabled={isFollowLoading || !user}>
                        {isFollowLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 md:hidden">
                  {isMyProfile ? (
                    <Link href="/settings">
                      <Button variant="outline" className="w-full">
                        <Edit className="mr-2 size-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={handleFollowToggle} disabled={isFollowLoading || !user} className="w-full">
                      {isFollowLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{profile.bio || 'No bio yet.'}</p>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="font-semibold text-foreground">{followingCount}</div>
                  Following
                  <div className="font-semibold text-foreground">{followerCount}</div>
                  Followers
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto rounded-xl border border-muted/40 bg-muted/30 px-4 py-3 md:hidden">
              {displayHighlights.map((item) => (
                <div key={item.id} className="flex min-w-[72px] flex-col items-center gap-2">
                  <Avatar className="size-16 border border-border">
                    <AvatarImage src={item.image || undefined} />
                    <AvatarFallback>{item.label?.[0]?.toUpperCase() || 'H'}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[72px] truncate text-center text-xs font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
            {isMyProfile && (
              <div className="mt-4 rounded-xl border border-muted/40 bg-muted/20 p-3 text-xs text-muted-foreground md:hidden">
                Professional dashboard previews and insights will appear here once available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b h-auto p-0 pb-1 rounded-none space-x-2 md:space-x-6">
          <TabsTrigger value="activity" className="rounded-full px-4 py-2 border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 shrink-0">
            <Newspaper className="mr-2 size-4" />Feed
          </TabsTrigger>
          <TabsTrigger value="listings" className="rounded-full px-4 py-2 border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 shrink-0">
            <Package className="mr-2 size-4" />Listings
          </TabsTrigger>
          {isMyProfile && (
            <>
              <TabsTrigger value="purchases" className="rounded-full px-4 py-2 border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 shrink-0">
                <ShoppingBag className="mr-2 size-4" />Purchases
              </TabsTrigger>
              <TabsTrigger value="favorites" className="rounded-full px-4 py-2 border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 shrink-0">
                <Heart className="mr-2 size-4" />Favorites
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="followers" className="rounded-full px-4 py-2 border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 shrink-0">
            <Users className="mr-2 size-4" />Followers
          </TabsTrigger>
          <TabsTrigger value="following" className="rounded-full px-4 py-2 border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 shrink-0">
            <Users className="mr-2 size-4" />Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6 animation-fade-in">
          <div className="space-y-4">
            {initialContent.posts.length > 0 ? (
              initialContent.posts.map(post => (
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
              <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-muted-foreground text-sm">When {profileFullName} shares updates, they'll appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="listings" className="mt-6 animation-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialContent.listings.length > 0 ? (
              initialContent.listings.map(listing => (
                <div key={listing.id} className="h-full">
                  <ProductCard
                    product={listing}
                    user={user}
                    onBuyNow={() => { }}
                    isBuying={false}
                    isRazorpayLoaded={false}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium">No active listings</h3>
                <p className="text-muted-foreground text-sm">Items listed for sale will appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="purchases" className="mt-6 animation-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialContent.purchases && initialContent.purchases.length > 0 ? (
              initialContent.purchases.map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="h-full">
                  <ProductCard
                    product={product}
                    user={user}
                    onBuyNow={() => { }} // Already purchased
                    isBuying={false}
                    isRazorpayLoaded={false}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium">No purchases yet</h3>
                <p className="text-muted-foreground text-sm">Items you buy will show up here.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="favorites" className="mt-6 animation-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Note: Favorites fetching would ideally verify IDs against backend to get latest data */}
            {/* For now, we rely on what we can get or show empty state if we haven't fetched all details yet. 
                     Typically, we'd need to fetch full product details for these favorite IDs. */}
            {favoriteProducts.length > 0 ? (
              favoriteProducts.map(product => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    user={user}
                    onBuyNow={() => { }}
                    isBuying={false}
                    isRazorpayLoaded={true} // Allow buying favorites
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium">No favorites yet</h3>
                <p className="text-muted-foreground text-sm">Tap the heart on items you like to save them here.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="followers" className="mt-6 animation-fade-in">
          <UserListCard users={initialContent.followers} emptyMessage="Not followed by any users yet." />
        </TabsContent>
        <TabsContent value="following" className="mt-6 animation-fade-in">
          <UserListCard users={initialContent.following} emptyMessage="Not following any users yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
