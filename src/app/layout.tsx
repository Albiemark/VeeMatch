import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Toaster } from '@/components/ui/toaster';
import NavigationBar from '@/components/layout/NavigationBar';
import { ThemeProvider } from '@/components/ui/theme-provider';

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
    <html lang="en" className={inter.className}>
      <body>
        <ClerkProvider>
          <ProfileProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main className="pb-20">
                {children}
              </main>
              <NavigationBar />
              <Toaster />
            </ThemeProvider>
          </ProfileProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
