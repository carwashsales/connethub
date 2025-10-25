'use client';

import { NewsFeed } from "@/components/connect-hub/news-feed/news-feed";
import { posts } from "@/lib/data";

export default function Home() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <NewsFeed initialPosts={posts} />
    </div>
  );
}
