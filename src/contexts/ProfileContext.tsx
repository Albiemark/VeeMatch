'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

// Define the user profile data types
export interface UserProfile {
  userId: string;
  displayName: string;
  age: number | null;
  gender: string;
  interestedIn: string[];
  bio: string;
  photos: string[];
  location: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  relationshipGoals: string;
  passions: string[];
  // Additional dating app specific fields
  height?: number; // in cm
  drinking?: 'never' | 'rarely' | 'socially' | 'regularly';
  smoking?: 'never' | 'socially' | 'regularly';
  children?: 'have' | 'want' | 'don\'t want' | 'open to it';
  education?: string;
  occupation?: string;
  profileComplete: boolean;
}

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => void;
  saveProfile: () => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  deletePhoto: (photoUrl: string) => void;
  resetProfile: () => void;
}

// Default empty profile
const createEmptyProfile = (userId: string): UserProfile => ({
  userId,
  displayName: '',
  age: null,
  gender: '',
  interestedIn: [],
  bio: '',
  photos: [],
  location: {
    city: '',
    country: '',
  },
  relationshipGoals: '',
  passions: [],
  profileComplete: false,
});

// Create the context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider component
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize or load profile data when component mounts
  useEffect(() => {
    async function initializeProfile() {
      if (!isLoaded) return;
      
      if (!isSignedIn || !user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // In a real app, this would fetch from your database
        // For now, we'll simulate by checking localStorage first
        const savedProfile = localStorage.getItem(`profile_${user.id}`);
        
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          // Create a new empty profile
          const newProfile = createEmptyProfile(user.id);
          setProfile(newProfile);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
        
        // Fallback to empty profile
        const newProfile = createEmptyProfile(user.id);
        setProfile(newProfile);
      } finally {
        setIsLoading(false);
      }
    }

    initializeProfile();
  }, [isLoaded, isSignedIn, user]);

  // Update profile locally
  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
  };

  // Save profile to backend/localStorage
  const saveProfile = async () => {
    if (!profile || !user) {
      setError('No profile data to save');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would send this to your backend API
      // For demo, we'll save to localStorage
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
      
      // Update Clerk user's name (other profile data would be stored in your database)
      await user.update({
        firstName: profile.displayName.split(' ')[0],
        lastName: profile.displayName.split(' ').slice(1).join(' '),
      });
      
      // Note: Updating publicMetadata must be done server-side via Clerk's API
      // This would require a backend endpoint that calls Clerk's API
      // For this demo, we're just storing everything in localStorage
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a photo
  const uploadPhoto = async (file: File): Promise<string> => {
    setIsLoading(true);
    try {
      // In a real app, you would upload to a cloud storage service
      // For demo, we'll simulate by creating a data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Add the new photo URL to the profile
          setProfile((prev) => {
            if (!prev) return null;
            const photoUrl = reader.result as string;
            const updatedPhotos = [...prev.photos, photoUrl];
            return { ...prev, photos: updatedPhotos };
          });
          
          setIsLoading(false);
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
      setIsLoading(false);
      throw err;
    }
  };

  // Delete a photo
  const deletePhoto = (photoUrl: string) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updatedPhotos = prev.photos.filter(url => url !== photoUrl);
      return { ...prev, photos: updatedPhotos };
    });
  };

  // Reset profile
  const resetProfile = () => {
    if (!user) return;
    const newProfile = createEmptyProfile(user.id);
    setProfile(newProfile);
    localStorage.removeItem(`profile_${user.id}`);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        updateProfile,
        saveProfile,
        uploadPhoto,
        deletePhoto,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// Hook to use the profile context
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
