-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON photos;

-- Create new storage policies
CREATE POLICY "Users can upload their own photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] = current_setting('request.jwt.claims')::json->>'sub'
    );

CREATE POLICY "Users can update their own photos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] = current_setting('request.jwt.claims')::json->>'sub'
    );

CREATE POLICY "Users can delete their own photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'photos' AND
        (storage.foldername(name))[1] = current_setting('request.jwt.claims')::json->>'sub'
    );

-- Create new photos table policies
CREATE POLICY "Users can view their own photos"
    ON photos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id::text = current_setting('request.jwt.claims')::json->>'sub'
    ));

CREATE POLICY "Users can insert their own photos"
    ON photos FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id::text = current_setting('request.jwt.claims')::json->>'sub'
    ));

CREATE POLICY "Users can delete their own photos"
    ON photos FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = photos.profile_id
        AND profiles.user_id::text = current_setting('request.jwt.claims')::json->>'sub'
    )); 