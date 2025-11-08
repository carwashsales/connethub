'use server';
/**
 * @fileOverview A flow for fetching lost and found items from Firestore.
 * This flow acts as a trusted backend service to retrieve data, bypassing client-side security rule limitations on 'list' operations.
 *
 * - getLostAndFoundItems - Fetches all items from the 'lostAndFoundItems' collection.
 * - LostFoundItemOutput - The return type for the items.
 */

import { ai } from '@/ai/genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { z } from 'zod';

// Define the Zod schema for a single item, ensuring timestamps are converted to strings.
const LostFoundItemSchema = z.object({
  id: z.string(),
  type: z.enum(['lost', 'found']),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  contact: z.string(),
  userId: z.string(),
  image: z.object({
    url: z.string(),
    hint: z.string(),
  }),
  createdAt: z.string(), // Timestamps will be converted to ISO strings.
});

// Define the output schema as an array of the item schema.
const GetLostAndFoundItemsOutputSchema = z.array(LostFoundItemSchema);
export type LostFoundItemOutput = z.infer<typeof LostFoundItemSchema>;


// Export the main function that the client will call.
export async function getLostAndFoundItems(): Promise<LostFoundItemOutput[]> {
  return getLostAndFoundItemsFlow();
}

// Define the Genkit flow.
const getLostAndFoundItemsFlow = ai.defineFlow(
  {
    name: 'getLostAndFoundItemsFlow',
    inputSchema: z.void(),
    outputSchema: GetLostAndFoundItemsOutputSchema,
  },
  async () => {
    // Initialize a server-side instance of Firebase.
    const { firestore } = initializeFirebase();
    
    const itemsRef = collection(firestore, 'lostAndFoundItems');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    const items = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        // Convert Firestore Timestamp to a JSON-serializable ISO string.
        createdAt: data.createdAt.toDate().toISOString(),
      } as LostFoundItemOutput;
    });

    return items;
  }
);
