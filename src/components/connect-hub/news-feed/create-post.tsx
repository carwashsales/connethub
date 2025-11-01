'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createPostAction, type CreatePostState } from '@/lib/actions';
import { useUser, useFirestore } from '@/firebase/index';
import type { UserProfile as User } from '@/lib/types';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {pending ? 'Posting...' : 'Post'}
    </Button>
  );
}

type CreatePostProps = {
  user: User;
};

export function CreatePost({ user }: CreatePostProps) {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const initialState: CreatePostState = { message: null, errors: {} };
  
  const [state, dispatch] = useActionState(createPostAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function handlePost() {
        if (state.message) {
            if (state.errors || state.message.includes('could not be published')) {
                toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive',
                });
                setLoading(false);
            } else if (state.message.includes('validated')) {
                const content = formRef.current?.content.value;
                if (content && authUser && db) {
                    setLoading(true);
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
                }
            }
        }
    }
    handlePost();
  }, [state, toast, authUser, db]);
  
  if (!authUser || !user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    dispatch(formData);
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
                aria-describedby="content-error"
                required
              />
              <div id="content-error" aria-live="polite" aria-atomic="true">
                {state.errors?.content &&
                  state.errors.content.map((error: string) => (
                    <p className="mt-2 text-sm text-destructive" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
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
