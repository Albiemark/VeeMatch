'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserPreferences, updateUserPreferences } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreferencesPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  // Preference state
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(99);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [showMe, setShowMe] = useState<boolean>(true);
  const [interestedIn, setInterestedIn] = useState<string[]>([]);

  // Available gender options
  const genderOptions = [
    { id: 'male', label: 'Men' },
    { id: 'female', label: 'Women' },
    { id: 'non-binary', label: 'Non-binary' },
    { id: 'other', label: 'Other' }
  ];

  // Load user preferences
  const loadPreferences = async () => {
    if (!isSignedIn || !user) return;
    
    try {
      setLoading(true);
      
      // First get the user's profile ID
      const response = await fetch(`/api/profile?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profile = await response.json();
      if (!profile) {
        router.push('/create-profile');
        return;
      }
      
      setProfileId(profile.id);
      
      // Then get their preferences
      const preferences = await getUserPreferences(profile.id);
      
      // Update state with preferences
      setMinAge(preferences.min_age);
      setMaxAge(preferences.max_age);
      setMaxDistance(preferences.max_distance);
      setShowMe(preferences.show_me);
      setInterestedIn(preferences.interested_in || []);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    if (!profileId) return;
    
    try {
      setSaving(true);
      
      await updateUserPreferences(profileId, {
        min_age: minAge,
        max_age: maxAge,
        max_distance: maxDistance,
        show_me: showMe,
        interested_in: interestedIn,
      });
      
      toast({
        title: 'Preferences Saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle gender selection
  const toggleGender = (genderId: string) => {
    setInterestedIn(prev => {
      if (prev.includes(genderId)) {
        return prev.filter(id => id !== genderId);
      } else {
        return [...prev, genderId];
      }
    });
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
      return;
    }

    if (isLoaded && isSignedIn) {
      loadPreferences();
    }
  }, [isLoaded, isSignedIn]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Match Preferences</h1>
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Match Preferences</h1>
      
      <Card className="p-6">
        <div className="space-y-8">
          {/* Age Range */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Age Range</h3>
              <p className="text-sm text-gray-500">Show people between {minAge} and {maxAge} years old</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-age">Minimum Age</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="min-age"
                    min={18}
                    max={maxAge}
                    step={1}
                    value={[minAge]}
                    onValueChange={(value) => setMinAge(value[0])}
                  />
                  <span className="min-w-[40px] text-center">{minAge}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="max-age">Maximum Age</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="max-age"
                    min={minAge}
                    max={99}
                    step={1}
                    value={[maxAge]}
                    onValueChange={(value) => setMaxAge(value[0])}
                  />
                  <span className="min-w-[40px] text-center">{maxAge}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interested In */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Interested In</h3>
              <p className="text-sm text-gray-500">Show me people who identify as</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {genderOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${option.id}`}
                    checked={interestedIn.includes(option.id)}
                    onCheckedChange={() => toggleGender(option.id)}
                  />
                  <Label htmlFor={`gender-${option.id}`}>{option.label}</Label>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500">
              {interestedIn.length === 0 
                ? "If none selected, we'll show you everyone"
                : `You'll see people who identify as ${interestedIn.map(g => genderOptions.find(o => o.id === g)?.label).join(', ')}`}
            </p>
          </div>
          
          {/* Distance */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Maximum Distance</h3>
              <p className="text-sm text-gray-500">Show people up to {maxDistance} miles away</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Slider
                min={5}
                max={100}
                step={5}
                value={[maxDistance]}
                onValueChange={(value) => setMaxDistance(value[0])}
                className="flex-1"
              />
              <span className="min-w-[60px] text-center">{maxDistance} mi</span>
            </div>
          </div>
          
          {/* Show Me */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Show Me in Discover</h3>
              <p className="text-sm text-gray-500">When disabled, your profile won't be shown to others</p>
            </div>
            
            <Switch
              checked={showMe}
              onCheckedChange={setShowMe}
            />
          </div>
          
          {/* Save Button */}
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>
    </div>
  );
} 