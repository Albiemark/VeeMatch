'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Conversation = {
  id: string;
  match_id: string;
  profile: {
    id: string;
    display_name: string;
    photo_url?: string;
  };
  last_message?: {
    content: string;
    sent_at: string;
    is_read: boolean;
  };
};

export default function MessagesPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's conversations
  const loadConversations = async () => {
    if (!isSignedIn || !user) return;

    try {
      setLoading(true);

      // Get the user's profile first
      const response = await fetch(`/api/profile?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userProfile = await response.json();
      if (!userProfile) {
        router.push('/create-profile');
        return;
      }

      // For now we'll just get matches and create placeholder conversations
      // In a real app, you would fetch actual message data
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id, 
          created_at,
          user1: user1_id(id, display_name, photos(storage_path, is_primary)),
          user2: user2_id(id, display_name, photos(storage_path, is_primary))
        `)
        .eq('status', 'matched')
        .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      // Create conversation objects from matches
      const formattedConversations = matchesData.map((match: any) => {
        try {
          // Determine which user is the match (not the current user)
          const isUser1 = match.user1?.id === userProfile.id;
          const matchedUser = isUser1 ? match.user2 : match.user1;
          
          if (!matchedUser || typeof matchedUser !== 'object') {
            console.error('Matched user not found or invalid', match);
            return null;
          }
          
          // Get photo URL
          let photoUrl = null;
          if (Array.isArray(matchedUser.photos) && matchedUser.photos.length > 0) {
            const primaryPhoto = matchedUser.photos.find((p: any) => p.is_primary);
            const photoToUse = primaryPhoto || matchedUser.photos[0];
            
            if (photoToUse?.storage_path) {
              const { data: urlData } = supabase.storage.from('photos').getPublicUrl(photoToUse.storage_path);
              photoUrl = urlData.publicUrl;
            }
          }

          // Random placeholder date within the last week
          const randomDaysAgo = Math.floor(Math.random() * 7);
          const randomDate = new Date();
          randomDate.setDate(randomDate.getDate() - randomDaysAgo);

          return {
            id: `conv-${match.id}`,
            match_id: match.id,
            profile: {
              id: matchedUser.id || 'unknown',
              display_name: matchedUser.display_name || 'Unknown User',
              photo_url: photoUrl,
            },
            last_message: randomDaysAgo < 3 ? {
              content: "Let's implement this feature next!",
              sent_at: randomDate.toISOString(),
              is_read: randomDaysAgo > 0,
            } : undefined,
          };
        } catch (err) {
          console.error('Error processing conversation:', err, match);
          return null;
        }
      }).filter(Boolean) as Conversation[];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
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
      loadConversations();
    }
  }, [isLoaded, isSignedIn]);

  // Format the date/time for messages
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within the last week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 pb-20">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No conversations
  if (conversations.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 pb-20">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-gray-500 mb-6">
            When you match with someone, you'll be able to start a conversation!
          </p>
          <Link href="/discover">
            <Button>Find Matches</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Display conversations
  return (
    <div className="container mx-auto py-8 px-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Link href={`/messages/${conversation.match_id}`} key={conversation.id}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                {/* Profile photo */}
                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-200">
                  {conversation.profile.photo_url ? (
                    <Image
                      src={conversation.profile.photo_url}
                      alt={`${conversation.profile.display_name}'s photo`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg font-bold">
                        {conversation.profile.display_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Conversation info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {conversation.profile.display_name}
                  </h3>
                  {conversation.last_message ? (
                    <p className={`text-sm truncate ${conversation.last_message.is_read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                      {conversation.last_message.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Start a conversation
                    </p>
                  )}
                </div>
                
                {/* Time and unread indicator */}
                <div className="text-right flex flex-col items-end">
                  {conversation.last_message && (
                    <>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(conversation.last_message.sent_at)}
                      </span>
                      {!conversation.last_message.is_read && (
                        <Badge className="mt-1" variant="default">
                          New
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          This is a placeholder UI for the messages feature!
        </p>
      </div>
    </div>
  );
} 