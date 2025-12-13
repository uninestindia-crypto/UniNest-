

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

  // 1. Get the profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*, follower_count:followers!following_id(count), following_count:followers!follower_id(count)')
    .eq('handle', handle)
    .single();

  if (profileError || !profileData) {
    return null;
  }

  const userId = profileData.id;

  // 2. Get related content
  const [
    listingsRes,
    postsRes,
    followersRes,
    followingRes,
    likedPostsRes
  ] = await Promise.all([
    supabase.from('products').select('*, profiles:seller_id(full_name)').eq('seller_id', userId),
    supabase.from('posts').select(`*, profiles:user_id ( full_name, avatar_url, handle ), likes ( count ), comments ( id )`).eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('followers').select('profiles!follower_id(*)').eq('following_id', userId),
    supabase.from('followers').select('profiles!following_id(*)').eq('follower_id', userId),
    user ? supabase.from('likes').select('post_id').eq('user_id', user.id) : Promise.resolve({ data: [] })
  ]);

  const likedPostIds = new Set(likedPostsRes.data?.map(p => p.post_id) || []);

  const content = {
    listings: (listingsRes.data as any[] || []).map(p => ({ ...p, seller: p.profiles })) as Product[],
    posts: (postsRes.data || []).map(p => ({ ...p, isLiked: likedPostIds.has(p.id) })) as PostWithAuthor[],
    followers: (followersRes.data?.map((f: any) => f.profiles) as Profile[]) || [],
    following: (followingRes.data?.map((f: any) => f.profiles) as Profile[]) || [],
    purchases: [], // Placeholder for future implementation
    favorites: [], // Placeholder for future implementation
  };

  const isMyProfile = user ? user.id === profileData.id : false;

  // Get bio from auth.users table user_metadata
  const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
  const bio = authUser?.user_metadata?.bio || null;

  const fullProfile = { ...profileData, bio, isMyProfile };

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

