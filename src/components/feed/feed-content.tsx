
'use client';

import { useState, useEffect, useCallback } from 'react';
import CreatePostForm from '@/components/feed/create-post-form';
import PostCard from '@/components/feed/post-card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { PostWithAuthor } from './post-card';
import dynamic from 'next/dynamic';

// Lazy load secondary UI element
const TrendingSidebar = dynamic(() => import('./trending-sidebar'), { ssr: false });

export default function FeedContent() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, supabase } = useAuth();
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id ( full_name, avatar_url, handle ),
        likes ( count ),
        comments ( id, content, created_at, profiles (full_name, avatar_url, handle) )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching posts', description: error.message });
      setLoading(false);
      return;
    }

    let finalPosts = (postsData as any[]) || [];

    if (user) {
      const { data: likedPosts } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);

      const { data: followedUsers } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      const likedPostIds = new Set(likedPosts?.map(p => p.post_id));
      const followedUserIds = new Set(followedUsers?.map(f => f.following_id));

      finalPosts = finalPosts.map(p => ({
        ...p,
        isLiked: likedPostIds.has(p.id),
        isFollowed: followedUserIds.has(p.user_id),
        comments: p.comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      }));

      // Prioritize posts from followed users
      finalPosts.sort((a, b) => {
        const aFollowed = followedUserIds.has(a.user_id);
        const bFollowed = followedUserIds.has(b.user_id);
        if (aFollowed && !bFollowed) return -1;
        if (!aFollowed && bFollowed) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

    } else {
      finalPosts = finalPosts.map(p => ({ ...p, isLiked: false, isFollowed: false }));
    }

    setPosts(finalPosts);
    setLoading(false);
  }, [supabase, toast, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (content: string) => {
    if (!user || !supabase) {
      toast({ variant: 'destructive', title: 'You must be logged in to post.' });
      return;
    }

    const { data: newPostData, error } = await supabase
      .from('posts')
      .insert({ content, user_id: user.id })
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id ( full_name, avatar_url, handle )
      `)
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error creating post', description: error.message });
    } else if (newPostData) {
      const newPost: PostWithAuthor = {
        ...newPostData,
        likes: [],
        comments: [],
        isLiked: false,
        isFollowed: false, // You follow yourself implicitly, but not needed for button
      };
      setPosts([newPost, ...posts]);
      toast({ title: 'Post created successfully!' });

      // Call the RPC to create notifications for followers
      const { error: rpcError } = await supabase.rpc('create_new_post_notifications', {
        post_id_param: newPost.id,
        post_author_id_param: user.id
      });
      if (rpcError) console.error("Error creating post notifications:", rpcError);
    }
  };

  const deletePost = async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error deleting post', description: error.message });
    } else {
      setPosts(posts.filter(p => p.id !== id));
      toast({ title: 'Post Deleted', description: 'Your post has been successfully removed.' });
    }
  };

  const editPost = async (id: number, newContent: string) => {
    if (!supabase) return;
    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({ content: newContent })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update the post.' });
    } else {
      setPosts(posts.map(p => p.id === id ? { ...p, content: updatedPost.content } : p));
      toast({ title: 'Post Updated', description: 'Your post has been successfully updated.' });
    }
  };

  const addComment = async (postId: number, commentContent: string) => {
    if (!user || !supabase) {
      toast({ variant: 'destructive', title: 'You must be logged in to comment.' });
      return;
    }

    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content: commentContent })
      .select('*, profiles (full_name, avatar_url, handle)')
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add comment.' });
    } else {
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: [newComment, ...p.comments] } : p));
    }
  };

  const updateLikes = async (postId: number, isLiked: boolean) => {
    if (!user || !supabase) {
      toast({ variant: 'destructive', title: 'You must be logged in to like posts.' });
      return;
    }

    if (isLiked) {
      // Unlike the post
      const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: "Could not unlike the post." });
      } else {
        setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: false, likes: p.likes.slice(1) } : p));
      }
    } else {
      // Like the post
      const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: "Could not like the post." });
      } else {
        setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: true, likes: [...p.likes, { count: 1 }] } : p));
      }
    }
  }

  const handleFollow = async (userIdToFollow: string, isCurrentlyFollowed: boolean): Promise<boolean> => {
    if (!user || !supabase) {
      toast({ variant: 'destructive', title: 'You must be logged in to follow users.' });
      return false;
    }

    if (isCurrentlyFollowed) {
      const { error } = await supabase.from('followers').delete().match({ follower_id: user.id, following_id: userIdToFollow });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: "Could not unfollow user." });
        return false;
      }
    } else {
      const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: userIdToFollow });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: "Could not follow user." });
        return false;
      } else {
        // Create a notification for the user who was followed
        await supabase.rpc('create_new_follower_notification', {
          followed_id_param: userIdToFollow,
          follower_id_param: user.id
        });
      }
    }
    // Update the followed state for all posts by this user in the feed
    setPosts(posts.map(p => p.user_id === userIdToFollow ? { ...p, isFollowed: !isCurrentlyFollowed } : p));
    return true;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Social Feed</h1>
        <div id="create-post">
          <CreatePostForm onPost={addPost} />
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={deletePost}
                onEdit={editPost}
                onComment={addComment}
                onLike={updateLikes}
                onFollow={handleFollow}
                currentUser={user}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12 bg-card rounded-2xl">
              <h2 className="text-xl font-semibold">No posts yet</h2>
              <p>Be the first to share something with the community!</p>
            </div>
          )}
        </div>
      </div>
      <aside className="hidden lg:block lg:col-span-1">
        <TrendingSidebar />
      </aside>
    </div>
  );
}
