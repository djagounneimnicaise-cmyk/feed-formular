import { Shield, Database, Eye, Lock, UserCheck, Phone, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

type PrivacyPolicyProps = {
  onBack: () => void;
};

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const { t } = useI18n();

  const sections = [
    { icon: Database, title: t('privacyDataCollection'), desc: t('privacyDataCollectionDesc') },
    { icon: Eye, title: t('privacyDataUsage'), desc: t('privacyDataUsageDesc') },
    { icon: Lock, title: t('privacyDataStorage'), desc: t('privacyDataStorageDesc') },
    { icon: UserCheck, title: t('privacyUserRights'), desc: t('privacyUserRightsDesc') },
    { icon: Phone, title: t('privacyContact'), desc: t('privacyContactDesc') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back')}
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{t('privacyTitle')}</h1>
            <p className="text-xs text-slate-500">PRAVET PLUS</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{t('privacyIntro')}</p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map(({ icon: Icon, title, desc }, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-800 mb-1.5">{title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-[10px] text-slate-400">{t('copyright')}</p>
      </div>
    </div>
  );
}
