'use client';

import { useState, useEffect } from 'react';
import PhotoUpload from './PhotoUpload';
import PhotoGallery from './PhotoGallery';
import { toast } from 'sonner';
import { getUserPhotos } from '@/lib/supabase';

interface PhotoManagerProps {
  profileId: string;
  maxPhotos?: number;
}

export default function PhotoManager({ profileId, maxPhotos = 6 }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadKey, setUploadKey] = useState(0);

  const loadPhotos = async () => {
    try {
      console.log('PhotoManager: Loading photos for profile:', profileId);
      setLoading(true);
      setError(null);
      
      // Guard against invalid profileId
      if (!profileId) {
        console.error('PhotoManager: No profileId provided');
        setError('Profile ID is required');
        setLoading(false);
        return;
      }
      
      const userPhotos = await getUserPhotos(profileId);
      console.log('PhotoManager: Loaded photos:', userPhotos?.length || 0);
      
      // Handle null or undefined response
      if (!userPhotos) {
        setPhotos([]);
      } else {
        setPhotos(userPhotos);
      }
      setUploadKey(prev => prev + 1);
    } catch (err) {
      console.error('PhotoManager: Error loading photos:', err);
      // Don't show error to user, just use empty photos
      setPhotos([]);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('PhotoManager: initializing with profileId:', profileId);
    if (!profileId) {
      console.warn('PhotoManager: No profileId provided to component');
      setError('Profile ID is required');
      setLoading(false);
      return;
    }
    loadPhotos();
  }, [profileId]);

  const handleUploadComplete = (photo: any) => {
    console.log('PhotoManager: Upload complete with photo:', photo?.id);
    if (photo && photo.id) {
      // Add the new photo to the list
      setPhotos(prev => [...prev, photo]);
      
      // Reload to make sure we have the latest data
      setTimeout(() => {
        loadPhotos();
      }, 500);
    } else {
      console.error('PhotoManager: Upload complete called with invalid photo data');
    }
  };

  const handlePhotoClick = (photo: any) => {
    console.log('PhotoManager: Photo clicked:', photo?.id);
    // Any additional photo click handling can go here
  };

  // Instead of erroring, just show empty state
  if (error && !loading) {
    console.log('PhotoManager: Rendering error state:', error);
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">Unable to load photos at this time</p>
        <button 
          onClick={loadPhotos} 
          className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Profile Photos</h2>
        <p className="text-sm text-gray-500">
          {photos.length}/{maxPhotos} photos
        </p>
      </div>

      <PhotoGallery
        key={`gallery-${uploadKey}`}
        profileId={profileId}
        editable={true}
        onPhotoClick={handlePhotoClick}
      />

      {/* Photo upload component temporarily disabled 
      {photos.length < maxPhotos && (
        <PhotoUpload
          key={`upload-${uploadKey}`}
          profileId={profileId}
          onUploadComplete={handleUploadComplete}
          maxPhotos={maxPhotos}
        />
      )}
      */}
      
      {/* Add a notice that uploads are disabled */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">Photo uploads are temporarily disabled</p>
      </div>
    </div>
  );
} 