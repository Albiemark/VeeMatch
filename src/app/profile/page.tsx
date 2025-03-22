'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, getUserProfile, updateProfile } from '@/lib/supabase';
import PhotoManager from '@/components/PhotoManager';
import { UserProfile } from '@/types/profile';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    gender: '',
    bio: '',
    occupation: '',
    education: '',
    locationCity: '',
    locationCountry: '',
    relationshipGoals: '',
    drinking: '',
    smoking: '',
    children: '',
    passions: [] as string[]
  });

  // Add a state variable to track when loading started
  const [loadingStartTime] = useState(Date.now());

  // Get user profile data
  useEffect(() => {
    console.log('Profile page useEffect triggered, loading:', loading, 'isLoaded:', isLoaded);
    
    async function fetchProfile() {
      if (!user) {
        console.log('No user found, ending loading state');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile for user:', user.id);
        console.log('Loading state before fetch:', loading);
        
        const profile = await getUserProfile(user.id);
        console.log('Profile fetch completed with result:', profile ? 'has data' : 'null');
        
        if (profile) {
          console.log('Setting profile state with profile ID:', profile.id);
          setProfile(profile);
          setProfileId(profile.id);
          
          // Set form data from profile
          setFormData({
            displayName: profile.display_name || '',
            age: profile.age?.toString() || '',
            gender: profile.gender || '',
            bio: profile.bio || '',
            occupation: profile.occupation || '',
            education: profile.education || '',
            locationCity: profile.location_city || '',
            locationCountry: profile.location_country || '',
            relationshipGoals: profile.relationship_goals || '',
            drinking: profile.drinking || '',
            smoking: profile.smoking || '',
            children: profile.children || '',
            passions: profile.passions || []
          });
        } else {
          console.log('No profile data returned for user', user.id);
          // Make sure to explicitly set profile to null so the UI can transition properly
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data. Using empty profile.');
        // Force loading to end even on error
        setProfile(null);
      } finally {
        console.log('Profile fetch completed, ending loading state');
        setLoading(false);
      }
    }

    if (isLoaded) {
      console.log('Clerk user loaded:', isLoaded, user?.id);
      fetchProfile();
    } else {
      console.log('Waiting for Clerk to load user data');
    }
  }, [user, isLoaded]);

  // Add a timeout to detect stuck loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('Loading timeout reached - forcing loading to end');
        setLoading(false);
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle passions change
  const handlePassionToggle = (passion: string) => {
    setFormData(prev => {
      const updatedPassions = prev.passions.includes(passion)
        ? prev.passions.filter(p => p !== passion)
        : [...prev.passions, passion];
      
      return {
        ...prev,
        passions: updatedPassions
      };
    });
  };

  // Save profile
  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    try {
      setSaving(true);

      // Validate required fields
      if (!formData.displayName) {
        toast.error('Display name is required');
        setSaving(false);
        return;
      }

      // Make sure enum values are valid
      const childrenValue = formData.children ? 
        (formData.children as 'have' | 'want' | 'don\'t want' | 'open to it') : 
        undefined;
      
      const drinkingValue = formData.drinking ? 
        (formData.drinking as 'never' | 'rarely' | 'socially' | 'regularly') : 
        undefined;
      
      const smokingValue = formData.smoking ? 
        (formData.smoking as 'never' | 'socially' | 'regularly') : 
        undefined;

      // Update profile
      const updatedProfile = await updateProfile(user.id, {
        display_name: formData.displayName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as 'male' | 'female' | 'non-binary' | 'other' | undefined,
        bio: formData.bio || undefined,
        occupation: formData.occupation || undefined,
        education: formData.education || undefined,
        location_city: formData.locationCity || undefined,
        location_country: formData.locationCountry || undefined,
        relationship_goals: formData.relationshipGoals as 'long-term' | 'casual-dating' | 'friendship' | 'not-sure-yet' | undefined,
        drinking: drinkingValue,
        smoking: smokingValue,
        children: childrenValue,
        passions: formData.passions.length > 0 ? formData.passions : undefined
      });

      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Fallback component for loading issues
  if (loading && !profile && (Date.now() - loadingStartTime > 5000)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Taking longer than expected</h2>
          <p className="text-gray-600 mb-6">We're having trouble loading your profile data.</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800">
              Troubleshooting tips:
            </p>
            <ul className="list-disc ml-5 mt-2 text-sm text-yellow-700">
              <li>Check your internet connection</li>
              <li>Refresh the page and try again</li>
              <li>Clear your browser cache</li>
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Refresh Page
            </button>
            
            <button
              onClick={() => {
                setLoading(false);
                toast.info('Loading has been manually bypassed');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Continue Anyway
            </button>
            
            <button
              onClick={async () => {
                try {
                  toast.info('Testing connection to Supabase...');
                  const { data, error } = await supabase.from('profiles').select('count').limit(1);
                  
                  if (error) {
                    toast.error(`Connection error: ${error.message}`);
                    console.error('Supabase connection test failed:', error);
                  } else {
                    toast.success('Successfully connected to Supabase!');
                    console.log('Supabase connection test successful:', data);
                  }
                } catch (e) {
                  toast.error(`Connection test failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                  console.error('Connection test exception:', e);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-2"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <Loader className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
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

  // List of available passions
  const availablePassions = [
    'Travel', 'Music', 'Food', 'Art', 'Reading', 'Writing', 'Photography', 
    'Hiking', 'Yoga', 'Fitness', 'Dancing', 'Cooking', 'Gaming', 'Movies', 
    'Fashion', 'Technology', 'Science', 'Sports', 'Pets', 'Nature'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photos</h2>
          {profileId && <PhotoManager profileId={profileId} maxPhotos={6} />}
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Goals</label>
              <select
                name="relationshipGoals"
                value={formData.relationshipGoals}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              >
                <option value="">Select relationship goal</option>
                <option value="long-term">Long-term relationship</option>
                <option value="casual-dating">Casual dating</option>
                <option value="friendship">Friendship</option>
                <option value="not-sure-yet">Not sure yet</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About You</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              placeholder="Tell others about yourself..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="locationCity"
                value={formData.locationCity}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="locationCountry"
                value={formData.locationCountry}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lifestyle</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drinking</label>
              <select
                name="drinking"
                value={formData.drinking}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              >
                <option value="">Select option</option>
                <option value="never">Never</option>
                <option value="rarely">Rarely</option>
                <option value="socially">Socially</option>
                <option value="regularly">Regularly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Smoking</label>
              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              >
                <option value="">Select option</option>
                <option value="never">Never</option>
                <option value="socially">Socially</option>
                <option value="regularly">Regularly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <select
                name="children"
                value={formData.children}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 bg-white"
              >
                <option value="">Select option</option>
                <option value="have">Have children</option>
                <option value="want">Want children</option>
                <option value="don't want">Don't want children</option>
                <option value="open to it">Open to it</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Passions</h2>
          <p className="text-gray-600 mb-4">Select up to 5 interests that you're passionate about</p>
          
          <div className="flex flex-wrap gap-2">
            {availablePassions.map(passion => (
              <button
                key={passion}
                type="button"
                onClick={() => handlePassionToggle(passion)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.passions.includes(passion)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${formData.passions.length >= 5 && !formData.passions.includes(passion) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={formData.passions.length >= 5 && !formData.passions.includes(passion)}
              >
                {passion}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 