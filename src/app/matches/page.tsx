'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

type Match = {
  id: string;
  profile: {
    id: string;
    display_name: string;
    age?: number;
    photo_url?: string;
    last_active?: string;
  };
  created_at: string;
  updated_at: string;
  has_unread_messages: boolean;
};

export default function MatchesPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's matches
  const loadMatches = async () => {
    if (!isSignedIn || !user) return;

    try {
      setLoading(true);

      // First get the user's profile ID
      const response = await fetch(`/api/profile?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userProfile = await response.json();
      if (!userProfile) {
        router.push('/create-profile');
        return;
      }

      // Then get their matches
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, 
          created_at, 
          updated_at,
          user1: user1_id(id, display_name, age, photos(storage_path, is_primary)),
          user2: user2_id(id, display_name, age, photos(storage_path, is_primary))
        `)
        .eq('status', 'matched')
        .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
        
      console.log('Raw match data:', JSON.stringify(data, null, 2));

      // Transform data to get the matched profile information
      const formattedMatches = data.map((match: any) => {
        // Determine which user is the match (not the current user)
        const isUser1 = match.user1?.id === userProfile.id;
        const matchedProfile = isUser1 ? match.user2 : match.user1;
        
        if (!matchedProfile || typeof matchedProfile !== 'object') {
          console.error('Matched profile not found or invalid', match);
          return null;
        }
        
        // Get photo URL
        let photoUrl = null;
        
        try {
          if (Array.isArray(matchedProfile.photos) && matchedProfile.photos.length > 0) {
            // Get primary photo or first one
            const primaryPhoto = matchedProfile.photos.find((p: any) => p.is_primary);
            const photoToUse = primaryPhoto || matchedProfile.photos[0];
            
            if (photoToUse?.storage_path) {
              const { data: urlData } = supabase.storage.from('photos').getPublicUrl(photoToUse.storage_path);
              photoUrl = urlData.publicUrl;
            }
          }

          return {
            id: match.id,
            profile: {
              id: matchedProfile.id || 'unknown',
              display_name: matchedProfile.display_name || 'Unknown User',
              age: matchedProfile.age,
              photo_url: photoUrl,
            },
            created_at: match.created_at,
            updated_at: match.updated_at,
            has_unread_messages: false, // This would need to be determined from messages table
          };
        } catch (err) {
          console.error('Error processing match:', err, match);
          return null;
        }
      }).filter(Boolean) as Match[];

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
      return;
    }

    if (isLoaded && isSignedIn) {
      loadMatches();
    }
  }, [isLoaded, isSignedIn]);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 pb-20">
        <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="ml-auto">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No matches
  if (matches.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 pb-20">
        <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-gray-500 mb-6">
            Start discovering profiles and liking the ones you're interested in.
            When someone likes you back, you'll see them here!
          </p>
          <Link href="/discover">
            <Button>Start Discovering</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Display matches
  return (
    <div className="container mx-auto py-8 px-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              {/* Profile photo */}
              <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-200">
                {match.profile.photo_url ? (
                  <Image
                    src={match.profile.photo_url}
                    alt={`${match.profile.display_name}'s photo`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xl font-bold">
                      {match.profile.display_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Match info */}
              <div>
                <h3 className="font-medium">
                  {match.profile.display_name}
                  {match.profile.age && <span className="text-gray-500">, {match.profile.age}</span>}
                </h3>
                <p className="text-sm text-gray-500">
                  Matched {new Date(match.created_at).toLocaleDateString()}
                </p>
                {match.has_unread_messages && (
                  <Badge variant="secondary" className="mt-1">New message</Badge>
                )}
              </div>
              
              {/* Message button */}
              <Link href={`/messages/${match.id}`} className="ml-auto">
                <Button size="icon" variant="outline" className="rounded-full h-10 w-10">
                  <MessageSquare size={18} />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 