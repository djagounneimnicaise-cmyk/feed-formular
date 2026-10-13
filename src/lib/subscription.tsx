import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const ADMIN_EMAIL = 'djagounneimnicaise@gmail.com';
const FREE_TRIAL_LIMIT = 3;
const LS_TRIALS = 'feed_formular_free_trials';
const LS_EXPIRY = 'feed_formular_subscription_expiry';

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
  incrementTrial: () => void;
  activatePlan: (plan: PlanKey) => void;
  resetTrials: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

function getTrialsUsed(): number {
  try {
    return parseInt(localStorage.getItem(LS_TRIALS) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function getExpiry(): number | null {
  try {
    const v = localStorage.getItem(LS_EXPIRY);
    return v ? parseInt(v, 10) || null : null;
  } catch {
    return null;
  }
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
  const [trialsUsed, setTrialsUsed] = useState(getTrialsUsed());
  const [expiry, setExpiry] = useState<number | null>(getExpiry());
  const [, setTick] = useState(0);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Check expiry on mount and every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const currentExpiry = getExpiry();
      if (currentExpiry && Date.now() > currentExpiry) {
        try {
          localStorage.removeItem(LS_EXPIRY);
        } catch { /* ignore */ }
        setExpiry(null);
        setTrialsUsed(0);
        try {
          localStorage.setItem(LS_TRIALS, '0');
        } catch { /* ignore */ }
      }
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActive = isAdmin || (expiry !== null && Date.now() < expiry);

  const incrementTrial = useCallback(() => {
    setTrialsUsed((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(LS_TRIALS, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const activatePlan = useCallback((plan: PlanKey) => {
    const planDef = PLANS.find((p) => p.key === plan);
    if (!planDef) return;
    const newExpiry = Date.now() + planDef.durationDays * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem(LS_EXPIRY, String(newExpiry));
    } catch { /* ignore */ }
    setExpiry(newExpiry);
  }, []);

  const resetTrials = useCallback(() => {
    setTrialsUsed(0);
    try {
      localStorage.setItem(LS_TRIALS, '0');
    } catch { /* ignore */ }
  }, []);

  const status: SubscriptionStatus = {
    isActive,
    isAdmin,
    freeTrialsUsed: trialsUsed,
    freeTrialsLeft: Math.max(0, FREE_TRIAL_LIMIT - trialsUsed),
    expiry,
    timeLeftText: formatTimeLeft(expiry, isAdmin),
  };

  return (
    <SubscriptionContext.Provider value={{ status, incrementTrial, activatePlan, resetTrials }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

export function ensureTrialStarted(_userId: string): Promise<void> {
  return Promise.resolve();
}
