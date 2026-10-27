/*
# Allow anonymous read of app_config

1. Purpose
   The previous lockdown migration revoked write access on `app_config` but the
   SELECT policy was restricted to signed-in users. The app checks the latest
   version before the user signs in, so this migration adds a read-only policy
   for anonymous visitors. Writing stays admin-only.

2. Security changes
   - `app_config`: new SELECT policy for `anon` (read-only, no user data in
     this table — only version numbers and update messages).
   - Write access remains restricted to the administrator only.
*/

DROP POLICY IF EXISTS "select_app_config_anon" ON public.app_config;

CREATE POLICY "select_app_config_anon"
ON public.app_config FOR SELECT
TO anon
USING (true);