import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SignUpMetadata = {
  nom: string;
  prenom: string;
  pays: string;
  ville: string;
  telephone: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, code: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signInAdmin: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata: { nom: string; prenom: string; pays: string; ville: string; telephone: string },
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nom: metadata.nom,
          prenom: metadata.prenom,
          pays: metadata.pays,
          ville: metadata.ville,
          telephone: metadata.telephone,
          email,
        },
      },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    const needsConfirmation = !data.session && !!data.user;
    return { error: null, needsConfirmation };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, action: 'send' }),
        },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to send code' }));
        return { error: data.error || 'Failed to send code' };
      }
      return { error: null };
    } catch {
      return { error: 'Failed to send code. Check your internet connection.' };
    }
  }, []);

  const verifyOtpCode = useCallback(async (email: string, code: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, action: 'verify', code }),
        },
      );
      const data = await response.json().catch(() => ({ error: 'Verification failed' }));
      if (!response.ok) {
        return { error: data.error || 'Invalid code' };
      }

      // If a token is returned (admin login), use it to verify the OTP session
      if (data.token) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token_hash: data.token,
        });
        if (otpError) {
          return { error: otpError.message };
        }
      }

      return { error: null };
    } catch {
      return { error: 'Verification failed. Check your internet connection.' };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?recovery=true`,
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signInAdmin = useCallback(async (email: string) => {
    return await sendOtp(email);
  }, [sendOtp]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut, sendOtp, verifyOtp: verifyOtpCode, resetPassword, updatePassword, signInAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
