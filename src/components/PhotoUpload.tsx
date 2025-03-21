'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { uploadPhoto } from '@/lib/supabase';
import { toast } from 'sonner';
import ImageCropper from './ImageCropper';

interface PhotoUploadProps {
  profileId: string;
  onUploadComplete: (photo: any) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ profileId, onUploadComplete, maxPhotos = 6 }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
  }, []);

  const handleCropComplete = async (croppedImage: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setSelectedImage(null);

    try {
      // Upload the cropped photo
      const photo = await uploadPhoto(croppedImage, profileId);
      
      // Update progress
      setUploadProgress(100);
      
      // Notify parent component
      onUploadComplete(photo);
      
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      let errorMessage = 'Failed to upload photo';
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to upload photos. Please try logging in again.';
        } else if (error.message.includes('Profile not found')) {
          errorMessage = 'Profile not found. Please complete your profile first.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="w-full">
      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setSelectedImage(null)}
        />
      )}

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'}
          transition-colors duration-200
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop the photo here' : 'Drag & drop a photo here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to select a file
              </p>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 