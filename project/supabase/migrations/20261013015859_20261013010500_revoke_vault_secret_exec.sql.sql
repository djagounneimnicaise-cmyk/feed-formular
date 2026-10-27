/*
# Revoke EXECUTE on get_vault_secret from anon and authenticated

The previous migration's REVOKE didn't take effect because PostgREST
auto-grants EXECUTE on functions exposed via the API. This migration
re-asserts the revocation and also revokes from PUBLIC to cover all
roles except the function owner (service role).

## Changes
1. REVOKE EXECUTE ON FUNCTION get_vault_secret(text) FROM PUBLIC, anon, authenticated
2. Verify the function is only callable by the service role
*/

REVOKE EXECUTE ON FUNCTION get_vault_secret(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_vault_secret(text) FROM anon;
REVOKE EXECUTE ON FUNCTION get_vault_secret(text) FROM authenticated;
