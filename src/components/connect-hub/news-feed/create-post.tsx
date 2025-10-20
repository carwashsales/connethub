'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createPostAction, type CreatePostState } from '@/lib/actions';
import type { User } from '@/lib/data';
import { Paperclip, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      <Send className="mr-2 h-4 w-4" />
      {pending ? 'Posting...' : 'Post'}
    </Button>
  );
}

type CreatePostProps = {
  user: User;
};

export function CreatePost({ user }: CreatePostProps) {
  const initialState: CreatePostState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createPostAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.errors || state.message.includes('could not be published')) {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: state.message,
        });
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <form action={dispatch} ref={formRef}>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={user.avatar.url} alt={user.name} data-ai-hint={user.avatar.hint} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <Textarea
                name="content"
                placeholder="What's on your mind?"
                className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[60px]"
                aria-describedby="content-error"
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
             <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
            </Button>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
