'use client';

import React from 'react';
import { CreatePost } from "@/components/connect-hub/news-feed/create-post";
import { PostCard } from "@/components/connect-hub/news-feed/post-card";
import { AdBanner } from "@/components/connect-hub/shared/ad-banner";
import { type Post, User } from "@/lib/data";
import { useFirestore, useUser } from '@/firebase/index';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';

type NewsFeedProps = {
    initialPosts: Post[];
}

export function NewsFeed({ initialPosts }: NewsFeedProps) {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const { data: currentUser } = useDoc<User>(
    db && authUser ? doc(db, 'users', authUser.uid) : null
  );
  const posts = initialPosts;

  return (
    <div className="space-y-8">
      {currentUser && <CreatePost user={currentUser} />}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <React.Fragment key={post.id}>
            {index === 2 && <AdBanner id="news-feed-ad" />}
            <PostCard post={post} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}