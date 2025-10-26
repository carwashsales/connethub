'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore, useUser } from "@/firebase/index";
import { useDoc } from "@/firebase/firestore/use-doc";
import type { UserProfile } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Mail, Phone, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

    const { data: user, loading: userLoading } = useDoc<UserProfile>(
        db && authUser ? doc(db, 'users', authUser.uid) : null
    );
    
    const coverImage = PlaceHolderImages.find(img => img.id === 'profile-cover');

    if (authLoading || (authUser && userLoading)) {
        return (
             <div className="container mx-auto py-8 px-4">
                <ProfileSkeleton />
            </div>
        );
    }

    if (!authUser) {
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
             <div className="container mx-auto py-8 px-4">
                <p>Could not load user profile.</p>
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
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-24 space-y-4 sm:space-y-0 sm:space-x-6">
                        <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={user.avatar.url} alt={user.name} data-ai-hint={user.avatar.hint} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left pt-4">
                            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                            <p className="text-muted-foreground mt-1">{user.bio || 'No bio yet.'}</p>
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
