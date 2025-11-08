'use server';
/**
 * @fileOverview A flow for fetching all users from Firestore.
 * This flow acts as a trusted backend service to retrieve data, bypassing client-side security rule limitations on 'list' operations.
 *
 * - getUsers - Fetches all users from the 'users' collection.
 * - UserProfileOutput - The return type for the user profile data.
 */

import { ai } from '@/ai/genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { z } from 'zod';
import type { UserProfile } from '@/lib/types';


// Define the Zod schema for a single user profile.
const UserProfileSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.object({
    url: z.string(),
    hint: z.string(),
  }),
  bio: z.string(),
});


// Define the output schema as an array of the user profile schema.
const GetUsersOutputSchema = z.array(UserProfileSchema);
export type UserProfileOutput = z.infer<typeof UserProfileSchema>;


// Export the main function that the client will call.
export async function getUsers(): Promise<UserProfileOutput[]> {
  return getUsersFlow();
}

// Define the Genkit flow.
const getUsersFlow = ai.defineFlow(
  {
    name: 'getUsersFlow',
    inputSchema: z.void(),
    outputSchema: GetUsersOutputSchema,
  },
  async () => {
    // Initialize a server-side instance of Firebase.
    const { firestore } = initializeFirebase();
    
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, orderBy('name', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      } as UserProfile;
    });

    return users;
  }
);
