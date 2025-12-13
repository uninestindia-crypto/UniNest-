
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

type CreatePostFormProps = {
  onPost: (content: string) => void;
};

export default function CreatePostForm({ onPost }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content);
      setContent('');
    }
  };

  if (!user) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 text-center text-muted-foreground">
          <p>
            <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> or <Link href="/signup" className="text-primary font-semibold hover:underline">sign up</Link> to create a post.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.user_metadata?.avatar_url || 'https://picsum.photos/id/237/40/40'} alt="Your avatar" />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-2">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] w-full resize-none border-0 px-0 shadow-none focus-visible:ring-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!content.trim()}>Post</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
