'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Post, UserProfile as User } from "@/lib/types";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from 'firebase/firestore';
import { useFirestore } from "@/firebase/index";
import { formatDistanceToNow } from 'date-fns';
import Link from "next/link";


type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const db = useFirestore();
  const { data: author } = useDoc<User>(
    db && post.authorId ? doc(db, 'users', post.authorId) : null
  );

  const date = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now';


  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center gap-3">
        {author ? (
          <Link href={`/profile?userId=${author.uid}`} className="flex items-center gap-3 group">
            <Avatar>
                <AvatarImage src={author.avatar.url} alt={author.name} data-ai-hint={author.avatar.hint} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold group-hover:underline">{author?.name || 'Loading...'}</p>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          </Link>
        ): (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded-md mt-1" />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      {post.image && (
        <div className="relative h-64 md:h-80 w-full mt-2">
          <Image
            src={post.image.url}
            alt="Post image"
            fill
            className="object-cover"
            data-ai-hint={post.image.hint}
          />
        </div>
      )}
      <CardFooter className="p-2 flex justify-between items-center bg-secondary/20">
        <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
            </Button>
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
