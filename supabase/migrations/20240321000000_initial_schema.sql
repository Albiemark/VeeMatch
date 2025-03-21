-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'other');
CREATE TYPE relationship_goal_type AS ENUM ('long-term', 'casual-dating', 'friendship', 'not-sure-yet');
CREATE TYPE drinking_type AS ENUM ('never', 'rarely', 'socially', 'regularly');
CREATE TYPE smoking_type AS ENUM ('never', 'socially', 'regularly');
CREATE TYPE children_type AS ENUM ('have', 'want', 'don''t want', 'open to it');
CREATE TYPE match_status_type AS ENUM ('pending', 'matched', 'rejected');
CREATE TYPE message_status_type AS ENUM ('sent', 'delivered', 'read');

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    age INTEGER CHECK (age >= 18),
    gender gender_type,
    bio TEXT,
    occupation TEXT,
    education TEXT,
    location_city TEXT,
    location_country TEXT,
    location_coordinates POINT,
    relationship_goals relationship_goal_type,
    drinking drinking_type,
    smoking smoking_type,
    children children_type,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    CONSTRAINT valid_age CHECK (age >= 18 AND age <= 120)
);

-- Photos table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_index INTEGER NOT NULL
);

-- Add unique constraint for primary photo after table creation
CREATE UNIQUE INDEX one_primary_photo ON photos (profile_id) WHERE is_primary = TRUE;

-- Passions/Interests table
CREATE TABLE passions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- Profile-Passions junction table
CREATE TABLE profile_passions (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    passion_id UUID REFERENCES passions(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, passion_id)
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status match_status_type DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id),
    CONSTRAINT no_self_match CHECK (user1_id != user2_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status message_status_type DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    data JSONB
);

-- User Preferences table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    min_age INTEGER CHECK (min_age >= 18),
    max_age INTEGER CHECK (max_age <= 120),
    interested_in gender_type[],
    max_distance INTEGER, -- in kilometers
    show_me BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_age_range CHECK (min_age <= max_age)
);

-- Blocked Users table
CREATE TABLE blocked_users (
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_photos_profile_id ON photos(profile_id);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked_id ON blocked_users(blocked_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "Users can view their own photos"
    ON photos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own photos"
    ON photos FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own photos"
    ON photos FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id = auth.uid()
    ));

-- Matches policies
CREATE POLICY "Users can view their own matches"
    ON matches FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = user1_id
        UNION
        SELECT user_id FROM profiles WHERE id = user2_id
    ));

-- Messages policies
CREATE POLICY "Users can view messages in their matches"
    ON messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM matches
        WHERE matches.id = messages.match_id
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE id = matches.user1_id AND user_id = auth.uid())
            OR
            EXISTS (SELECT 1 FROM profiles WHERE id = matches.user2_id AND user_id = auth.uid())
        )
    ));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (user_id = auth.uid());

-- Blocked users policies
CREATE POLICY "Users can view their own blocked users"
    ON blocked_users FOR SELECT
    USING (blocker_id = auth.uid());

CREATE POLICY "Users can block other users"
    ON blocked_users FOR INSERT
    WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock users"
    ON blocked_users FOR DELETE
    USING (blocker_id = auth.uid());

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 