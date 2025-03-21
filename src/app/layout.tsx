import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VeeMatch - Find Your Perfect Match',
  description: 'A modern dating app that helps you find meaningful connections.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ProfileProvider>
        <html lang="en" className={inter.className}>
          <body>
            <Toaster position="top-center" richColors />
            {children}
          </body>
        </html>
      </ProfileProvider>
    </ClerkProvider>
  );
}
