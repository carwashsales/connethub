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
  } catch (error) {
    console.error('Error moderating post:', error);
    return {
      message: 'An unexpected error occurred while creating the post.',
    }
  }

  // The actual database write will be handled on the client.
  // This action is now only for validation and moderation.

  revalidatePath('/');
  return { message: 'Post validated successfully.' };
}


const CreateProductSchema = z.object({
  name: z.string().min(1, 'Item name cannot be empty.'),
  description: z.string().min(1, 'Description cannot be empty.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
});

export type CreateProductState = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
  };
  message?: string | null;
}

export async function createProductAction(prevState: CreateProductState, formData: FormData): Promise<CreateProductState> {
  const validatedFields = CreateProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to list item. Please check the fields.',
    };
  }

  // The actual database write will be handled on the client.
  // This action is now only for validation.

  revalidatePath('/marketplace');
  return { message: 'Item validated successfully!' };
}
