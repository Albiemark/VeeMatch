'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUserPhotos, deletePhoto, setPrimaryPhoto } from '@/lib/supabase';
import { toast } from 'sonner';

interface Photo {
  id: string;
  storage_path: string;
  is_primary: boolean;
  url?: string;
}

interface PhotoGalleryProps {
  profileId: string;
  onPhotoDelete?: (photoId: string) => void;
}

export default function PhotoGallery({ profileId, onPhotoDelete }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setError('Profile ID is required');
      setIsLoading(false);
      return;
    }
    loadPhotos();
  }, [profileId]);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userPhotos = await getUserPhotos(profileId);
      setPhotos(userPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load photos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      await deletePhoto(photoId);
      setPhotos(photos.filter(photo => photo.id !== photoId));
      onPhotoDelete?.(photoId);
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete photo';
      toast.error(errorMessage);
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await setPrimaryPhoto(profileId, photoId);
      setPhotos(photos.map(photo => ({
        ...photo,
        is_primary: photo.id === photoId
      })));
      toast.success('Primary photo updated');
    } catch (error) {
      console.error('Error setting primary photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to set primary photo';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadPhotos}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square group"
        >
          <Image
            src={photo.url || ''}
            alt="Profile photo"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 50vw, 33vw"
            onError={(e) => {
              console.error('Error loading image:', photo);
              toast.error('Failed to load photo');
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg">
            <div className="absolute top-2 right-2 flex gap-2">
              {!photo.is_primary && (
                <button
                  onClick={() => handleSetPrimary(photo.id)}
                  className="p-2 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Set as primary photo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={() => handleDelete(photo.id)}
                className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Delete photo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {photo.is_primary && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  Primary
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 