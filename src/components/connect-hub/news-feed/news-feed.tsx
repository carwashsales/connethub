'use client';

import React from 'react';
import { CreatePost } from "@/components/connect-hub/news-feed/create-post";
import { PostCard } from "@/components/connect-hub/news-feed/post-card";
import { AdBanner } from "@/components/connect-hub/shared/ad-banner";
import { useFirestore, useUser } from '@/firebase/index';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import type { Post, UserProfile as User } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

function PostSkeleton() {
  return (
    <div className="p-4 rounded-lg border bg-card space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  )
}

export function NewsFeed() {
  const { user: authUser } = useUser();
  const db = useFirestore();

  const { data: currentUser } = useDoc<User>(
    db && authUser ? doc(db, 'users', authUser.uid) : null
  );

  const { data: posts, loading: loadingPosts } = useCollection<Post>(
    db ? query(collection(db, "posts"), orderBy("createdAt", "desc")) : null
  );

  return (
    <div className="space-y-8">
      {currentUser && <CreatePost user={currentUser} />}
      <div className="space-y-6">
        {loadingPosts ? (
           Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : (
          posts?.map((post, index) => (
            <React.Fragment key={post.id}>
              {index === 2 && <AdBanner id="news-feed-ad" />}
              <PostCard post={post} />
            </React.Fragment>
          ))
        )}
         {!loadingPosts && posts?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">The news feed is quiet... Be the first to post something!</p>
            </div>
          )}
      </div>
    </div>
  );
}
