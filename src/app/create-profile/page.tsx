'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import PhotoManager from '@/components/PhotoManager';
import { toast } from 'sonner';
import { createProfile, updateProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export default function CreateProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
  });

  // Get the profile ID when the component mounts
  useEffect(() => {
    async function getProfileId() {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (profile) {
          setProfileId(profile.id);
        }
      } catch (error) {
        console.error('Error getting profile:', error);
        toast.error('Failed to load profile');
      }
    }

    getProfileId();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    try {
      if (currentStep === 3) {
        // Validate required fields
        if (!formData.displayName || !formData.age || !formData.gender || 
            !formData.locationCity || !formData.locationCountry || !formData.relationshipGoals) {
          toast.error('Please fill in all required fields');
          return;
        }

        // Make sure enum values are valid
        const childrenValue = formData.children ? 
          (formData.children as 'have' | 'want' | 'don\'t want' | 'open to it') : 
          ('open to it' as 'have' | 'want' | 'don\'t want' | 'open to it');
        
        const drinkingValue = formData.drinking ? 
          (formData.drinking as 'never' | 'rarely' | 'socially' | 'regularly') : 
          ('never' as 'never' | 'rarely' | 'socially' | 'regularly');
        
        const smokingValue = formData.smoking ? 
          (formData.smoking as 'never' | 'socially' | 'regularly') : 
          ('never' as 'never' | 'socially' | 'regularly');

        // Create profile before showing photo upload step
        const profile = await createProfile({
          user_id: user.id,
          display_name: formData.displayName,
          age: parseInt(formData.age),
          gender: formData.gender as 'male' | 'female' | 'non-binary' | 'other',
          bio: formData.bio,
          occupation: formData.occupation,
          education: formData.education,
          location_city: formData.locationCity,
          location_country: formData.locationCountry,
          relationship_goals: formData.relationshipGoals as 'long-term' | 'casual-dating' | 'friendship' | 'not-sure-yet',
          drinking: drinkingValue,
          smoking: smokingValue,
          children: childrenValue,
        });

        // Set the profile ID
        setProfileId(profile.id);
        
        // Move to the next step
        setCurrentStep(prev => prev + 1);
      } else if (currentStep === 4) {
        // Update profile completion status
        await updateProfile(user.id, { profile_complete: true });

        toast.success('Profile created successfully!');
        router.push('/dashboard');
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">About You</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Location & Preferences</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="locationCity"
                value={formData.locationCity}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="locationCountry"
                value={formData.locationCountry}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship Goals</label>
              <select
                name="relationshipGoals"
                value={formData.relationshipGoals}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
                required
              >
                <option value="">Select relationship goals</option>
                <option value="long-term">Long-term relationship</option>
                <option value="casual-dating">Casual dating</option>
                <option value="friendship">Friendship</option>
                <option value="not-sure-yet">Not sure yet</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Lifestyle & Photos</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Drinking</label>
              <select
                name="drinking"
                value={formData.drinking}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
              >
                <option value="">Select option</option>
                <option value="never">Never</option>
                <option value="rarely">Rarely</option>
                <option value="socially">Socially</option>
                <option value="regularly">Regularly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Smoking</label>
              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
              >
                <option value="">Select option</option>
                <option value="never">Never</option>
                <option value="socially">Socially</option>
                <option value="regularly">Regularly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Children</label>
              <select
                name="children"
                value={formData.children}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white"
              >
                <option value="">Select option</option>
                <option value="have">Have children</option>
                <option value="want">Want children</option>
                <option value="don't want">Don't want children</option>
                <option value="open to it">Open to children</option>
              </select>
            </div>
            {profileId && (
              <PhotoManager profileId={profileId} />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
              <span className="text-sm font-medium text-gray-700">{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {renderStep()}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="ml-auto px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              {currentStep === 4 ? 'Create Profile' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
