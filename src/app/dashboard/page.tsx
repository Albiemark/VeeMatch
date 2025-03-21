'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useProfile } from '@/contexts/ProfileContext';
import { Loader } from 'lucide-react';

// Use a simpler approach for the dashboard
// Instead of complex useEffect redirects, render based on current state
const DashboardPage = () => {
  const { isSignedIn, user, isLoaded: isUserLoaded } = useUser();
  const { profile, isLoading: isProfileLoading } = useProfile();

  // Show loading state during data loading
  if (isProfileLoading || !isUserLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <Loader size={48} className="text-pink-500 animate-spin" />
      </div>
    );
  }

  // If not signed in, show access denied
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need to sign in to access this page</p>
          <Link 
            href="/login"
            className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // If profile is not complete, show a message with a link
  if (profile && !profile.profileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile</h1>
          <p className="text-gray-600 mb-8">Please complete your profile to continue</p>
          <Link 
            href="/create-profile"
            className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors inline-block"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-pink-100 to-white min-h-screen p-4">
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-pink-600">VeeMatch</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center space-x-4 mb-6">
            {profile?.photos && profile.photos.length > 0 ? (
              <img 
                src={profile.photos[0]} 
                alt={profile.displayName} 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center text-pink-500 text-lg font-bold">
                {profile?.displayName?.charAt(0) || user?.firstName?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {profile?.displayName || user?.firstName || 'User'}
              </h2>
              <p className="text-gray-500">
                {profile?.location?.city ? `${profile.location.city}, ${profile.location.country}` : 'No location set'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Today's Matches</h3>
              <p className="text-gray-600 text-sm">You have no new matches yet. Start swiping!</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Messages</h3>
              <p className="text-gray-600 text-sm">No new messages</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Profile Completion</h3>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: profile?.photos?.length ? '100%' : '80%' }}
                ></div>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                {profile?.photos?.length 
                  ? 'Your profile is complete!' 
                  : 'Add photos to improve your matches'}
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="bg-pink-500 text-white p-3 rounded-xl">
              Start Swiping
            </button>
            <button className="bg-white border border-pink-500 text-pink-500 p-3 rounded-xl">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
