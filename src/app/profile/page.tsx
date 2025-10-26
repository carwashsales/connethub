'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore, useUser } from "@/firebase/index";
import { useDoc } from "@/firebase/firestore/use-doc";
import type { UserProfile } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Mail, MessageSquare, Phone, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { doc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


function ProfileSkeleton() {
    return (
        <Card className="overflow-hidden shadow-lg">
            <Skeleton className="h-48 md:h-64 w-full" />
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-24 space-y-4 sm:space-y-0 sm:space-x-6">
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-background ring-2 ring-primary" />
                    <div className="flex-1 text-center sm:text-left pt-4 w-full">
                        <Skeleton className="h-9 w-1/2 mx-auto sm:mx-0" />
                        <Skeleton className="h-5 w-3/4 mt-2 mx-auto sm:mx-0" />
                    </div>
                </div>
                <div className="mt-8 border-t pt-6">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ProfilePage() {
    const { user: authUser, loading: authLoading } = useUser();
    const db = useFirestore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [targetUserId, setTargetUserId] = useState<string | null>(null);

    useEffect(() => {
        const userIdFromQuery = searchParams.get('userId');
        if (userIdFromQuery) {
            setTargetUserId(userIdFromQuery);
        } else if (authUser) {
            setTargetUserId(authUser.uid);
        }
    }, [searchParams, authUser]);

    const userDocRef = useMemo(() => {
        if (!db || !targetUserId) return null;
        return doc(db, 'users', targetUserId);
    }, [db, targetUserId]);

    const { data: user, loading: userLoading } = useDoc<UserProfile>(userDocRef);
    
    const coverImage = PlaceHolderImages.find(img => img.id === 'profile-cover');

    const handleSendMessage = async () => {
        if (!db || !authUser || !user || authUser.uid === user.uid) return;

        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, where('participantIds', 'array-contains', authUser.uid));
        
        const querySnapshot = await getDocs(q);
        let existingConversation = null;
        
        querySnapshot.forEach(doc => {
            const conversation = doc.data();
            if (conversation.participantIds.includes(user.uid)) {
                existingConversation = { id: doc.id, ...conversation };
            }
        });

        if (existingConversation) {
            router.push(`/messages?conversationId=${existingConversation.id}`);
        } else {
            const newConversation = await addDoc(conversationsRef, {
                participantIds: [authUser.uid, user.uid],
                lastMessageAt: serverTimestamp(),
                lastMessageText: ''
            });
            router.push(`/messages?conversationId=${newConversation.id}`);
        }
    };
    
    const isOwnProfile = authUser && user && authUser.uid === user.uid;

    const messageButton = (
         <Button onClick={handleSendMessage} disabled={!authUser || isOwnProfile}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
        </Button>
    );

    if (authLoading || (targetUserId && userLoading)) {
        return (
             <div className="container mx-auto py-8 px-4">
                <ProfileSkeleton />
            </div>
        );
    }

    if (!authUser && !targetUserId) {
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <Card className="max-w-md mx-auto p-8">
                    <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">Please Log In</h2>
                    <p className="mt-2 text-muted-foreground">You need to be logged in to view your profile.</p>
                    <Button asChild className="mt-6">
                        <Link href="/login">Log In</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    if (!user) {
         return (
             <div className="container mx-auto py-8 px-4 text-center">
                <p>Could not load user profile. The user may not exist.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="overflow-hidden shadow-lg">
                <div className="relative h-48 md:h-64 w-full">
                    {coverImage && (
                         <Image 
                            src={coverImage.imageUrl} 
                            alt="Profile cover" 
                            fill
                            className="object-cover"
                            data-ai-hint={coverImage.imageHint}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-24">
                        <div className="relative">
                            <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary">
                                <AvatarImage src={user.avatar.url} alt={user.name} data-ai-hint={user.avatar.hint} />
                                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row justify-between items-center w-full mt-4 sm:mt-0 sm:ml-6">
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                                <p className="text-muted-foreground mt-1">{user.bio || 'No bio yet.'}</p>
                            </div>

                            <div className="mt-4 sm:mt-0">
                                {!isOwnProfile && (
                                     <TooltipProvider>
                                        {!authUser ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span tabIndex={0}>{messageButton}</span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Please log in to message this user.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            messageButton
                                        )}
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-headline font-semibold">Contact Information</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-accent" />
                                <a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-accent" />
                                <span>(123) 456-7890</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
