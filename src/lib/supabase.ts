import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper function to get user's profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Helper function to create a new profile
export async function createProfile(profileData: {
  user_id: string;
  display_name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  bio?: string;
  occupation?: string;
  education?: string;
  location_city?: string;
  location_country?: string;
  relationship_goals?: 'long-term' | 'casual-dating' | 'friendship' | 'not-sure-yet';
  drinking?: 'never' | 'rarely' | 'socially' | 'regularly';
  smoking?: 'never' | 'socially' | 'regularly';
  children?: 'have' | 'want' | 'don\'t want' | 'open to it';
}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to update a profile
export async function updateProfile(userId: string, updates: {
  display_name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  bio?: string;
  occupation?: string;
  education?: string;
  location_city?: string;
  location_country?: string;
  relationship_goals?: 'long-term' | 'casual-dating' | 'friendship' | 'not-sure-yet';
  drinking?: 'never' | 'rarely' | 'socially' | 'regularly';
  smoking?: 'never' | 'socially' | 'regularly';
  children?: 'have' | 'want' | 'don\'t want' | 'open to it';
  photos?: string[];
  passions?: string[];
  interested_in?: string[];
  profile_complete?: boolean;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to upload a photo
export async function uploadPhoto(file: File, profileId: string) {
  // First get the profile to get the user ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single();

  if (profileError) throw profileError;
  if (!profile) throw new Error('Profile not found');

  const fileExt = file.name.split('.').pop();
  // Use the full Clerk user ID for the folder name
  const fileName = `${profile.user_id}/${Math.random()}.${fileExt}`;

  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName);

  // Insert the photo record
  const { data, error } = await supabase
    .from('photos')
    .insert([
      {
        profile_id: profileId,
        storage_path: fileName,
        order_index: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  return { ...data, url: publicUrl };
}

// Helper function to get user's photos
export async function getUserPhotos(profileId: string) {
  if (!profileId) {
    throw new Error('Profile ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('profile_id', profileId)
      .order('order_index');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Add public URLs to each photo
    return data.map(photo => {
      if (!photo.storage_path) {
        console.warn('Photo missing storage_path:', photo);
        return photo;
      }
      return {
        ...photo,
        url: supabase.storage
          .from('photos')
          .getPublicUrl(photo.storage_path).data.publicUrl
      };
    });
  } catch (error) {
    console.error('Error in getUserPhotos:', error);
    throw error;
  }
}

// Helper function to delete a photo
export async function deletePhoto(photoId: string) {
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (error) throw error;
}

// Helper function to get user's matches
export async function getUserMatches(profileId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:profiles!matches_user1_id_fkey(*),
      user2:profiles!matches_user2_id_fkey(*)
    `)
    .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`);

  if (error) throw error;
  return data;
}

// Helper function to create a match
export async function createMatch(user1Id: string, user2Id: string) {
  const { data, error } = await supabase
    .from('matches')
    .insert([
      {
        user1_id: user1Id,
        user2_id: user2Id,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to update match status
export async function updateMatchStatus(matchId: string, status: 'pending' | 'matched' | 'rejected') {
  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to get messages for a match
export async function getMatchMessages(matchId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*)
    `)
    .eq('match_id', matchId)
    .order('created_at');

  if (error) throw error;
  return data;
}

// Helper function to send a message
export async function sendMessage(matchId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        match_id: matchId,
        sender_id: senderId,
        content,
        status: 'sent',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to update message status
export async function updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read') {
  const { data, error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to get user's preferences
export async function getUserPreferences(profileId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', profileId)
    .maybeSingle();

  if (error) throw error;

  // Return default preferences if none found
  if (!data) {
    return {
      user_id: profileId,
      min_age: 18,
      max_age: 99,
      interested_in: [],
      max_distance: 100,
      show_me: true
    };
  }

  return data;
}

// Helper function to update user preferences
export async function updateUserPreferences(profileId: string, preferences: {
  min_age?: number;
  max_age?: number;
  interested_in?: string[];
  max_distance?: number;
  show_me?: boolean;
}) {
  // Check if preferences already exist
  const { data: existingPrefs, error: checkError } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('user_id', profileId)
    .maybeSingle();

  if (checkError) throw checkError;

  // If preferences exist, update them
  if (existingPrefs) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Otherwise create new preferences
  const { data, error } = await supabase
    .from('user_preferences')
    .insert([
      {
        user_id: profileId,
        min_age: preferences.min_age || 18,
        max_age: preferences.max_age || 99,
        interested_in: preferences.interested_in || [],
        max_distance: preferences.max_distance || 100,
        show_me: preferences.show_me !== undefined ? preferences.show_me : true
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to get user's notifications
export async function getUserNotifications(profileId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Helper function to mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to block a user
export async function blockUser(blockerId: string, blockedId: string) {
  const { data, error } = await supabase
    .from('blocked_users')
    .insert([
      {
        blocker_id: blockerId,
        blocked_id: blockedId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to unblock a user
export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) throw error;
}

// Helper function to get blocked users
export async function getBlockedUsers(profileId: string) {
  const { data, error } = await supabase
    .from('blocked_users')
    .select(`
      *,
      blocked:profiles!blocked_users_blocked_id_fkey(*)
    `)
    .eq('blocker_id', profileId);

  if (error) throw error;
  return data;
}

export async function setPrimaryPhoto(profileId: string, photoId: string) {
  try {
    // First, unset any existing primary photo
    const { error: unsetError } = await supabase
      .from('photos')
      .update({ is_primary: false })
      .eq('profile_id', profileId);

    if (unsetError) throw unsetError;

    // Then set the new primary photo
    const { error: setError } = await supabase
      .from('photos')
      .update({ is_primary: true })
      .eq('id', photoId)
      .eq('profile_id', profileId);

    if (setError) throw setError;

    return { success: true };
  } catch (error) {
    console.error('Error setting primary photo:', error);
    throw error;
  }
}

// Helper function to get potential matches (discover)
export async function getDiscoverProfiles(userId: string) {
  // First we need the current user's profile ID
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, gender')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;
  if (!userProfile) throw new Error('User profile not found');

  // Get user preferences if they exist, otherwise use defaults
  const { data: preferences, error: prefError } = await supabase
    .from('user_preferences')
    .select('min_age, max_age, interested_in, max_distance')
    .eq('user_id', userProfile.id)
    .maybeSingle();

  // Default preferences if none set
  const minAge = preferences?.min_age || 18;
  const maxAge = preferences?.max_age || 99;
  const interestedIn = preferences?.interested_in || null; // null means any gender

  // Get existing matches and blocks to exclude these users
  const { data: matchedUsers, error: matchError } = await supabase
    .from('matches')
    .select('user1_id, user2_id')
    .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`);

  if (matchError) throw matchError;

  // Get blocked users
  const { data: blockedUsers, error: blockError } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userProfile.id);

  if (blockError) throw blockError;

  // Create arrays of users to exclude
  const excludeIds = new Set<string>();
  excludeIds.add(userProfile.id); // Exclude self

  // Add matched users to exclusion list
  if (matchedUsers && matchedUsers.length > 0) {
    matchedUsers.forEach(match => {
      if (match.user1_id === userProfile.id) {
        excludeIds.add(match.user2_id);
      } else {
        excludeIds.add(match.user1_id);
      }
    });
  }

  // Add blocked users to exclusion list
  if (blockedUsers && blockedUsers.length > 0) {
    blockedUsers.forEach(block => {
      excludeIds.add(block.blocked_id);
    });
  }

  // Convert exclusion set to array
  const excludeIdsArray = Array.from(excludeIds);

  // Build the query
  let query = supabase
    .from('profiles')
    .select(`
      *,
      photos(storage_path, is_primary, order_index),
      profile_passions(
        passions(id, name)
      )
    `)
    .eq('profile_complete', true)
    .not('id', 'in', `(${excludeIdsArray.join(',')})`)
    .gte('age', minAge)
    .lte('age', maxAge);

  // Add gender filter if user has preferences
  if (interestedIn && interestedIn.length > 0) {
    query = query.in('gender', interestedIn);
  }

  // Limit the number of profiles to return
  query = query.limit(20);

  const { data, error } = await query;

  if (error) throw error;

  // Transform the data to match our UserProfile interface
  return data.map((profile: any) => {
    // Get the primary photo if available, otherwise the first photo
    const primaryPhoto = profile.photos?.find((p: any) => p.is_primary);
    const firstPhoto = profile.photos?.length > 0 ? profile.photos[0] : null;
    const photoPath = primaryPhoto?.storage_path || firstPhoto?.storage_path;
    
    // Get photo URL if there's a path
    const photoUrl = photoPath 
      ? supabase.storage.from('photos').getPublicUrl(photoPath).data.publicUrl 
      : null;

    // Transform passions to a simple array of strings
    const passions = profile.profile_passions?.map((pp: any) => pp.passions?.name) || [];

    return {
      id: profile.id,
      user_id: profile.user_id,
      display_name: profile.display_name,
      age: profile.age,
      gender: profile.gender,
      bio: profile.bio,
      occupation: profile.occupation,
      education: profile.education,
      location_city: profile.location_city,
      location_country: profile.location_country,
      photos: photoUrl ? [photoUrl] : [],
      relationship_goals: profile.relationship_goals,
      drinking: profile.drinking,
      smoking: profile.smoking,
      children: profile.children,
      profile_complete: profile.profile_complete,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      passions,
    };
  });
}

// Helper function to like a profile (create a pending match)
export async function likeProfile(currentProfileId: string, targetProfileId: string) {
  // Check if there's already a match where the current user is user2
  const { data: existingMatch, error: matchError } = await supabase
    .from('matches')
    .select('id, status')
    .eq('user1_id', targetProfileId)
    .eq('user2_id', currentProfileId)
    .maybeSingle();

  if (matchError) throw matchError;

  // If there's an existing match (the other user liked us first), update it to matched
  if (existingMatch) {
    const { data, error } = await supabase
      .from('matches')
      .update({ status: 'matched', updated_at: new Date().toISOString() })
      .eq('id', existingMatch.id)
      .select()
      .single();

    if (error) throw error;
    return { ...data, isNewMatch: true };
  }

  // Otherwise create a new pending match
  const { data, error } = await supabase
    .from('matches')
    .insert([
      {
        user1_id: currentProfileId,
        user2_id: targetProfileId,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return { ...data, isNewMatch: false };
}

// Helper function to pass (reject) a profile
export async function passProfile(currentProfileId: string, targetProfileId: string) {
  // Check if there's already a match where the current user is user2
  const { data: existingMatch, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .eq('user1_id', targetProfileId)
    .eq('user2_id', currentProfileId)
    .maybeSingle();

  if (matchError) throw matchError;

  // If there's an existing match, update it to rejected
  if (existingMatch) {
    const { data, error } = await supabase
      .from('matches')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', existingMatch.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Otherwise create a new rejected match
  const { data, error } = await supabase
    .from('matches')
    .insert([
      {
        user1_id: currentProfileId,
        user2_id: targetProfileId,
        status: 'rejected'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
} 