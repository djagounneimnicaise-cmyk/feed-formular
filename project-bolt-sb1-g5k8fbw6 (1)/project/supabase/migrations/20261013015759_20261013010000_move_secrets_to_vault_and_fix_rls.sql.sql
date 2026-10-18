/*
# Move RESEND_API_KEY to Supabase Vault and fix RLS issues

## Summary

This migration moves API key storage from the plaintext `service_secrets` table
to Supabase Vault (encrypted storage), and fixes several RLS policy issues
across all tables.

## Changes

### 1. Supabase Vault — store RESEND_API_KEY
- Uses vault.create_secret() to store RESEND_API_KEY encrypted at rest.
- Only the service role (used by edge functions) can retrieve it via the
  SECURITY DEFINER function below.
- The key is stored with a placeholder value 'PLACEHOLDER_REPLACE_ME'.
  The user must update it with their actual Resend API key.

### 2. New function: get_vault_secret(key_name text)
- SECURITY DEFINER function that reads a secret from vault.decrypted_secrets.
- Runs as the function owner, bypassing RLS on vault tables.
- REVOKE EXECUTE FROM anon — only the service role can call it.
- Edge functions call: supabase.rpc('get_vault_secret', { key_name: 'RESEND_API_KEY' })

### 3. RLS fix: service_secrets table
- Previous: RLS enabled but NO policies, anon/authenticated had full CRUD.
- Fix: REVOKE all from anon and authenticated. Only service role can access.

### 4. RLS fix: app_config table
- Previous: update policy used FOR ALL (covered INSERT + DELETE too).
- Fix: Replace with FOR UPDATE only.

### 5. RLS fix: otp_codes table
- Previous: UPDATE used USING (true) — anyone could modify OTP codes.
- Fix: Revoke UPDATE from anon/authenticated. Only service role can update.

### 6. RLS fix: subscriptions table
- Previous: update policy was FOR ALL (covered INSERT + DELETE too).
- Fix: Replace with FOR UPDATE only.

## Important Notes
1. RESEND_API_KEY is stored with a placeholder. Update it with your actual key.
2. The get_vault_secret function is SECURITY DEFINER; EXECUTE revoked from anon.
3. service_secrets is now locked down — use Vault for all new secrets.
*/

-- ============================================================
-- 1. Store RESEND_API_KEY in Supabase Vault
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'RESEND_API_KEY') THEN
    PERFORM vault.create_secret(
      'PLACEHOLDER_REPLACE_ME',
      'RESEND_API_KEY',
      'Resend API key for sending transactional emails'
    );
  END IF;
END
$$;

-- ============================================================
-- 2. SECURITY DEFINER function to read vault secrets
-- ============================================================
CREATE OR REPLACE FUNCTION get_vault_secret(key_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vault
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = key_name
  LIMIT 1;

  RETURN secret_value;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_vault_secret(text) FROM anon, authenticated;

-- ============================================================
-- 3. Lock down service_secrets table
-- ============================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON service_secrets FROM anon, authenticated;

-- ============================================================
-- 4. Fix app_config: replace FOR ALL with FOR UPDATE
-- ============================================================
DROP POLICY IF EXISTS "update_app_config_admin" ON app_config;
CREATE POLICY "update_app_config_admin" ON app_config FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- ============================================================
-- 5. Fix otp_codes: revoke UPDATE from anon/authenticated
-- ============================================================
DROP POLICY IF EXISTS "update_otp" ON otp_codes;
REVOKE UPDATE ON otp_codes FROM anon, authenticated;

-- ============================================================
-- 6. Fix subscriptions: replace FOR ALL with FOR UPDATE
-- ============================================================
DROP POLICY IF EXISTS "update_own_sub" ON subscriptions;
CREATE POLICY "update_own_sub" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
