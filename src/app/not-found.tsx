import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-pink-500 mb-4">404</h1>
        <h2 className="text-2xl text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
