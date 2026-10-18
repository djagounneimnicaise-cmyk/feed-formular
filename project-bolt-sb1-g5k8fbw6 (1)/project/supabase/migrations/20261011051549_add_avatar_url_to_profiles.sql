/*
# Add avatar_url column to profiles table

1. Modified Tables
- `profiles` — added `avatar_url` (text, nullable) to store the public URL of the user's profile photo.

2. Storage
- Creates a `avatars` storage bucket (public) for user profile photos.
- Adds storage policies so each authenticated user can upload/read/delete only their own avatar.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "select_own_avatar" ON storage.objects;
CREATE POLICY "select_own_avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "insert_own_avatar" ON storage.objects;
CREATE POLICY "insert_own_avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "update_own_avatar" ON storage.objects;
CREATE POLICY "update_own_avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid())
WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "delete_own_avatar" ON storage.objects;
CREATE POLICY "delete_own_avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());
