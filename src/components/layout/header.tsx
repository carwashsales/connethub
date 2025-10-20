'use client';

import { usePathname } from 'next/navigation';
import { Home, Store, Search, MessageSquare, UserCircle2 } from 'lucide-react';
import React from 'react';

const routeTitles: { [key: string]: { title: string; icon: React.ElementType } } = {
  '/': { title: 'News Feed', icon: Home },
  '/marketplace': { title: 'Marketplace', icon: Store },
  '/lost-and-found': { title: 'Lost & Found', icon: Search },
  '/messages': { title: 'Messages', icon: MessageSquare },
  '/profile': { title: 'My Profile', icon: UserCircle2 },
};

export function Header({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { title, icon: Icon } = routeTitles[pathname] || { title: 'Connect Hub', icon: Home };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="md:hidden">
            {children}
        </div>
        <div className='flex items-center gap-2'>
            <Icon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold font-headline">{title}</h1>
        </div>
    </header>
  );
}
