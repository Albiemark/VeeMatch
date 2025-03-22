import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/profile';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`id, user_id, display_name, age, gender, bio, profile_complete, photos(storage_path, is_primary)`)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json(null, { status: 404 });
    }
    
    // Format photo URLs if any exist
    let formattedProfile = data as unknown as Partial<UserProfile>;
    formattedProfile.photo_url = undefined;
    
    if (data.photos && data.photos.length > 0) {
      // Find primary photo or use first one
      const primaryPhoto = data.photos.find((photo: any) => photo.is_primary);
      const firstPhoto = data.photos[0];
      const photoPath = primaryPhoto?.storage_path || firstPhoto?.storage_path;
      
      if (photoPath) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(photoPath);
        formattedProfile.photo_url = urlData.publicUrl;
      }
    }
    
    // Remove photos array from response
    delete formattedProfile.photos;
    
    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 