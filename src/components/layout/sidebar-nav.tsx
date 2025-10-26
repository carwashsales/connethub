'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Home, Store, Search, MessageSquare, UserCircle2, Settings, LogIn, LogOut, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AdBanner } from '../connect-hub/shared/ad-banner';
import { useAuth, useUser } from '@/firebase/index';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

const navItems = [
  { href: '/', label: 'News Feed', icon: Home },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/lost-and-found', label: 'Lost & Found', icon: Search },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user: authUser, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const currentUserDocRef = useMemo(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: currentUser, loading: userLoading } = useDoc<UserProfile>(currentUserDocRef);
  
  const loading = authLoading || userLoading;

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };


  return (
    <>
      <SidebarHeader className='p-4'>
        <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6"></path><path d="M12 12c-3.31 0-6-2.69-6-6s2.69-6 6-6"></path></svg>
            <h1 className="text-2xl font-headline font-bold text-primary">Connect Hub</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarGroup className='mt-4'>
            <AdBanner id="sidebar-ad" />
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className='p-2'>
        <Separator className="my-2" />
        <SidebarMenu>
          {loading ? (
            <div className="flex items-center gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className='flex flex-col gap-1'>
                 <Skeleton className="h-4 w-20 rounded" />
                 <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          ) : authUser && currentUser ? (
             <>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/profile')} tooltip="Profile">
                      <Link href="/profile" className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={currentUser.avatar?.url} alt={currentUser.name} data-ai-hint={currentUser.avatar?.hint} />
                              <AvatarFallback>{currentUser.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="font-semibold">{currentUser.name}</span>
                              <span className="text-xs text-muted-foreground">View Profile</span>
                          </div>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                    <LogOut />
                    <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
             </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/login'} tooltip="Login">
                  <Link href="/login">
                    <LogIn />
                    <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/signup'} tooltip="Sign Up">
                  <Link href="/signup">
                    <UserPlus />
                    <span>Sign Up</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
