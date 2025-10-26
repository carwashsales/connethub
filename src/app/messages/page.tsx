'use client';

import { ChatLayout } from "@/components/connect-hub/messages/chat-layout";
import { useUser, useFirestore } from '@/firebase/index';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { UserProfile, Conversation as ConversationType } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { User as UserIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

function ChatSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] border-t">
      <div className="w-full md:w-1/3 flex-shrink-0 border-r bg-card md:flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex-col hidden md:flex">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { user: authUser, loading: authLoading } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversationId');

  const { data: users, loading: usersLoading } = useCollection<UserProfile>(
    db ? collection(db, 'users') : null
  );

  const { data: conversationsData, loading: convosLoading } = useCollection<ConversationType>(
    db && authUser ? query(collection(db, 'conversations'), where('participantIds', 'array-contains', authUser.uid), orderBy('lastMessageAt', 'desc')) : null
  );

  const conversations = useMemo(() => {
    if (!conversationsData || !users) return [];
    
    return conversationsData.map(convo => {
      const participants: { [key: string]: UserProfile } = {};
      convo.participantIds.forEach(id => {
        const user = users.find(u => u.uid === id);
        if (user) {
          participants[id] = user;
        }
      });
      return { ...convo, participants };
    });

  }, [conversationsData, users]);

  if (authLoading || usersLoading || convosLoading) {
    return <ChatSkeleton />;
  }
  
  if (!authUser) {
    return (
      <div className="container mx-auto py-8 px-4 text-center h-full flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8">
              <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Please Log In</h2>
              <p className="mt-2 text-muted-foreground">You need to be logged in to view your messages.</p>
              <Button asChild className="mt-6">
                  <Link href="/login">Log In</Link>
              </Button>
          </Card>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-4rem)]">
        <ChatLayout 
            conversations={conversations} 
            currentUser={users?.find(u => u.uid === authUser.uid)!}
            defaultConversationId={conversationIdFromUrl}
        />
    </div>
  );
}
