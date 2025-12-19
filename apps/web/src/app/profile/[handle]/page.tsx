

import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileClient from '@/components/profile/profile-client';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Product, PostWithAuthor, Profile } from '@/lib/types';

type ProfilePageProps = {
  params: { handle: string }
}

async function getProfileData(handle: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Get the profile base data (without embeddings to avoid FK errors)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();

  if (profileError || !profileData) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  const userId = profileData.id;
  const isMyProfile = user ? user.id === profileData.id : false;

  // 2. Get related content and counts
  // For own profile: fetch ALL listings (including pending/rejected) so user can manage them
  // For other profiles: only fetch active listings
  const listingsQuery = supabase
    .from('products')
    .select('*, profiles:seller_id(full_name, avatar_url, handle, user_metadata)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  // Only filter by active status when viewing someone else's profile
  if (!isMyProfile) {
    listingsQuery.eq('status', 'active');
  }

  const [
    listingsRes,
    postsRes,
    followersRes,
    followingRes,
    followerCountRes,
    followingCountRes,
    likedPostsRes,
    ordersRes,
    favoritesRes
  ] = await Promise.all([
    listingsQuery,
    supabase.from('posts').select('*, likes:post_likes(count), comments:comments(count), profiles:user_id(full_name, avatar_url, handle)').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('followers').select('profiles!follower_id(*)').eq('following_id', userId),
    supabase.from('followers').select('profiles!following_id(*)').eq('follower_id', userId),
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    user ? supabase.from('likes').select('post_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
    isMyProfile
      ? supabase.from('orders')
        .select('*, order_items(product_id, products(*, seller:seller_id(full_name, avatar_url, handle, user_metadata)))')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    isMyProfile
      ? supabase.from('favorites')
        .select('product_id, products(*, seller:seller_id(full_name, avatar_url, handle, user_metadata))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] })
  ]);

  const likedPostIds = new Set(likedPostsRes.data?.map((p: any) => p.post_id) || []);

  // Transform orders into a list of products for the 'Purchases' tab
  const purchasedProducts = (ordersRes.data || []).flatMap((order: any) =>
    order.order_items.map((item: any) => ({
      ...item.products,
      seller: item.products.seller || {},
      purchaseDate: order.created_at,
    }))
  ).filter(p => !!p);

  // Transform favorites
  const favoriteProducts = (favoritesRes.data || []).map((f: any) => ({
    ...f.products,
    seller: f.products.seller || {}
  })).filter((p: any) => !!p);

  // Map the follower/following list results using the same logic as before (assuming the reverse FK works for these queries as they didn't error before)
  // If they do error, the page will load but lists will be empty.
  const followersList = (followersRes.data?.map((f: any) => f.profiles) as Profile[]) || [];
  const followingList = (followingRes.data?.map((f: any) => f.profiles) as Profile[]) || [];

  const content = {
    listings: (listingsRes.data as any[] || []).map(p => ({ ...p, seller: p.profiles })) as Product[],
    posts: (postsRes.data || []).map(p => ({ ...p, isLiked: likedPostIds.has(p.id) })) as PostWithAuthor[],
    followers: followersList,
    following: followingList,
    purchases: purchasedProducts as Product[],
    favorites: favoriteProducts as Product[],
  };

  // Get bio from auth.users table user_metadata
  const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
  const bio = authUser?.user_metadata?.bio || null;

  const fullProfile = {
    ...profileData,
    bio,
    isMyProfile,
    follower_count: [{ count: followerCountRes.count || 0 }],
    following_count: [{ count: followingCountRes.count || 0 }]
  };

  return { profile: fullProfile as any, content };
}


export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const supabase = createClient();
  const handle = params.handle;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('handle', handle)
    .single();

  if (!profile) {
    return {
      title: 'Profile not found | UniNest',
    };
  }

  // Fetch bio separately from auth user metadata
  const { data: authUser } = await supabase
    .from('users')
    .select('raw_user_meta_data')
    .eq('raw_app_meta_data->>handle', handle)
    .single();

  const bio = authUser?.raw_user_meta_data?.bio || `View the profile of ${profile.full_name} on UniNest.`;

  return {
    title: `${profile.full_name} (@${handle}) | UniNest`,
    description: bio,
  };
}


export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const profileData = await getProfileData(params.handle);

  if (!profileData) {
    notFound();
  }

  const { profile, content } = profileData;

  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileClient initialProfile={profile} initialContent={content} />
    </Suspense>
  );
}

