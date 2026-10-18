/*
# Revoke EXECUTE on handle_new_user trigger function

handle_new_user is a SECURITY DEFINER trigger function that creates
a profile row when a new auth user signs up. It's a trigger, not an
RPC, so it should not be callable directly via the API.

## Changes
1. REVOKE EXECUTE FROM PUBLIC, anon, authenticated
   The trigger still works because it runs as the function owner.
*/

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM authenticated;
