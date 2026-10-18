import { MapPin, FileText, Phone, Youtube, Wheat, Share2, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

export default function AboutTab() {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleShareApp = useCallback(() => {
    const shareText = lang === 'fr'
      ? 'Découvrez Feed Formular — l\'application de formulation d\'aliment pour volaille par PRAVET PLUS'
      : 'Check out Feed Formular — the poultry feed formulation app by PRAVET PLUS';
    if (navigator.share) {
      navigator.share({ title: 'Feed Formular', text: shareText, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Company logo / name */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto mb-4">
          <Wheat className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t('pravetPlus')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('appTagline')}</p>
      </div>

      {/* Company info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-4">{t('companyInfo')}</h3>
        <div className="space-y-4">
          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{t('address')}</p>
              <p className="text-sm text-slate-700">{t('addressValue')}</p>
            </div>
          </div>

          {/* IFU */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{t('ifu')}</p>
              <p className="text-sm text-slate-700 font-mono">02022318556240</p>
            </div>
          </div>

          {/* Phone */}
          <a
            href="tel:+2290161370979"
            className="flex items-start gap-3 rounded-lg hover:bg-slate-50 transition-colors -mx-1 px-1 py-1"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{t('phoneWhatsapp')}</p>
              <p className="text-sm text-slate-700">+229 01 61 37 09 79</p>
            </div>
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@nicaise_dgagoun"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-lg hover:bg-slate-50 transition-colors -mx-1 px-1 py-1"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 border border-red-100 shrink-0">
              <Youtube className="w-4 h-4 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{t('youtube')}</p>
              <p className="text-sm text-slate-700">PRAVET PLUS</p>
            </div>
          </a>
        </div>
      </div>

      {/* About the app */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">{t('aboutApp')}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t('aboutAppDesc')}
        </p>
        <p className="text-xs text-slate-400 mt-4 text-center">
          {t('copyright')}
        </p>
      </div>

      {/* Share the app */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-sm p-5 text-white">
        <h3 className="text-sm font-bold mb-1">{t('shareApp')}</h3>
        <p className="text-xs text-white/80 mb-4">{t('shareAppDesc')}</p>
        <div className="flex gap-2">
          <button
            onClick={handleShareApp}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {t('shareVia')}
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('linkCopied') : t('copyLink')}
          </button>
        </div>
      </div>
    </div>
  );
}
