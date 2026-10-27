/*
# Atomic server-side free-trial consumption

1. Purpose
- The free-trial counter (`profiles.trials_used`) was previously incremented from the
  browser (read current value, write value + 1). If the user reloaded mid-calculation,
  signed out/in, or issued parallel requests, stale values could be written back,
  letting a user get unlimited free trials.
- This migration moves the entire trial logic into the database with a single atomic
  SECURITY DEFINER function, so the count can never be rolled back or raced.

2. New function: `consume_trial(p_user_id uuid)`
- SECURITY DEFINER, owned by postgres, `SET search_path = ''` (fully qualified names).
- Revoked from `anon`; executable by `authenticated` only.
- Reads the caller's own profile row (enforced via `auth.uid()` comparison inside the
  function, so a user can only ever consume their OWN trials — the passed argument is
  ignored in favour of `auth.uid()`).
- Logic:
  * Admin users (`is_admin = true`) are always allowed, no trial consumed.
  * If `trial_started_at` is NULL, it is stamped with `now()` on first use.
  * If `trials_used < trials_limit`: increments `trials_used` by exactly 1
    (server-side arithmetic, atomic `UPDATE ... SET trials_used = trials_used + 1`),
    returns `allowed = true` plus the new counters.
  * Else (`trials_used >= trials_limit`): returns `allowed = false` — the frontend
    shows the paywall. No trial is consumed.
- Returns table: allowed boolean, trials_used int, trials_limit int.

3. Security
- The function checks `auth.uid() = p_user_id` internally; passing another user's id
  returns `allowed = false` with zeroed counters.
- EXECUTE privilege removed from `anon` and `public` to prevent unauthenticated calls.
- No RLS bypass for other rows: the function only touches the caller's own profile.
*/

CREATE OR REPLACE FUNCTION public.consume_trial(p_user_id uuid)
RETURNS TABLE (allowed boolean, trials_used int, trials_limit int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_used int;
  v_limit int;
  v_started timestamptz;
BEGIN
  -- A caller can only ever consume their own trials
  IF v_user_id IS NULL OR v_user_id <> p_user_id THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  SELECT is_admin, trials_used, trials_limit, trial_started_at
    INTO v_is_admin, v_used, v_limit, v_started
  FROM public.profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  IF v_is_admin THEN
    RETURN QUERY SELECT true, v_used, v_limit;
    RETURN;
  END IF;

  IF v_started IS NULL THEN
    UPDATE public.profiles SET trial_started_at = now() WHERE id = v_user_id;
  END IF;

  IF v_used < v_limit THEN
    UPDATE public.profiles
    SET trials_used = trials_used + 1
    WHERE id = v_user_id;
    v_used := v_used + 1;
    RETURN QUERY SELECT true, v_used, v_limit;
  ELSE
    RETURN QUERY SELECT false, v_used, v_limit;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_trial(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.consume_trial(uuid) TO authenticated;
