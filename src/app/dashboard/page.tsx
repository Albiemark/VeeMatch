'use client';

import React, { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import { Loader } from 'lucide-react';

const DashboardPage = () => {
  const { isSignedIn, user, isLoaded: isUserLoaded } = useUser();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    // If user is not signed in, redirect to login
    if (isUserLoaded && !isSignedIn) {
      router.push('/login');
    }
    
    // If user is signed in but profile is not complete, redirect to profile creation
    if (isUserLoaded && isSignedIn && !isProfileLoading && profile && !profile.profileComplete) {
      router.push('/create-profile');
    }
  }, [isSignedIn, isUserLoaded, isProfileLoading, profile, router]);

  const isLoading = !isUserLoaded || isProfileLoading || !isSignedIn || (profile && !profile.profileComplete);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <Loader size={48} className="text-pink-500 animate-spin" />
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
