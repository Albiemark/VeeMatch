-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own photos" ON photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON photos;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own blocked users" ON blocked_users;
DROP POLICY IF EXISTS "Users can block other users" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock users" ON blocked_users;

-- Drop foreign key constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE blocked_users DROP CONSTRAINT IF EXISTS blocked_users_blocker_id_fkey;
ALTER TABLE blocked_users DROP CONSTRAINT IF EXISTS blocked_users_blocked_id_fkey;

-- Alter column types to TEXT using type casting
ALTER TABLE profiles 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE notifications 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE user_preferences 
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE blocked_users 
    ALTER COLUMN blocker_id TYPE TEXT USING blocker_id::TEXT,
    ALTER COLUMN blocked_id TYPE TEXT USING blocked_id::TEXT;

-- Recreate policies with updated user_id handling
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can view their own photos"
    ON photos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id = current_setting('request.jwt.claims')::json->>'sub'
    ));

CREATE POLICY "Users can insert their own photos"
    ON photos FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id = current_setting('request.jwt.claims')::json->>'sub'
    ));

CREATE POLICY "Users can delete their own photos"
    ON photos FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id = current_setting('request.jwt.claims')::json->>'sub'
    ));

CREATE POLICY "Users can view their own matches"
    ON matches FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = user1_id AND user_id = current_setting('request.jwt.claims')::json->>'sub'
        UNION
        SELECT 1 FROM profiles WHERE id = user2_id AND user_id = current_setting('request.jwt.claims')::json->>'sub'
    ));

CREATE POLICY "Users can view messages in their matches"
    ON messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM matches
        WHERE matches.id = messages.match_id
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE id = matches.user1_id AND user_id = current_setting('request.jwt.claims')::json->>'sub')
            OR
            EXISTS (SELECT 1 FROM profiles WHERE id = matches.user2_id AND user_id = current_setting('request.jwt.claims')::json->>'sub')
        )
    ));

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can view their own blocked users"
    ON blocked_users FOR SELECT
    USING (blocker_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can block other users"
    ON blocked_users FOR INSERT
    WITH CHECK (blocker_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can unblock users"
    ON blocked_users FOR DELETE
    USING (blocker_id = current_setting('request.jwt.claims')::json->>'sub');
