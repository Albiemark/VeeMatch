'use client';

import React from 'react';
import { SignOutButton } from '@clerk/nextjs';

const LogoutPage = () => {
  return (
    <div className="bg-gray-100 font-sans flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow-md w-80 text-center">
        <h2 className="mb-4 text-xl font-bold">Logout</h2>
        <p className="mb-4">Are you sure you want to logout?</p>
        <SignOutButton redirectUrl="/login">
          <button className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">Logout</button>
        </SignOutButton>
      </div>
    </div>
  );
};

export default LogoutPage;
