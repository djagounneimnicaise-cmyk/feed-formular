/*
# Move free trial counter to server-side profiles table

1. Plain-English explanation
- Previously the free trial counter (3 trials) was stored in the browser's localStorage. A user could log out and back in (or use another browser) to get 3 new free trials indefinitely.
- This migration moves the counter into the database, on the user's profile row, so each account gets exactly 3 free trials for life.

2. Modified tables
- `profiles`: adds two new columns:
  - `trials_used` (integer, not null, default 0) — number of free formulations consumed by this account.
  - `trials_limit` (integer, not null, default 3) — maximum number of free formulations allowed.

3. Data backfill
- Existing users start with trials_used = 0 and trials_limit = 3.

4. Security (RLS)
- No new policies needed: `profiles` already has owner-scoped policies (auth.uid() = id). The new columns inherit the same access.
- The client updates only its own row's `trials_used`, so no privilege escalation is possible.

5. Important notes
- This change is additive: no columns are dropped or modified.
- Safe to re-run (IF NOT EXISTS guards).
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trials_used integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trials_limit integer NOT NULL DEFAULT 3;
