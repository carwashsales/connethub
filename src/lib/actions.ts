'use server';

import { z } from 'zod';
import { moderateContent } from '@/ai/flows/automated-content-moderation';
import { revalidatePath } from 'next/cache';

const CreatePostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty.').max(500, 'Post content is too long.'),
});

export type CreatePostState = {
  errors?: {
    content?: string[];
  };
  message?: string | null;
}

export async function createPostAction(prevState: CreatePostState, formData: FormData): Promise<CreatePostState> {
  const validatedFields = CreatePostSchema.safeParse({
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create post.',
    };
  }
  
  const { content } = validatedFields.data;

  try {
    const moderationResult = await moderateContent({ text: content });

    if (!moderationResult.isAppropriate) {
      return {
        message: `Your post could not be published. Reason: ${moderationResult.reason}`,
      };
    }
    
    // Here you would typically save the post to a database.
    // For this example, we'll just log it and revalidate the path.
    console.log('New post created:', content);

  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred while moderating content.',
    }
  }

  revalidatePath('/');
  return { message: 'Post created successfully.' };
}
