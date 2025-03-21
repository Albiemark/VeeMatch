-- Create a new storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Set up storage policies
CREATE POLICY "Photos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');

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