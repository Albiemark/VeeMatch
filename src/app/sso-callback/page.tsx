'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Clerk automatically handles OAuth callbacks via this method
    // This will validate the callback and create a session if successful
    async function processCallback() {
      try {
        // Process the callback - Clerk handles all the complexity
        await handleRedirectCallback({
          redirectUrl: searchParams.get('redirect_url') || '/dashboard',
        });
        
        // The handleRedirectCallback will handle the navigation once complete
        // so we don't need to call router.push() ourselves
      } catch (error) {
        console.error('Error handling OAuth callback', error);
        router.push('/login');
      }
    }

    processCallback();
  }, [router, searchParams, handleRedirectCallback]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-100 to-white">
      <div className="text-center">
        <Loader size={48} className="mx-auto text-pink-500 animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Completing sign in...</h1>
        <p className="text-gray-500 mt-2">Please wait while we verify your information</p>
      </div>
    </div>
  );
}
