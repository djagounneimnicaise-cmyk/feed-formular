import { useEffect, useState, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

type ConnectionGateProps = {
  children: React.ReactNode;
};

export default function ConnectionGate({ children }: ConnectionGateProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [online, setOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const recheck = useCallback(async () => {
    setChecking(true);
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`,
        { method: 'HEAD', mode: 'no-cors' },
      );
      setOnline(true);
    } catch {
      setOnline(navigator.onLine);
    }
    setChecking(false);
  }, []);

  // Authenticated users can use the app offline (formulation + saved formulas work locally)
  if (online || user) return <>{children}</>;

  // Not authenticated and offline — need internet to log in
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-sm w-full text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-200 mb-4 mx-auto">
          <WifiOff className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">{t('internetRequired')}</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t('internetRequiredDesc')}
        </p>
        <button
          onClick={recheck}
          disabled={checking}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          {checking ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t('checking')}
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              {t('retry')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
