'use client';

import React, { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-pink-500 mb-4">VeeMatch</h1>
        <p className="text-gray-500 mb-8">Find your perfect match</p>
        <Loader size={36} className="mx-auto text-pink-500 animate-spin" />
        <p className="mt-4 text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
