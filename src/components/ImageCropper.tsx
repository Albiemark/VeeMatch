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
        newUrl = URL.createObjectURL(image);
        setImageUrl(newUrl);
      } catch (error) {
        console.error('Error creating object URL:', error);
      }
    };

    loadImage();

    // Clean up when component unmounts or image changes
    return () => {
      if (newUrl) {
        URL.revokeObjectURL(newUrl);
      }
    };
  }, [image]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: Crop,
    fileName: string
  ): Promise<File> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = crop.width;
    canvas.height = crop.height;

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
          reject(new Error('Canvas is empty'));
          return;
        }
        const croppedFile = new File([blob], fileName, {
          type: 'image/jpeg'
        });
        resolve(croppedFile);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleComplete = async () => {
    try {
      if (!imageRef.current || !crop.width || !crop.height) {
        throw new Error('Crop area not selected');
      }

      const croppedImage = await getCroppedImg(
        imageRef.current,
        crop,
        image.name
      );

      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  if (!imageUrl || !isImageLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
        <div className="mb-4">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            aspect={1}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop me"
              className="max-h-[60vh] w-auto mx-auto"
              onLoad={handleImageLoad}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Crop & Upload
          </button>
        </div>
      </div>
    </div>
  );
} 