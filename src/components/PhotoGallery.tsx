'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Photo {
  id: string;
  profile_id: string;
  storage_path: string;
  url?: string;
  is_primary: boolean;
  created_at: string;
}

interface PhotoGalleryProps {
  profileId: string;
  editable?: boolean;
  onPhotoClick?: (photo: Photo) => void;
}

export default function PhotoGallery({ profileId, editable = false, onPhotoClick }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('PhotoGallery initializing with profileId:', profileId);
    loadPhotos();
  }, [profileId]);

  const loadPhotos = async () => {
    console.log('Loading photos for profile:', profileId);
    try {
      // Fetch photos from the database
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('profile_id', profileId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error loading photos:', error);
        toast.error('Failed to load photos');
        setLoading(false);
        return;
      }

      console.log('Received photos data:', data);

      // Add public URLs to each photo
      const photosWithUrls = data.map(photo => {
        // Get the public URL for each photo
        const { data: urlData } = supabase.storage
          .from('photos') // Make sure to use 'photos' bucket
          .getPublicUrl(photo.storage_path);

        return {
          ...photo,
          url: urlData.publicUrl
        };
      });

      setPhotos(photosWithUrls);
      console.log('Photos with URLs:', photosWithUrls);
    } catch (error) {
      console.error('Error in loadPhotos:', error);
      toast.error('An error occurred while loading photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      // First get the photo to find its storage path
      const { data: photoData, error: getError } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('id', photoId)
        .single();

      if (getError) {
        throw new Error(getError.message);
      }

      // Delete the photo from storage
      if (photoData?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('photos') // Make sure to use 'photos' bucket
          .remove([photoData.storage_path]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }

      // Delete the database record
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Remove from local state
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete photo');
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      // First, remove primary status from all photos
      const { error: updateAllError } = await supabase
        .from('photos')
        .update({ is_primary: false })
        .eq('profile_id', profileId);

      if (updateAllError) {
        throw new Error(updateAllError.message);
      }

      // Then, set the selected photo as primary
      const { error: updateError } = await supabase
        .from('photos')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      setPhotos(prev =>
        prev.map(photo => ({
          ...photo,
          is_primary: photo.id === photoId
        }))
      );
      
      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error setting primary photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile photo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-400">No photos yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {photos.map(photo => {
        console.log('Rendering photo:', photo.id, photo.url);
        return (
          <div 
            key={photo.id} 
            className={`
              relative aspect-square overflow-hidden rounded-lg
              ${photo.is_primary ? 'ring-4 ring-pink-500' : ''}
              ${editable || onPhotoClick ? 'cursor-pointer' : ''}
            `}
            onClick={() => onPhotoClick && onPhotoClick(photo)}
          >
            {photo.url ? (
              <Image
                src={photo.url}
                alt="Profile photo"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-sm text-gray-400">Error loading image</p>
              </div>
            )}
            
            {editable && (
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button
                  className="p-1 bg-pink-600 rounded-full text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetPrimary(photo.id);
                  }}
                  title="Set as primary photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  className="p-1 bg-red-600 rounded-full text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                  title="Delete photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 