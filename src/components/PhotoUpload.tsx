'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PhotoUploadProps {
  profileId: string;
  onUploadComplete: (photo: any) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ profileId, onUploadComplete, maxPhotos = 6 }: PhotoUploadProps) {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('onDrop called with files:', acceptedFiles.length);
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('File selected:', file.name, 'type:', file.type, 'size:', file.size);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast.error('File size should be less than 5MB');
      return;
    }

    // Skip the cropping process and directly upload the file
    console.log('Skipping cropping and uploading directly');
    toast.info('Uploading file directly...');
    
    /* UPLOAD FUNCTIONALITY COMMENTED OUT
    await handleUploadFile(file);
    */
    
    // Display message that uploads are temporarily disabled
    toast.info('Image uploads are temporarily disabled');
    console.log('Upload functionality is commented out');
  }, []);

  // New function to handle the file upload directly without cropping
  const handleUploadFile = async (imageFile: File) => {
    if (!profileId) {
      toast.error('Profile ID is required');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    console.log('Starting direct photo upload process');
    console.log('Profile ID:', profileId);
    console.log('User ID:', user?.id);

    try {
      // Create a unique filename using the current timestamp and a random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomString}.jpg`;
      
      // Use clerk user ID as folder name if available, otherwise use profileId
      const folderName = user?.id || `profile-${profileId}`;
      const filePath = `${folderName}/${fileName}`;
      
      console.log('Uploading to path:', filePath);
      console.log('Photo details:', {
        size: imageFile.size,
        type: imageFile.type,
        bucket: 'photos',
        filePath
      });
      
      // Setup fake progress to show activity
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.floor(Math.random() * 10);
          return next > 80 ? 80 : next;
        });
      }, 300);
      
      // Get Supabase URL and key from environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      console.log('Using Supabase at:', supabaseUrl);
      
      // Perform the upload directly to the 'photos' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos') // Use 'photos' bucket name
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: imageFile.type // Use the actual file type
        });
      
      clearInterval(progressInterval);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        console.error('Error message:', uploadError.message);
        // Log the entire error object for debugging
        console.error('Full error object:', JSON.stringify(uploadError, null, 2));
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully', { uploadData });
      setUploadProgress(90);
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('photos') // Use 'photos' bucket name
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      console.log('Public URL:', publicUrl);
      
      // Create a database record for the uploaded photo
      console.log('Creating database record', { profileId, filePath });
      const { data: photoRecord, error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            profile_id: profileId,
            storage_path: filePath,
            order_index: 0,
            is_primary: false
          }
        ])
        .select()
        .single();
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(dbError.message);
      }
      
      console.log('Database record created:', photoRecord);
      
      // Complete the upload
      setUploadProgress(100);
      
      // Create the complete photo object with URL
      const completePhoto = {
        ...photoRecord,
        url: publicUrl
      };
      
      // Notify the parent component
      onUploadComplete(completePhoto);
      toast.success('Photo uploaded successfully!');
      
      // Reset the component state after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
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
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6
          ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-pink-500'}
          transition-colors duration-200
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-pink-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 bg-pink-100 rounded-full">
              <svg
                className="w-6 h-6 text-pink-600"
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
              {/* Add a notice about uploads being disabled */}
              <p className="text-xs text-red-500 mt-2 font-medium">
                Image uploads are temporarily disabled
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 