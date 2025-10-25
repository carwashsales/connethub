'use client';

import React from 'react';
import { CreatePost } from "@/components/connect-hub/news-feed/create-post";
import { PostCard } from "@/components/connect-hub/news-feed/post-card";
import { AdBanner } from "@/components/connect-hub/shared/ad-banner";
import { users, type Post } from "@/lib/data";
import { useUser } from '@/firebase';

type NewsFeedProps = {
    initialPosts: Post[];
}

export function NewsFeed({ initialPosts }: NewsFeedProps) {
  const { user: authUser } = useUser();
  const posts = initialPosts;

  const currentUser = users.find(user => user.id === 'user-1');

  return (
    <div className="space-y-8">
      {currentUser && <CreatePost user={currentUser} />}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <React.Fragment key={`${post.id}-${index}`}>
            {index === 2 && <AdBanner id="news-feed-ad" />}
            <PostCard post={post} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
