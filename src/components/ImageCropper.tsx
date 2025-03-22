'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  image: File;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  console.log('ImageCropper rendering with image:', image.name, 'type:', image.type);
  
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let newUrl: string | null = null;

    const loadImage = async () => {
      try {
        // Create a new URL for the image
        console.log('Creating object URL for image:', image.name);
        newUrl = URL.createObjectURL(image);
        console.log('Created URL:', newUrl);
        setImageUrl(newUrl);
      } catch (error) {
        console.error('Error creating object URL:', error);
      }
    };

    loadImage();

    // Clean up when component unmounts or image changes
    return () => {
      if (newUrl) {
        console.log('Cleaning up object URL:', newUrl);
        URL.revokeObjectURL(newUrl);
      }
    };
  }, [image]);

  const handleImageLoad = () => {
    console.log('Image loaded in cropper');
    setIsImageLoaded(true);
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: Crop,
    fileName: string
  ): Promise<File> => {
    console.log('Getting cropped image with crop:', crop);
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = crop.width;
    canvas.height = crop.height;

    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    console.log('Image size:', image.width, 'x', image.height, 'natural:', image.naturalWidth, 'x', image.naturalHeight);

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty, no blob created');
          reject(new Error('Canvas is empty'));
          return;
        }
        console.log('Created blob:', blob.size, 'bytes of type', blob.type);
        const croppedFile = new File([blob], fileName, {
          type: 'image/jpeg'
        });
        console.log('Created cropped file:', croppedFile.size, 'bytes');
        resolve(croppedFile);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleComplete = async () => {
    try {
      console.log('Crop complete clicked, crop:', crop);
      if (!imageRef.current || !crop.width || !crop.height) {
        console.error('Missing required crop data', {
          imageRef: !!imageRef.current,
          width: crop.width,
          height: crop.height
        });
        throw new Error('Crop area not selected');
      }

      console.log('Starting crop process');
      const croppedImage = await getCroppedImg(
        imageRef.current,
        crop,
        image.name
      );

      console.log('Calling onCropComplete with cropped image:', croppedImage.size, 'bytes');
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  if (!imageUrl || !isImageLoaded) {
    console.log('Loading state in cropper, imageUrl:', !!imageUrl, 'isImageLoaded:', isImageLoaded);
    return <div>Loading image for cropping...</div>;
  }

  console.log('Rendering crop interface with URL:', imageUrl.substring(0, 30) + '...');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] !important" style={{zIndex: 99999}}>
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
        <div className="mb-4 overflow-auto max-h-[60vh]">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            aspect={1}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop me"
              className="max-h-[50vh] w-auto mx-auto"
              onLoad={handleImageLoad}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            type="button"
          >
            Crop & Upload
          </button>
        </div>
      </div>
    </div>
  );
} 