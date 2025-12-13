
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export type PostWithAuthor = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  likes: { count: number }[];
  comments: any[]; // Define a proper comment type later
  profiles: {
    full_name: string;
    avatar_url: string;
    handle: string;
  } | null;
  isLiked: boolean;
  isFollowed: boolean;
};


type Comment = {
  id: number;
  content: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    handle: string;
  }
};

type PostCardProps = {
  post: PostWithAuthor;
  onDelete: (id: number) => void;
  onEdit: (id: number, newContent: string) => void;
  onComment: (postId: number, commentContent: string) => void;
  onLike: (postId: number, isLiked: boolean) => void;
  onFollow: (userId: string, isFollowed: boolean) => Promise<boolean>;
  currentUser: User | null;
};

export default function PostCard({ post, onDelete, onEdit, onComment, onLike, onFollow, currentUser: user }: PostCardProps) {
  const [editedContent, setEditedContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFollowed, setIsFollowed] = useState(post.isFollowed);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const role = user?.user_metadata?.role;
  const isAuthor = user?.id === post.user_id;
  const isAdmin = role === 'admin';
  const canEditOrDelete = isAuthor || isAdmin;

  const handleLike = () => {
    onLike(post.id, post.isLiked);
  };

  const handleFollow = async () => {
    if (isAuthor || !user) return;
    setIsFollowLoading(true);
    const success = await onFollow(post.user_id, isFollowed);
    if (success) {
      setIsFollowed(!isFollowed);
    }
    setIsFollowLoading(false);
  }

  const handleSaveEdit = () => {
    onEdit(post.id, editedContent);
    setShowEditDialog(false);
  };
  
  const handleDeleteConfirm = () => {
    onDelete(post.id);
    setShowDeleteDialog(false);
  }


  const handleAddComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  }

  const getFormattedTimestamp = () => {
    try {
      return formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
    } catch (e) {
      return post.created_at;
    }
  }

  const authorName = post.profiles?.full_name || 'Anonymous User';
  const authorHandle = post.profiles?.handle || 'anonymous';
  const authorAvatar = post.profiles?.avatar_url || 'https://picsum.photos/seed/anon/40/40';

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
       <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Link href={`/profile/${authorHandle}`}>
          <Avatar>
            <AvatarImage src={authorAvatar} alt={`${authorName}'s avatar`} data-ai-hint="person face" />
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Link href={`/profile/${authorHandle}`} className="hover:underline">
                  <div>
                    <p className="font-semibold">{authorName}</p>
                    <p className="text-sm text-muted-foreground">@{authorHandle}</p>
                  </div>
              </Link>
              {!isAuthor && user && (
                 <>
                  <span className="text-muted-foreground">&middot;</span>
                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleFollow} disabled={isFollowLoading}>
                      {isFollowed ? "Following" : "Follow"}
                  </Button>
                 </>
              )}
            </div>
             <p className="text-sm text-muted-foreground">{getFormattedTimestamp()}</p>
          </div>
        </div>
        {canEditOrDelete && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                    <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                    <Edit className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onSelect={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Post</DialogTitle>
                  <DialogDescription>
                    Make changes to your post. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="edit-post" className="sr-only">Edit Post</Label>
                  <Textarea 
                    id="edit-post"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveEdit}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Delete Alert Dialog */}
             <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0">
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4 pt-2">
          <div className='flex items-center justify-start gap-4'>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-muted-foreground"
                  onClick={handleLike}
                  disabled={!user}
              >
                  <Heart className={`size-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{post.likes?.length || 0}</span>
              </Button>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-muted-foreground"
                  onClick={() => setShowComments(!showComments)}
              >
                  <MessageCircle className="size-4" />
                  <span>{post.comments.length}</span>
              </Button>
          </div>
          {showComments && (
              <div className='w-full pt-4 space-y-4'>
                  <Separator />
                  {user ? (
                    <div className="flex items-start gap-2">
                        <Avatar className="size-8">
                            <AvatarImage src={user.user_metadata?.avatar_url || 'https://picsum.photos/id/237/40/40'} alt="Your avatar" />
                            <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-2">
                              <Textarea
                                placeholder="Write a comment..."
                                className="min-h-[60px] w-full resize-none"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>Reply</Button>
                            </div>
                        </div>
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground text-center">
                       <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> to join the conversation.
                    </p>
                  )}
                  {post.comments.map((comment: Comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                           <Avatar className="size-8">
                              <AvatarImage src={comment.profiles.avatar_url} alt={`${comment.profiles.full_name}'s avatar`} data-ai-hint="person face"/>
                              <AvatarFallback>{comment.profiles.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 rounded-lg bg-muted px-3 py-2">
                              <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">{comment.profiles.full_name}</p>
                                  <p className="text-xs text-muted-foreground">@{comment.profiles.handle}</p>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </CardFooter>
    </Card>
  );
}
