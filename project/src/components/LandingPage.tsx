import { useState, useEffect, useCallback } from 'react';
import { Wheat, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import DemoModal, { DemoButton } from '@/components/DemoModal';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type LandingPageProps = {
  onStart: () => void;
};

export default function LandingPage({ onStart }: LandingPageProps) {
  const { t } = useI18n();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (result.outcome === 'dismissed') {
      setInstallDismissed(true);
    }
  }, [installPrompt]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800">{t('appName')}</h1>
              <p className="text-[10px] text-slate-500">{t('appTagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <DemoButton onClick={() => setDemoOpen(true)} className="hidden sm:flex" />
            {installPrompt && !isInstalled && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('installApp')}</span>
              </button>
            )}
            <button
              onClick={onStart}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {t('login')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-8 sm:pt-20 sm:pb-12">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-800 leading-tight mb-4">
            {t('formulateFeed')}
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t('withPrecision')}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('landingDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('start')}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Install app button */}
            {installPrompt && !isInstalled && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-emerald-700 bg-emerald-50 border-2 border-emerald-300 rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-pulse"
              >
                <Download className="w-5 h-5" />
                {t('installApp')}
              </button>
            )}

            {/* Already installed confirmation */}
            {isInstalled && (
              <div className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
                {t('installApp')}
              </div>
            )}
          </div>

          {/* Demo button — mobile + secondary desktop CTA */}
          <div className="flex justify-center mt-4">
            <DemoButton onClick={() => setDemoOpen(true)} className="sm:hidden" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-slate-400">
          {t('footer')}
        </p>
      </footer>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
    </div>
  );
}
