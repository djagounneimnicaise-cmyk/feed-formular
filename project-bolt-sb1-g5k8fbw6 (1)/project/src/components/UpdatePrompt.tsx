import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

type AppConfig = {
  current_version: string;
  force_update: boolean;
  update_message_fr: string;
  update_message_en: string;
};

const APP_VERSION_KEY = 'feed_formular_app_version';

export default function UpdatePrompt() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data } = await supabase
        .from('app_config')
        .select('current_version, force_update, update_message_fr, update_message_en')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        setConfig(data as AppConfig);

        let lastSeenVersion: string | null = null;
        try {
          lastSeenVersion = localStorage.getItem(APP_VERSION_KEY);
        } catch { /* ignore */ }

        if (lastSeenVersion !== data.current_version) {
          setDismissed(false);
        }
      }
    })();
  }, [user]);

  if (!config || dismissed) return null;

  let shouldShow = false;
  try {
    const lastSeen = localStorage.getItem(APP_VERSION_KEY);
    if (config.force_update) {
      shouldShow = true;
    } else if (lastSeen && lastSeen !== config.current_version) {
      shouldShow = true;
    }
  } catch { /* ignore */ }

  if (!shouldShow) return null;

  const handleUpdate = () => {
    try {
      localStorage.setItem(APP_VERSION_KEY, config.current_version);
    } catch { /* ignore */ }
    window.location.reload();
  };

  const handleDismiss = () => {
    if (!config.force_update) {
      try {
        localStorage.setItem(APP_VERSION_KEY, config.current_version);
      } catch { /* ignore */ }
      setDismissed(true);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-[60] px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl border border-amber-200 p-4 flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{t('updateAvailable')}</p>
          <p className="text-xs text-slate-600 mt-0.5">
            {lang === 'fr' ? config.update_message_fr : config.update_message_en}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('updateNow')}
            </button>
            {!config.force_update && (
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {t('later')}
              </button>
            )}
          </div>
        </div>
        {!config.force_update && (
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
