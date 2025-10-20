import { CreatePost } from "@/components/connect-hub/news-feed/create-post";
import { PostCard } from "@/components/connect-hub/news-feed/post-card";
import { AdBanner } from "@/components/connect-hub/shared/ad-banner";
import { posts, users } from "@/lib/data";

export default function Home() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-8">
        <CreatePost user={users[0]} />
        <div className="space-y-6">
          {posts.map((post, index) => (
            <>
              {index === 2 && <AdBanner id="news-feed-ad" />}
              <PostCard key={post.id} post={post} />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
