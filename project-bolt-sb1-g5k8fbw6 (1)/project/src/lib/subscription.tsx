import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const ADMIN_EMAIL = 'djagounneimnicaise@gmail.com';
const DEFAULT_TRIALS_LIMIT = 3;
// Legacy key shared across users on the same device — removed on startup.
const LEGACY_LS_EXPIRY = 'feed_formular_subscription_expiry';
// Per-user cache only; the subscriptions table in Supabase is the source of truth.
const cacheKeyFor = (userId: string) => `feed_formular_subscription_expiry_${userId}`;

export type PlanKey = 'daily' | 'three_days' | 'weekly' | 'biweekly' | 'monthly';

export type PlanDef = {
  key: PlanKey;
  durationDays: number;
  amountXOF: number;
};

export const PLANS: PlanDef[] = [
  { key: 'daily', durationDays: 1, amountXOF: 500 },
  { key: 'three_days', durationDays: 3, amountXOF: 1200 },
  { key: 'weekly', durationDays: 7, amountXOF: 2500 },
  { key: 'biweekly', durationDays: 14, amountXOF: 3500 },
  { key: 'monthly', durationDays: 30, amountXOF: 6000 },
];

export type SubscriptionStatus = {
  isActive: boolean;
  isAdmin: boolean;
  freeTrialsUsed: number;
  freeTrialsLeft: number;
  expiry: number | null;
  timeLeftText: string;
};

type SubscriptionContextValue = {
  status: SubscriptionStatus;
  consumeTrial: () => Promise<boolean>;
  activatePlan: (plan: PlanKey, serverExpiresAt?: number) => void;
  resetTrials: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

function readCache(userId: string): number | null {
  try {
    const v = localStorage.getItem(cacheKeyFor(userId));
    return v ? parseInt(v, 10) || null : null;
  } catch {
    return null;
  }
}

function writeCache(userId: string, expiry: number | null): void {
  try {
    if (expiry === null) {
      localStorage.removeItem(cacheKeyFor(userId));
    } else {
      localStorage.setItem(cacheKeyFor(userId), String(expiry));
    }
  } catch { /* ignore */ }
}

function formatTimeLeft(expiry: number | null, isAdmin: boolean): string {
  if (isAdmin) return '';
  if (!expiry) return '';
  const diff = expiry - Date.now();
  if (diff <= 0) return '';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (days > 0) return `${days}j ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [trialsUsed, setTrialsUsed] = useState(0);
  const [trialsLimit, setTrialsLimit] = useState(DEFAULT_TRIALS_LIMIT);
  const [expiry, setExpiry] = useState<number | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [, setTick] = useState(0);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const userId = user?.id ?? null;

  // One-time cleanup of the legacy shared key that leaked subscriptions
  // between users of the same device.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_LS_EXPIRY);
    } catch { /* ignore */ }
  }, []);

  // Load THIS user's subscription from Supabase when they sign in / switch
  // accounts. The database decides; the per-user localStorage entry is only a
  // cache for offline display between loads.
  useEffect(() => {
    setExpiry(null);
    setTrialsUsed(0);
    setTrialsLimit(DEFAULT_TRIALS_LIMIT);
    if (!userId) {
      setProfileLoaded(true);
      return;
    }
    // Show the user's own cache immediately, then confirm against the server.
    setExpiry(readCache(userId));
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('expires_at')
        .eq('user_id', userId)
        .eq('payment_status', 'success')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('Failed to load subscription', error);
      } else if (data?.expires_at) {
        const serverExpiry = new Date(data.expires_at).getTime();
        setExpiry(serverExpiry);
        writeCache(userId, serverExpiry);
      } else {
        // No active subscription server-side: drop any stale cache.
        setExpiry(null);
        writeCache(userId, null);
      }
      setProfileLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Load trial counters from the user's profile in Supabase
  useEffect(() => {
    setProfileLoaded(false);
    setTrialsUsed(0);
    setTrialsLimit(DEFAULT_TRIALS_LIMIT);
    if (!user) {
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('trials_used, trials_limit')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('Failed to load trial counters', error);
      } else if (data) {
        setTrialsUsed(data.trials_used ?? 0);
        setTrialsLimit(data.trials_limit ?? DEFAULT_TRIALS_LIMIT);
      }
      setProfileLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Check expiry every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setExpiry((current) => (current !== null && Date.now() > current ? null : current));
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActive = isAdmin || (expiry !== null && Date.now() < expiry);

  // Atomic, server-side trial consumption. The database decides — the browser
  // never computes or stores the counter, so sign-out/sign-in cannot reset it.
  const consumeTrial = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const { data, error } = await supabase.rpc('consume_trial', { p_user_id: user.id });
    if (error || !data || data.length === 0) {
      console.error('consume_trial failed', error);
      return false; // fail closed: block rather than grant a free trial
    }
    const row = data[0] as { allowed: boolean; trials_used: number; trials_limit: number };
    setTrialsUsed(row.trials_used);
    setTrialsLimit(row.trials_limit);
    return row.allowed;
  }, [user]);

  const activatePlan = useCallback((plan: PlanKey, serverExpiresAt?: number) => {
    // The expiry confirmed by the server (after payment verification) wins;
    // the local computation is only a fallback.
    const planDef = PLANS.find((p) => p.key === plan);
    if (!planDef) return;
    const newExpiry = serverExpiresAt ?? (Date.now() + planDef.durationDays * 24 * 60 * 60 * 1000);
    if (userId) writeCache(userId, newExpiry);
    setExpiry(newExpiry);
  }, [userId]);

  const resetTrials = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ trials_used: 0 })
      .eq('id', user.id);
    if (error) console.error(error);
    setTrialsUsed(0);
  }, [user]);

  const status: SubscriptionStatus = {
    isActive,
    isAdmin,
    freeTrialsUsed: trialsUsed,
    freeTrialsLeft: Math.max(0, trialsLimit - trialsUsed),
    expiry,
    timeLeftText: formatTimeLeft(expiry, isAdmin),
  };

  return (
    <SubscriptionContext.Provider value={{ status, consumeTrial, activatePlan, resetTrials }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
