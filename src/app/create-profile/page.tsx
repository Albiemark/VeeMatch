'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useProfile } from '@/contexts/ProfileContext';
import { ArrowLeft, ArrowRight, Loader, Camera, X } from 'lucide-react';

type Step = 
  | 'basic-info'
  | 'photos'
  | 'about'
  | 'passions'
  | 'preferences'
  | 'relationship-goals'
  | 'confirm';

const CreateProfilePage = () => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { profile, updateProfile, saveProfile, uploadPhoto, deletePhoto, isLoading } = useProfile();
  
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [stepProgress, setStepProgress] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalSteps = 7;

  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Only run this effect after Clerk has loaded
    if (!isLoaded) return;

    // If user is not signed in, redirect to login
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    
    // If profile is already complete, redirect to dashboard
    if (profile?.profileComplete) {
      router.push('/dashboard');
      return;
    }
    
    // If we reach here, authentication is complete and valid
    setAuthChecked(true);
  }, [isLoaded, isSignedIn, profile, router]);
  
  // Show loading state during auth checks or if not signed in
  if (!authChecked || !isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <Loader size={48} className="text-pink-500 animate-spin" />
      </div>
    );
  }

  // Calculate progress percentage
  useEffect(() => {
    const stepMapping: Record<Step, number> = {
      'basic-info': 0,
      'photos': 1,
      'about': 2,
      'passions': 3,
      'preferences': 4,
      'relationship-goals': 5,
      'confirm': 6,
    };
    
    setStepProgress((stepMapping[currentStep] / (totalSteps - 1)) * 100);
  }, [currentStep]);

  const handleNext = () => {
    let nextStep: Step | null = null;
    
    switch (currentStep) {
      case 'basic-info':
        // Validate basic info
        if (!profile?.displayName || !profile?.age || !profile?.gender) {
          setErrorMessage('Please fill out all required fields');
          return;
        }
        nextStep = 'photos';
        break;
      
      case 'photos':
        // Photos are optional but recommended
        nextStep = 'about';
        break;
      
      case 'about':
        // Bio is optional but recommended
        nextStep = 'passions';
        break;
      
      case 'passions':
        // Passions are optional
        nextStep = 'preferences';
        break;
      
      case 'preferences':
        // Preferences are required
        if (!profile?.interestedIn || profile.interestedIn.length === 0) {
          setErrorMessage('Please select who you\'re interested in');
          return;
        }
        nextStep = 'relationship-goals';
        break;
      
      case 'relationship-goals':
        // Relationship goals are required
        if (!profile?.relationshipGoals) {
          setErrorMessage('Please select your relationship goals');
          return;
        }
        nextStep = 'confirm';
        break;
      
      case 'confirm':
        // Mark profile as complete and save
        if (profile) {
          updateProfile({ profileComplete: true });
          saveProfile().then(() => {
            router.push('/dashboard');
          });
        }
        break;
    }
    
    if (nextStep) {
      setErrorMessage('');
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    let prevStep: Step | null = null;
    
    switch (currentStep) {
      case 'photos':
        prevStep = 'basic-info';
        break;
      case 'about':
        prevStep = 'photos';
        break;
      case 'passions':
        prevStep = 'about';
        break;
      case 'preferences':
        prevStep = 'passions';
        break;
      case 'relationship-goals':
        prevStep = 'preferences';
        break;
      case 'confirm':
        prevStep = 'relationship-goals';
        break;
    }
    
    if (prevStep) {
      setErrorMessage('');
      setCurrentStep(prevStep);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setPhotoFile(file);
      
      try {
        await uploadPhoto(file);
        setPhotoFile(null);
      } catch (err) {
        console.error('Error uploading photo:', err);
        setErrorMessage('Failed to upload photo. Please try again.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setPhotoFile(file);
      
      try {
        await uploadPhoto(file);
        setPhotoFile(null);
      } catch (err) {
        console.error('Error uploading photo:', err);
        setErrorMessage('Failed to upload photo. Please try again.');
      }
    }
  };

  // Loading state
  if (isLoading || !isLoaded || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <Loader size={48} className="text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={handleBack}
          disabled={currentStep === 'basic-info'}
          className="p-2 text-gray-700 disabled:text-gray-300"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Create Profile</h1>
          <div className="w-full bg-gray-200 h-1 mt-2 rounded-full">
            <div 
              className="bg-pink-500 h-1 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${stepProgress}%` }}
            ></div>
          </div>
        </div>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-500 text-center rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Step content */}
        <div className="mb-8">
          {currentStep === 'basic-info' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
              <p className="text-gray-600">This information helps us find better matches for you</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={profile.displayName || ''}
                    onChange={(e) => updateProfile({ displayName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    value={profile.age || ''}
                    onChange={(e) => updateProfile({ age: parseInt(e.target.value) || null })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Your age (18+)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={profile.gender || ''}
                    onChange={(e) => updateProfile({ gender: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="" disabled>Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={profile.location.city || ''}
                      onChange={(e) => updateProfile({ 
                        location: { ...profile.location, city: e.target.value } 
                      })}
                      className="p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={profile.location.country || ''}
                      onChange={(e) => updateProfile({ 
                        location: { ...profile.location, country: e.target.value } 
                      })}
                      className="p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'photos' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Add some photos</h2>
              <p className="text-gray-600">Profiles with photos get 10x more matches</p>
              
              {/* Photo gallery */}
              <div className="grid grid-cols-3 gap-2">
                {profile.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img 
                      src={photo} 
                      alt={`Profile photo ${index + 1}`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => deletePhoto(photo)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                {/* Upload button */}
                <div 
                  className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer
                    ${dragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <Camera size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Drag and drop photos or click to upload. Maximum 9 photos.
              </p>
            </div>
          )}

          {currentStep === 'about' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">About you</h2>
              <p className="text-gray-600">Tell potential matches more about yourself</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 min-h-[120px]"
                  placeholder="Share something interesting about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-right text-gray-500 mt-1">
                  {profile.bio ? 500 - profile.bio.length : 500} characters remaining
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={profile.occupation || ''}
                  onChange={(e) => updateProfile({ occupation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                  placeholder="What do you do?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  value={profile.education || ''}
                  onChange={(e) => updateProfile({ education: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Your education"
                />
              </div>
            </div>
          )}

          {currentStep === 'passions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Passions</h2>
              <p className="text-gray-600">Select things you love to talk about and do</p>
              
              <div className="flex flex-wrap gap-2">
                {['Travel', 'Fitness', 'Music', 'Food', 'Art', 'Reading', 'Movies', 'Photography', 
                  'Dancing', 'Cooking', 'Hiking', 'Gaming', 'Technology', 'Fashion', 'Sports', 
                  'Yoga', 'Writing', 'Animals', 'Nature', 'Politics'].map((passion) => (
                  <button
                    key={passion}
                    onClick={() => {
                      const currentPassions = [...(profile.passions || [])];
                      const index = currentPassions.indexOf(passion);
                      
                      if (index === -1) {
                        // Add the passion
                        updateProfile({ passions: [...currentPassions, passion] });
                      } else {
                        // Remove the passion
                        currentPassions.splice(index, 1);
                        updateProfile({ passions: currentPassions });
                      }
                    }}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-colors
                      ${profile.passions?.includes(passion) 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {passion}
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-500">
                Choose at least 3 passions to help us find better matches (selected: {profile.passions?.length || 0})
              </p>
            </div>
          )}

          {currentStep === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Preferences</h2>
              <p className="text-gray-600">Let us know who you'd like to meet</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I'm interested in
                </label>
                <div className="space-y-2">
                  {['male', 'female', 'non-binary', 'everyone'].map((gender) => (
                    <label key={gender} className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <input
                        type={gender === 'everyone' ? 'radio' : 'checkbox'}
                        checked={
                          gender === 'everyone' 
                            ? profile.interestedIn?.length === 3 
                            : profile.interestedIn?.includes(gender)
                        }
                        onChange={() => {
                          if (gender === 'everyone') {
                            updateProfile({ interestedIn: ['male', 'female', 'non-binary'] });
                          } else {
                            const currentInterests = [...(profile.interestedIn || [])];
                            const index = currentInterests.indexOf(gender);
                            
                            if (index === -1) {
                              updateProfile({ interestedIn: [...currentInterests, gender] });
                            } else {
                              currentInterests.splice(index, 1);
                              updateProfile({ interestedIn: currentInterests });
                            }
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="capitalize">{gender === 'everyone' ? 'Everyone' : gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional preferences
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Drinking</span>
                    </label>
                    <select
                      value={profile.drinking || ''}
                      onChange={(e) => updateProfile({ drinking: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="never">Never</option>
                      <option value="rarely">Rarely</option>
                      <option value="socially">Socially</option>
                      <option value="regularly">Regularly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Smoking</span>
                    </label>
                    <select
                      value={profile.smoking || ''}
                      onChange={(e) => updateProfile({ smoking: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="never">Never</option>
                      <option value="socially">Socially</option>
                      <option value="regularly">Regularly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'relationship-goals' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Relationship Goals</h2>
              <p className="text-gray-600">What are you looking for on VeeMatch?</p>
              
              <div className="space-y-2">
                {['long-term', 'casual-dating', 'friendship', 'not-sure-yet'].map((goal) => {
                  let label, description;
                  
                  switch (goal) {
                    case 'long-term':
                      label = 'Long-term relationship';
                      description = 'Looking for something serious';
                      break;
                    case 'casual-dating':
                      label = 'Casual dating';
                      description = 'Taking things slow and seeing where they go';
                      break;
                    case 'friendship':
                      label = 'New friends';
                      description = 'Here to meet new people and expand social circle';
                      break;
                    case 'not-sure-yet':
                      label = 'Not sure yet';
                      description = 'Still figuring out what I want';
                      break;
                    default:
                      label = goal;
                      description = '';
                  }
                  
                  return (
                    <label key={goal} className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        checked={profile.relationshipGoals === goal}
                        onChange={() => updateProfile({ relationshipGoals: goal })}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Children
                </label>
                <select
                  value={profile.children || ''}
                  onChange={(e) => updateProfile({ children: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Prefer not to say</option>
                  <option value="have">Have children</option>
                  <option value="want">Want children</option>
                  <option value="don't want">Don't want children</option>
                  <option value="open to it">Open to children</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Ready to start matching!</h2>
              <p className="text-gray-600">Review your profile before finishing</p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg">{profile.displayName}, {profile.age}</h3>
                  <p className="text-gray-500 text-sm">{profile.gender} • {profile.location.city}, {profile.location.country}</p>
                  
                  {profile.relationshipGoals && (
                    <div className="mt-2">
                      <span className="text-sm bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                        Looking for: {profile.relationshipGoals.split('-').join(' ')}
                      </span>
                    </div>
                  )}
                  
                  {profile.bio && (
                    <div className="mt-3">
                      <p className="text-gray-700 text-sm">{profile.bio}</p>
                    </div>
                  )}
                </div>
                
                {profile.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {profile.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="aspect-square">
                        <img 
                          src={photo} 
                          alt={`Profile photo ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                    {profile.photos.length > 3 && (
                      <div className="col-span-3 text-center text-sm text-gray-500 mt-1">
                        +{profile.photos.length - 3} more photos
                      </div>
                    )}
                  </div>
                )}
                
                {profile.passions && profile.passions.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Passions</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.passions.map((passion) => (
                        <span key={passion} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {passion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600 mb-2">
                    You can always edit your profile later from your settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom button */}
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-pink-500 text-white p-4 rounded-xl hover:bg-pink-600 transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <Loader size={24} className="animate-spin" />
          ) : (
            <>
              {currentStep === 'confirm' ? 'Finish & Start Matching' : 'Continue'}
              {currentStep !== 'confirm' && <ArrowRight size={18} className="ml-2" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateProfilePage;
