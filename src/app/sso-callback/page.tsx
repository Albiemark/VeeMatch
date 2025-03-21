'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { Loader } from 'lucide-react';

export default function SSOCallback() {
  const router = useRouter();
  const { handleRedirectCallback } = useClerk();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!searchParams) {
          router.push('/dashboard');
          return;
        }

        // Process the callback - Clerk handles all the complexity
        await handleRedirectCallback({
          redirectUrl: searchParams.get('redirect_url') || '/dashboard',
        });

        // The handleRedirectCallback will handle the navigation once complete
      } catch (error) {
        console.error('Error during SSO callback:', error);
        router.push('/login');
      }
    }

    handleCallback();
  }, [handleRedirectCallback, router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="text-center">
        <Loader className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
