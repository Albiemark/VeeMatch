'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import PhoneLogin from '@/components/features/auth/PhoneLogin';

const PhoneLoginPage = () => {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-b from-pink-100 to-white font-sans flex flex-col items-center min-h-screen">
      {/* App Header */}
      <div className="w-full flex items-center justify-between p-4">
        <button 
          className="text-gray-600" 
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      {/* App Logo */}
      <div className="py-6 px-6 text-center">
        <h1 className="text-3xl font-bold text-pink-500">VeeMatch</h1>
        <p className="text-gray-500 mt-2">Sign in with your phone</p>
      </div>

      <div className="w-full max-w-md px-6 pb-8">
        <PhoneLogin />
      </div>
    </div>
  );
};

export default PhoneLoginPage;
