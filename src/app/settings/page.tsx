'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser } from '@/firebase/index';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SettingsSkeleton() {
    return (
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function SettingsPage() {
    const { user: authUser, loading: authLoading } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemo(() => {
        if (!db || !authUser) return null;
        return doc(db, 'users', authUser.uid);
    }, [db, authUser]);

    const { data: user, loading: userLoading } = useDoc<UserProfile>(userDocRef);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
        }
    }, [user]);

    const handleSaveChanges = async () => {
        if (!db || !authUser) return;
        setIsSaving(true);
        const userRef = doc(db, 'users', authUser.uid);
        try {
            await updateDoc(userRef, {
                name: name,
                bio: bio,
            });
            toast({
                title: 'Success!',
                description: 'Your profile has been updated.',
            });
        } catch (error: any) {
            toast({
                title: 'Error updating profile',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (authLoading || userLoading) {
        return (
             <div className="container mx-auto py-8 px-4">
                <SettingsSkeleton />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle className="font-headline">Profile Settings</CardTitle>
                    <CardDescription>Update your name and bio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us a little about yourself"
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
