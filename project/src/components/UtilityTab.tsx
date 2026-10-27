import { FlaskConical, Calculator, TrendingUp, Scale, ShieldCheck, Leaf } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/lib/i18n';

export default function UtilityTab() {
  const { t } = useI18n();

  const UTILITY_POINTS: { icon: typeof Calculator; titleKey: TranslationKey; textKey: TranslationKey }[] = [
    { icon: Calculator, titleKey: 'feature1Title', textKey: 'feature1Text' },
    { icon: TrendingUp, titleKey: 'feature2Title', textKey: 'feature2Text' },
    { icon: Scale, titleKey: 'feature3Title', textKey: 'feature3Text' },
    { icon: ShieldCheck, titleKey: 'feature4Title', textKey: 'feature4Text' },
    { icon: Leaf, titleKey: 'feature5Title', textKey: 'feature5Text' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Intro */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-800">{t('whyUseful')}</h2>
        </div>
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            {t('usefulIntro1')}
          </p>
          <p>
            {t('usefulIntro2')} <strong className="text-slate-800">{t('appName')}</strong>:
          </p>
          <ul className="space-y-2 pl-5 list-disc">
            <li>{t('usefulList1')}</li>
            <li>{t('usefulList2')}</li>
            <li>{t('usefulList3')}</li>
            <li>{t('usefulList4')}</li>
            <li>{t('usefulList5')}</li>
          </ul>
          <p>
            {t('usefulOutro')}
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="space-y-3">
        {UTILITY_POINTS.map((point) => (
          <div
            key={point.titleKey}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
              <point.icon className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 mb-1">{t(point.titleKey)}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t(point.textKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
