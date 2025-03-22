export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  bio?: string;
  occupation?: string;
  education?: string;
  location_city?: string;
  location_country?: string;
  photos?: string[];
  photo_url?: string;
  relationship_goals?: 'long-term' | 'casual-dating' | 'friendship' | 'not-sure-yet';
  drinking?: 'never' | 'rarely' | 'socially' | 'regularly';
  smoking?: 'never' | 'socially' | 'regularly';
  children?: 'have' | 'want' | 'don\'t want' | 'open to it';
  profile_complete: boolean;
  created_at?: string;
  updated_at?: string;
  passions?: string[];
}

export interface MatchPreference {
  user_id: string;
  min_age: number;
  max_age: number;
  interested_in: string[];
  max_distance: number;
  show_me: boolean;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'matched' | 'rejected';
  created_at: string;
  updated_at: string;
  user1?: UserProfile;
  user2?: UserProfile;
} 