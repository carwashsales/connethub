'use client';

import { NewsFeed } from "@/components/connect-hub/news-feed/news-feed";

export default function Home() {
  console.log("HomePage: Rendering...");
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <NewsFeed />
    </div>
  );
}
