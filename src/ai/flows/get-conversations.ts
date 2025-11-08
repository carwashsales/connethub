'use server';
/**
 * @fileOverview A flow for fetching a user's conversations from Firestore.
 * This flow acts as a trusted backend service to retrieve data, bypassing client-side security rule limitations.
 *
 * - getConversations - Fetches all conversations for a given user, along with participant data.
 * - GetConversationsInput - The input type for the getConversations function.
 * - GetConversationsOutput - The return type for the getConversations function.
 */

import { ai } from '@/ai/genkit';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, getDocs, query, where, documentId, orderBy } from 'firebase/firestore';
import { z } from 'zod';
import type { UserProfile, Conversation } from '@/lib/types';


// == ZOD Schemas for Input/Output and data structures ==

const GetConversationsInputSchema = z.object({
  userId: z.string().describe('The UID of the user whose conversations should be fetched.'),
});
export type GetConversationsInput = z.infer<typeof GetConversationsInputSchema>;

// We use `any` for timestamps because they will be converted to strings.
const UserProfileSchema = z.object({
    id: z.string(),
    uid: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.object({ url: z.string(), hint: z.string() }),
    bio: z.string(),
});

const ConversationSchema = z.object({
    id: z.string(),
    participantIds: z.array(z.string()),
    participants: z.record(UserProfileSchema),
    lastMessageText: z.string().optional(),
    lastMessageAt: z.string().optional(), // Timestamps are converted to ISO strings
});

const GetConversationsOutputSchema = z.object({
    currentUser: UserProfileSchema,
    conversations: z.array(ConversationSchema),
});

export type GetConversationsOutput = z.infer<typeof GetConversationsOutputSchema>;


// == Main exported function ==

export async function getConversations(input: GetConversationsInput): Promise<GetConversationsOutput> {
  return getConversationsFlow(input);
}


// == Genkit Flow Definition ==

const getConversationsFlow = ai.defineFlow(
  {
    name: 'getConversationsFlow',
    inputSchema: GetConversationsInputSchema,
    outputSchema: GetConversationsOutputSchema,
  },
  async ({ userId }) => {
    const { firestore } = initializeFirebase();

    // 1. Fetch all conversations the user is part of.
    const conversationsRef = collection(firestore, 'conversations');
    const conversationsQuery = query(
        conversationsRef, 
        where('participantIds', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    if (conversationsSnapshot.empty) {
        const userDoc = await getDocs(query(collection(firestore, 'users'), where('uid', '==', userId)));
        if (userDoc.empty) throw new Error("Current user profile not found.");

        const currentUser = { ...userDoc.docs[0].data(), id: userDoc.docs[0].id } as UserProfile;
        
        return {
            currentUser: UserProfileSchema.parse(currentUser),
            conversations: [],
        };
    }

    const conversationsData = conversationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Omit<Conversation, 'participants'>[];

    // 2. Collect all unique participant IDs from these conversations.
    const allParticipantIds = new Set<string>();
    conversationsData.forEach(convo => {
      convo.participantIds.forEach(id => allParticipantIds.add(id));
    });
    const uniqueParticipantIds = Array.from(allParticipantIds);
    
    // 3. Fetch all required user profiles in a single query.
    const users: { [key: string]: UserProfile } = {};
    if (uniqueParticipantIds.length > 0) {
        const usersRef = collection(firestore, 'users');
        const usersQuery = query(usersRef, where('uid', 'in', uniqueParticipantIds));
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.forEach(doc => {
            const userData = { ...doc.data(), id: doc.id } as UserProfile;
            users[userData.uid] = userData;
        });
    }

    if (!users[userId]) {
        throw new Error("Current user profile not found among participants.");
    }
    
    // 4. Assemble the final conversation objects with populated participant data.
    const finalConversations = conversationsData.map(convo => {
        const participants: { [key: string]: UserProfile } = {};
        convo.participantIds.forEach(id => {
            if (users[id]) {
                participants[id] = users[id];
            }
        });
        
        return {
            ...convo,
            participants,
            // Convert timestamps to JSON-serializable ISO strings.
            lastMessageAt: (convo.lastMessageAt as any)?.toDate?.().toISOString(),
        };
    });

    return {
      currentUser: UserProfileSchema.parse(users[userId]),
      conversations: z.array(ConversationSchema).parse(finalConversations),
    };
  }
);
