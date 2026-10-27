/*
# Block self-modification of trial and admin columns

1. Purpose
- Until now, any signed-in user could update their own `profiles` row entirely
  (the row-level policy is `auth.uid() = id` with full column privileges).
  That allowed a user to reset `trials_used` to 0 directly, bypassing the
  `consume_trial` server logic, and to grant themselves `is_admin = true`.

2. Changes (privileges only — no columns or data are touched)
- Revoke the blanket table-level UPDATE grant on `profiles` from
  `anon` and `authenticated`.
- Grant back UPDATE restricted to the user-editable profile fields only:
  nom, prenom, pays, ville, telephone, email, avatar_url, updated_at.
- Trial columns (trials_used, trials_limit, trial_started_at) and the admin
  flag (is_admin) become read-only for end users; only the server-side
  `consume_trial` function (SECURITY DEFINER) and admins manage them.

3. Security
- SELECT / INSERT / DELETE policies are unchanged.
- The RPC `consume_trial` is unaffected: SECURITY DEFINER functions run with
  the owner's privileges and do not rely on the caller's table grants.
*/

REVOKE UPDATE ON TABLE public.profiles FROM anon, authenticated;

GRANT UPDATE (nom, prenom, pays, ville, telephone, email, avatar_url, created_at)
  ON TABLE public.profiles TO authenticated;
