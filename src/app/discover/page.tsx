'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getDiscoverProfiles, likeProfile, passProfile } from '@/lib/supabase';
import { UserProfile } from '@/types/profile';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ArrowLeft, Heart, X, ThumbsUp, Info, MapPin, Briefcase, GraduationCap, Wine, Cigarette, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function DiscoverPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Function to load profiles
  const loadProfiles = async () => {
    if (!isSignedIn || !user) return;
    
    try {
      setLoading(true);
      const profiles = await getDiscoverProfiles(user.id);
      setProfiles(profiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profiles. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profiles on component mount
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
      return;
    }

    if (isLoaded && isSignedIn) {
      loadProfiles();
    }
  }, [isLoaded, isSignedIn]);

  // Handle user action (like or pass)
  const handleAction = async (action: 'like' | 'pass') => {
    if (actionInProgress || profiles.length === 0 || currentIndex >= profiles.length) return;
    
    const currentProfile = profiles[currentIndex];
    setActionInProgress(true);
    
    try {
      if (action === 'like') {
        const result = await likeProfile(user?.id || '', currentProfile.id);
        if (result.isNewMatch) {
          toast({
            title: 'New Match!',
            description: `You matched with ${currentProfile.display_name}!`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Liked!',
            description: `You liked ${currentProfile.display_name}!`,
            variant: 'default',
          });
        }
      } else {
        await passProfile(user?.id || '', currentProfile.id);
      }
    } catch (error) {
      console.error(`Error ${action === 'like' ? 'liking' : 'passing'} profile:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} profile. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
      setActionInProgress(false);
    }
  };

  // Navigate to previous profile
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Profile display component
  const ProfileCard = ({ profile }: { profile: UserProfile }) => {
    return (
      <Card className="w-full max-w-lg mx-auto overflow-hidden shadow-lg rounded-xl">
        {/* Profile image */}
        <div className="relative w-full h-[400px]">
          {profile.photos && profile.photos.length > 0 ? (
            <Image
              src={profile.photos[0]}
              alt={`${profile.display_name}'s photo`}
              fill
              style={{ objectFit: 'cover' }}
              priority
              className="rounded-t-xl"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No photo available</p>
            </div>
          )}
        </div>
        
        {/* Profile info */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{profile.display_name}, {profile.age}</h2>
            <Badge variant="secondary">{profile.gender}</Badge>
          </div>
          
          {profile.location_city && profile.location_country && (
            <div className="flex items-center mt-2 text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{profile.location_city}, {profile.location_country}</span>
            </div>
          )}
          
          {profile.occupation && (
            <div className="flex items-center mt-2 text-gray-500">
              <Briefcase className="h-4 w-4 mr-1" />
              <span>{profile.occupation}</span>
            </div>
          )}
          
          {profile.education && (
            <div className="flex items-center mt-2 text-gray-500">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span>{profile.education}</span>
            </div>
          )}
          
          {/* Bio */}
          {profile.bio && (
            <div className="mt-4">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
          
          {/* Lifestyle info */}
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.relationship_goals && (
              <Badge variant="outline">{profile.relationship_goals}</Badge>
            )}
            {profile.drinking && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Wine className="h-3 w-3" />
                {profile.drinking}
              </Badge>
            )}
            {profile.smoking && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Cigarette className="h-3 w-3" />
                {profile.smoking}
              </Badge>
            )}
            {profile.children && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Baby className="h-3 w-3" />
                {profile.children}
              </Badge>
            )}
          </div>
          
          {/* Passions */}
          {profile.passions && profile.passions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Passions</h3>
              <div className="flex flex-wrap gap-2">
                {profile.passions.map((passion, i) => (
                  <Badge key={i} variant="secondary">{passion}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Discover</h1>
        <div className="w-full max-w-lg mx-auto">
          <Skeleton className="w-full h-[400px] rounded-xl" />
          <div className="mt-4">
            <Skeleton className="w-3/4 h-8 mb-2" />
            <Skeleton className="w-1/2 h-6 mb-2" />
            <Skeleton className="w-full h-20 mb-4" />
            <div className="flex justify-between mt-6">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No profiles to show
  if (profiles.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Discover</h1>
        <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold mb-4">No more profiles to show</h2>
          <p className="text-gray-500 mb-6">We've run out of profiles based on your preferences. Try again later or adjust your preferences.</p>
          <Link href="/settings/preferences">
            <Button className="mr-4">Adjust Preferences</Button>
          </Link>
          <Button variant="outline" onClick={loadProfiles}>Refresh</Button>
        </div>
      </div>
    );
  }

  // All profiles viewed
  if (currentIndex >= profiles.length) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Discover</h1>
        <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold mb-4">You've seen everyone</h2>
          <p className="text-gray-500 mb-6">You've viewed all available profiles. Check back later for new matches!</p>
          <Button onClick={loadProfiles}>Refresh</Button>
        </div>
      </div>
    );
  }

  // Main discover UI
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Discover</h1>
      
      {/* Profile card */}
      <ProfileCard profile={profiles[currentIndex]} />
      
      {/* Action buttons */}
      <div className="flex justify-center mt-6 gap-8">
        <Button
          onClick={() => handleAction('pass')}
          variant="outline"
          className="h-16 w-16 rounded-full p-0"
          disabled={actionInProgress}
        >
          <X size={32} className="text-red-500" />
        </Button>
        
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="h-16 w-16 rounded-full p-0"
          disabled={currentIndex === 0 || actionInProgress}
        >
          <ArrowLeft size={32} className="text-gray-500" />
        </Button>
        
        <Button
          onClick={() => handleAction('like')}
          variant="outline"
          className="h-16 w-16 rounded-full p-0"
          disabled={actionInProgress}
        >
          <Heart size={32} className="text-green-500" />
        </Button>
      </div>
      
      {/* Navigation indicator */}
      <div className="flex justify-center mt-6">
        <p className="text-sm text-gray-500">
          Profile {currentIndex + 1} of {profiles.length}
        </p>
      </div>
    </div>
  );
} 