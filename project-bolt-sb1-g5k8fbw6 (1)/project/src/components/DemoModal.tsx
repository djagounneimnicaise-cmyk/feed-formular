import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, PlayCircle, Wheat, ListOrdered, Coins, Calculator, BarChart3, Save, Video } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import DemoVideo from '@/components/DemoVideo';

const STEPS: { titleKey: TranslationKey; textKey: TranslationKey; icon: typeof Wheat; color: string }[] = [
  { titleKey: 'demoStep1Title', textKey: 'demoStep1Text', icon: ListOrdered, color: 'bg-emerald-500' },
  { titleKey: 'demoStep2Title', textKey: 'demoStep2Text', icon: Wheat, color: 'bg-teal-500' },
  { titleKey: 'demoStep3Title', textKey: 'demoStep3Text', icon: Coins, color: 'bg-amber-500' },
  { titleKey: 'demoStep4Title', textKey: 'demoStep4Text', icon: Calculator, color: 'bg-emerald-600' },
  { titleKey: 'demoStep5Title', textKey: 'demoStep5Text', icon: BarChart3, color: 'bg-teal-600' },
  { titleKey: 'demoStep6Title', textKey: 'demoStep6Text', icon: Save, color: 'bg-emerald-700' },
];

export default function DemoModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const total = STEPS.length;
  const current = STEPS[step];
  const Icon = current.icon;

  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t('demoTitle')}</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{t('demoIntro')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label={t('demoClose')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video button */}
        <div className="px-5 pb-3">
          <button
            onClick={() => setVideoOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Video className="w-4 h-4" />
            {t('demoVideo')}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 px-5 pb-3">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-emerald-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={t('demoStepOf', { current: i + 1, total })}
            />
          ))}
        </div>

        {/* Step card */}
        <div className="px-5 py-4">
          <div className="bg-gradient-to-b from-slate-50 to-emerald-50/50 rounded-xl border border-slate-200 p-5">
            <div className={`w-11 h-11 rounded-xl ${current.color} text-white flex items-center justify-center shadow-md mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1.5 leading-snug">{t(current.titleKey)}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t(current.textKey)}</p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('demoPrev')}
          </button>
          <span className="text-xs text-slate-400 font-medium">
            {t('demoStepOf', { current: step + 1, total })}
          </span>
          {step < total - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {t('demoNext')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <CheckIcon />
              {t('demoFinish')}
            </button>
          )}
        </div>
      </div>
      {videoOpen && <DemoVideo onClose={() => setVideoOpen(false)} />}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function DemoButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-colors ${className}`}
    >
      <PlayCircle className="w-4 h-4" />
      {t('demo')}
    </button>
  );
}
