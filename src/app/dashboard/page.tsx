'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/profile';
import { Loader } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          setLoading(false);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <Loader className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // If user is not signed in, show access denied
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your dashboard.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // If no profile exists, show create profile message
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Your Profile</h1>
          <p className="text-gray-600 mb-6">Get started by creating your profile to find your perfect match.</p>
          <button
            onClick={() => router.push('/create-profile')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  // If profile is not complete, show a message with a link
  if (!profile.profile_complete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
          <p className="text-gray-600 mb-6">Your profile needs to be completed to start matching.</p>
          <button
            onClick={() => router.push('/create-profile')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-20 h-20">
              {profile.photos && profile.photos[0] && (
                <img
                  src={profile.photos[0]}
                  alt={profile.display_name}
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
              <p className="text-gray-600">
                {profile.location_city && profile.location_country 
                  ? `${profile.location_city}, ${profile.location_country}` 
                  : profile.location_city || profile.location_country || ''}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About Me</h2>
              <p className="text-gray-600">{profile.bio}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Lifestyle</h2>
              <div className="flex flex-wrap gap-2">
                {profile.drinking && (
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                    Drinking: {profile.drinking}
                  </span>
                )}
                {profile.smoking && (
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                    Smoking: {profile.smoking}
                  </span>
                )}
                {profile.children && (
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                    Children: {profile.children}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
