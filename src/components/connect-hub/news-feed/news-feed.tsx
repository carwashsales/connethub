'use client';

import React, { useMemo } from 'react';
import { CreatePost } from "@/components/connect-hub/news-feed/create-post";
import { PostCard } from "@/components/connect-hub/news-feed/post-card";
import { AdBanner } from "@/components/connect-hub/shared/ad-banner";
import { useFirestore, useUser } from '@/firebase/index';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import type { Post, UserProfile as User } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper } from 'lucide-react';

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

  const currentUserDocRef = useMemo(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);
  
  const { data: currentUser } = useDoc<User>(currentUserDocRef);

  const postsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "posts"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: posts, loading: loadingPosts } = useCollection<Post>(postsQuery);

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
              <Newspaper className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">The News Feed is Quiet</h3>
              <p className="mt-2 text-sm text-muted-foreground">There are no posts yet. Why not be the first to share something?</p>
            </div>
          )}
      </div>
    </div>
  );
}
