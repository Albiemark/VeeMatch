'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);
  const [redirectFailed, setRedirectFailed] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const redirect = async () => {
      try {
        if (isSignedIn) {
          await router.push('/dashboard');
        } else {
          await router.push('/login');
        }
      } catch (error) {
        console.error('Redirect failed:', error);
        setRedirectFailed(true);
        setRedirecting(false);
      }
    };

    redirect();

    // Set a timeout to show manual links if redirection takes too long
    const timeout = setTimeout(() => {
      setRedirecting(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-pink-500 mb-4">VeeMatch</h1>
        <p className="text-gray-500 mb-8">Find your perfect match</p>
        
        {redirecting ? (
          <>
            <Loader size={36} className="mx-auto text-pink-500 animate-spin" />
            <p className="mt-4 text-gray-400">Redirecting...</p>
          </>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="text-gray-600">
              {redirectFailed 
                ? "Automatic redirection failed." 
                : "Taking longer than expected..."}
            </p>
            <div className="flex flex-col space-y-3">
              <Link href="/login" className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600">
                Go to Login
              </Link>
              {isSignedIn && (
                <Link href="/dashboard" className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
