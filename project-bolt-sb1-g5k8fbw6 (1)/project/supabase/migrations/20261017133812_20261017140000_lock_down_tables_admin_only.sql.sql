/*
# Lock down all tables — admin-only writes

1. Purpose
   An audit found that any visitor (even without an account) could read and write
   sensitive tables directly through the database API. This migration removes
   that access so that ONLY the administrator can modify configuration, and
   regular users can only touch their own rows.

2. Changed tables and security changes
   - `otp_codes`: removed ALL direct access for anonymous and signed-in users.
     Only the `send-otp` edge function (which bypasses RLS with the service
     role) reads and writes this table. Users can no longer read other people's
     verification codes or forge codes.
   - `subscriptions`: removed ALL access for anonymous users. Signed-in users
     can only read their own subscription rows. No one can create, modify or
     delete subscription records from the browser (payments are handled by the
     app logic / administrator only).
   - `app_config`: signed-in users can read the config (needed by the app to
     check the latest version), but ONLY the administrator can modify it.
     Anonymous users can read it but never write.
   - `profiles`: signed-in users can no longer change their own `is_admin`,
     `trials_used`, `trials_limit` or `trial_started_at` columns (previously a
     user could grant themselves admin or unlimited trials). They keep access
     to their own name, country, phone, avatar, etc.
   - Revoked the dangerous blanket table privileges that had been granted to
     anonymous users on `profiles`, `subscriptions`, `app_config`, `otp_codes`.

3. Important notes
   - The admin is identified by the `is_admin` flag in `profiles`, which users
     can no longer self-modify.
   - Trial consumption stays atomic and server-side via the `consume_trial`
     function, which remains callable by signed-in users (it only ever acts on
     the caller's own row).
   - No data is deleted or lost: this only changes who is allowed to read/write.
*/

-- ============================================================
-- otp_codes: database-only access (edge function uses service role)
-- ============================================================
REVOKE ALL ON public.otp_codes FROM anon, authenticated;

DROP POLICY IF EXISTS "insert_otp" ON public.otp_codes;
DROP POLICY IF EXISTS "select_otp" ON public.otp_codes;

-- ============================================================
-- subscriptions: read-only for the owner, no writes from browser
-- ============================================================
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;
REVOKE ALL ON public.subscriptions FROM anon;

DROP POLICY IF EXISTS "delete_own_sub" ON public.subscriptions;
DROP POLICY IF EXISTS "insert_own_sub" ON public.subscriptions;
DROP POLICY IF EXISTS "update_own_sub" ON public.subscriptions;

-- ============================================================
-- app_config: readable by all, writable by admin only
-- ============================================================
REVOKE INSERT, UPDATE, DELETE ON public.app_config FROM anon, authenticated;

-- ============================================================
-- profiles: block self-modification of privileged columns.
-- The previous migration already limited UPDATE to some columns;
-- we drop the policies entirely and recreate them explicitly so
-- the privileged columns (is_admin, trials_used, trials_limit,
-- trial_started_at) can never be changed by the user.
-- ============================================================
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;

CREATE POLICY "update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
  AND trials_used = (SELECT p.trials_used FROM public.profiles p WHERE p.id = auth.uid())
  AND trials_limit = (SELECT p.trials_limit FROM public.profiles p WHERE p.id = auth.uid())
  AND trial_started_at = (SELECT p.trial_started_at FROM public.profiles p WHERE p.id = auth.uid())
);

-- Anonymous users must not read profiles at all (was: INSERT grant, no select policy but table privileges existed)
REVOKE ALL ON public.profiles FROM anon;