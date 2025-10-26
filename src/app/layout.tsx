import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useUser } from '@/firebase/index';

export const metadata: Metadata = {
  title: 'Connect Hub',
  description: 'Your community connection platform',
};

function AuthDependentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  // if (!loading && !user && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
  //   window.location.href = '/login';
  //   return null;
  // }

  return <AppLayout>{children}</AppLayout>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAuthPage = path === '/login' || path === '/signup';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {isAuthPage ? children : <AppLayout>{children}</AppLayout>}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}