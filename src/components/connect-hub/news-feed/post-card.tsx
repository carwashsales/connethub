'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Post, UserProfile as User } from "@/lib/types";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser } from "@/firebase/index";
import { formatDistanceToNow } from 'date-fns';
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";


type PostCardProps = {
  post: Post;
};

function EditPostDialog({ post, isOpen, onOpenChange }: { post: Post; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    const db = useFirestore();
    const { toast } = useToast();
    const [content, setContent] = useState(post.content);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!db || !content.trim()) {
            toast({ title: "Error", description: "Post content cannot be empty.", variant: "destructive" });
            return;
        }
        setLoading(true);
        const postRef = doc(db, 'posts', post.id);
        try {
            await updateDoc(postRef, { content });
            toast({ title: "Success", description: "Post updated successfully." });
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to update post.", variant: "destructive" });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                </DialogHeader>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[120px]" />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function PostCard({ post }: PostCardProps) {
  const db = useFirestore();
  const { user: authUser } = useUser();
  
  const authorDocRef = useMemo(() => {
    if (!db || !post.authorId) return null;
    return doc(db, 'users', post.authorId);
  }, [db, post.authorId]);

  const { data: author } = useDoc<User>(authorDocRef);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const isAuthor = useMemo(() => authUser && authUser.uid === post.authorId, [authUser, post.authorId]);

  const date = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now';

  const hasLiked = authUser && post.likedBy?.includes(authUser.uid);

  const handleLike = async () => {
    if (!db || !authUser) return;
    const postRef = doc(db, 'posts', post.id);

    if (hasLiked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(authUser.uid),
        likes: increment(-1)
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(authUser.uid),
        likes: increment(1)
      });
    }
  };

  const handleDelete = async () => {
      if(!db) return;
      const postRef = doc(db, 'posts', post.id);
      try {
        await deleteDoc(postRef);
        toast({ title: "Success", description: "Post deleted." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
        console.error(error);
      }
      setIsDeleteAlertOpen(false);
  }


  return (
    <>
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between gap-3">
        {author ? (
          <Link href={`/profile?userId=${author.uid}`} className="flex items-center gap-3 group flex-1">
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
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded-md mt-1" />
            </div>
          </div>
        )}
        {isAuthor && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
            <Button variant="ghost" size="sm" onClick={handleLike} disabled={!authUser} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
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

    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    {isAuthor && <EditPostDialog post={post} isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
    </>
  );
}
