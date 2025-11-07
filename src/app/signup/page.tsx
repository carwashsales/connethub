'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase/index';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { Chrome } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const createUserProfile = async (user: User, displayName?: string | null): Promise<void> => {
    console.log('[SignupPage] createUserProfile started for user:', user.uid);
    if (!db) {
      console.error('[SignupPage] Firestore is not initialized.');
      throw new Error("Firestore is not initialized.");
    }

    const userRef = doc(db, 'users', user.uid);
    const newUserProfile = {
      uid: user.uid,
      name: displayName || user.displayName || 'New User',
      email: user.email,
      avatar: {
        url: user.photoURL || `https://picsum.photos/seed/${user.uid}/400/400`,
        hint: 'user profile',
      },
      bio: '',
    };
    
    console.log('[SignupPage] Profile data to be saved:', newUserProfile);
    // Use setDoc with merge: true to avoid errors if the document already exists (e.g., re-signing up with Google)
    return setDoc(userRef, newUserProfile, { merge: true });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SignupPage] handleEmailSignup started.');
    if (!auth) {
      console.error('[SignupPage] Auth service not available.');
      return;
    }
    setLoading(true);
    try {
      console.log('[SignupPage] Attempting to create user with email and password.');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[SignupPage] Auth user created successfully:', userCredential.user);
      
      console.log('[SignupPage] Attempting to create user profile in Firestore.');
      await createUserProfile(userCredential.user, name);
      console.log('[SignupPage] Firestore user profile created successfully.');
      
      toast({ title: 'Success', description: 'Account created successfully!' });
      console.log('[SignupPage] Signup process complete. Redirect will be handled by AuthWrapper.');
    } catch (error: any) {
      console.error('[SignupPage] Error during email signup:', error);
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      console.log('[SignupPage] handleEmailSignup finished.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    console.log('[SignupPage] handleGoogleSignup started.');
    if (!auth) {
      console.error('[SignupPage] Auth service not available.');
      return
    };
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      console.log('[SignupPage] Attempting to sign in with Google popup.');
      const userCredential = await signInWithPopup(auth, provider);
      console.log('[SignupPage] Google auth successful:', userCredential.user);
      
      console.log('[SignupPage] Attempting to create user profile in Firestore.');
      await createUserProfile(userCredential.user);
      console.log('[SignupPage] Firestore user profile created successfully.');
      
      toast({ title: 'Success', description: 'Account created successfully!' });
      console.log('[SignupPage] Signup process complete. Redirect will be handled by AuthWrapper.');
    } catch (error: any) {
        console.error('[SignupPage] Error during Google signup:', error);
        toast({
          title: 'Error creating account',
          description: error.message,
          variant: 'destructive',
        });
    } finally {
      console.log('[SignupPage] handleGoogleSignup finished.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Jane Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create an account'}
            </Button>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignup} disabled={loading}>
              <Chrome className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
