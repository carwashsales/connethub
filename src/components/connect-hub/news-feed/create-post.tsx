'use client';

import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/index';
import type { UserProfile as User } from '@/lib/types';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { moderateContent } from '@/ai/flows/automated-content-moderation';

const CreatePostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty.').max(500, 'Post content is too long.'),
});

type CreatePostProps = {
  user: User;
};

export function CreatePost({ user }: CreatePostProps) {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!authUser || !user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const content = formData.get('content') as string;

    const validatedFields = CreatePostSchema.safeParse({ content });

    if (!validatedFields.success) {
      toast({
        title: 'Error',
        description: validatedFields.error.flatten().fieldErrors.content?.[0],
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const moderationResult = await moderateContent({ text: content });
      if (!moderationResult.isAppropriate) {
        toast({
          title: 'Post Moderated',
          description: `Your post was deemed inappropriate. Reason: ${moderationResult.reason}`,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error moderating post:', error);
      toast({
        title: 'Error',
        description: 'Could not moderate post content.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (db) {
      try {
        await addDoc(collection(db, 'posts'), {
          authorId: authUser.uid,
          content: content,
          likes: 0,
          likedBy: [],
          comments: 0,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Success',
          description: 'Post created successfully.',
        });
        formRef.current?.reset();
      } catch (error) {
        console.error("Error writing document: ", error);
        toast({
          title: 'Database Error',
          description: 'Could not save post to the database.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else {
        setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={user?.avatar?.url} alt={user?.name} data-ai-hint={user?.avatar?.hint} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <Textarea
                name="content"
                placeholder="What's on your mind?"
                className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[60px]"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
             <Button variant="ghost" size="icon" className="text-muted-foreground" disabled>
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
            </Button>
            <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
