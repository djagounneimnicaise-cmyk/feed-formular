/*
# Kkiapay payment activation — server-side subscription activation

1. Modified Tables
- `subscriptions` — added `kkiapay_transaction_id` (text, nullable). Stores the
  KKiaPay transaction reference of a paid subscription so a payment can never
  activate more than one subscription (unique partial index).

2. New Function
- `activate_subscription(p_plan text, p_transaction_id text)` — SECURITY DEFINER.
  Called by the verify-kkiapay edge function AFTER the payment has been verified
  with KKiaPay's servers. It:
    - requires an authenticated user (auth.uid());
    - resolves the plan duration server-side (daily 1d, three_days 3d,
      weekly 7d, biweekly 14d, monthly 30d) — the browser never decides dates;
    - extends from the user's current active subscription if one exists,
      otherwise from now;
    - inserts a `subscriptions` row with payment_method 'kkiapay' and
      payment_status 'success';
    - is idempotent: replaying the same transaction id returns the existing
      expiry without inserting a second row.
  The browser has no INSERT/UPDATE privilege on `subscriptions`, so this
  function is the only door to a paid activation.

3. Security
- EXECUTE on the function granted to `authenticated` and `service_role` only
  (revoked from PUBLIC and `anon`).
- No data is deleted or changed destructively; the new column is additive.
*/

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS kkiapay_transaction_id text;

CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_kkiapay_tx
  ON public.subscriptions (kkiapay_transaction_id)
  WHERE kkiapay_transaction_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.activate_subscription(p_plan text, p_transaction_id text)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_days int;
  v_base timestamptz;
  v_expires timestamptz;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Idempotency: a transaction id can only ever pay once.
  IF p_transaction_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.subscriptions WHERE kkiapay_transaction_id = p_transaction_id
  ) THEN
    RETURN (
      SELECT expires_at FROM public.subscriptions
      WHERE kkiapay_transaction_id = p_transaction_id
      ORDER BY expires_at DESC LIMIT 1
    );
  END IF;

  v_days := CASE p_plan
    WHEN 'daily' THEN 1
    WHEN 'three_days' THEN 3
    WHEN 'weekly' THEN 7
    WHEN 'biweekly' THEN 14
    WHEN 'monthly' THEN 30
    ELSE NULL END;
  IF v_days IS NULL THEN
    RAISE EXCEPTION 'unknown_plan';
  END IF;

  SELECT s.expires_at INTO v_base
  FROM public.subscriptions s
  WHERE s.user_id = v_user AND s.payment_status = 'success' AND s.expires_at > now()
  ORDER BY s.expires_at DESC
  LIMIT 1;
  v_base := COALESCE(v_base, now());
  v_expires := v_base + make_interval(days => v_days);

  BEGIN
    INSERT INTO public.subscriptions
      (user_id, plan, payment_method, payment_status, amount_xof, started_at, expires_at, kkiapay_transaction_id)
    VALUES
      (v_user, p_plan, 'kkiapay', 'success',
       CASE p_plan WHEN 'daily' THEN 500 WHEN 'three_days' THEN 1200 WHEN 'weekly' THEN 2500 WHEN 'biweekly' THEN 3500 ELSE 6000 END,
       now(), v_expires, p_transaction_id);
  EXCEPTION WHEN unique_violation THEN
    RETURN (
      SELECT expires_at FROM public.subscriptions
      WHERE kkiapay_transaction_id = p_transaction_id
      ORDER BY expires_at DESC LIMIT 1
    );
  END;

  RETURN v_expires;
END $$;

REVOKE ALL ON FUNCTION public.activate_subscription(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_subscription(text, text) TO authenticated, service_role;
