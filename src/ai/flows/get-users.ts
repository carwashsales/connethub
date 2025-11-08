'use server';
/**
 * @fileOverview A flow for fetching users from Firestore.
 * This flow acts as a trusted backend service to retrieve data, bypassing client-side security rule limitations on 'list' operations.
 *
 * - getUsers - Fetches all users from the 'users' collection.
 * - UserOutput - The return type for the users.
 */

import { ai } from '@/ai/genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { z } from 'zod';

// Define the Zod schema for a single user, matching the UserProfile type.
const UserSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.object({
    url: z.string().url(),
    hint: z.string(),
  }),
  bio: z.string(),
});

// Define the output schema as an array of the user schema.
const GetUsersOutputSchema = z.array(UserSchema);
export type UserOutput = z.infer<typeof UserSchema>;

// Export the main function that the client will call.
export async function getUsers(): Promise<UserOutput[]> {
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
      } as UserOutput;
    });

    return users;
  }
);
