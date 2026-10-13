import { useState, useCallback } from 'react';
import {
  CheckCircle2, Loader2, Clock, Crown, X, Lock,
  ArrowRight,
} from 'lucide-react';
import { useSubscription, PLANS, type PlanKey } from '@/lib/subscription';
import { useI18n } from '@/lib/i18n';

type PaywallProps = {
  onContinue: () => void;
};

export default function Paywall({ onContinue }: PaywallProps) {
  const { t, lang } = useI18n();
  const { status, activatePlan } = useSubscription();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const planLabels: Record<PlanKey, string> = {
    daily: t('plan24h'),
    three_days: t('plan3days'),
    weekly: t('plan7days'),
    biweekly: t('plan14days'),
    monthly: t('plan30days'),
  };

  const handlePay = useCallback(async (plan: PlanKey) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    activatePlan(plan);
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => {
      onContinue();
    }, 1500);
  }, [activatePlan, onContinue]);

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-sm w-full text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">{t('paymentSuccess')}</h2>
          <p className="text-sm text-slate-600 mb-4">{t('paymentSuccessDesc')}</p>
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">{t('redirectingToFormulation')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white text-center">
          <button
            onClick={onContinue}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 mx-auto mb-3">
            <Crown className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold">{t('freeLimitReached')}</h1>
          <p className="text-xs text-white/90 mt-1.5 max-w-xs mx-auto">{t('freeLimitDesc')}</p>
        </div>

        {/* Plans */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {PLANS.map((plan) => {
            const isPopular = plan.key === 'weekly';
            return (
              <button
                key={plan.key}
                onClick={() => handlePay(plan.key)}
                disabled={processing || status.isAdmin}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{planLabels[plan.key]}</span>
                      {isPopular && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-medium">
                          {t('popular')}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {plan.durationDays} {'jours'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-800">
                    {plan.amountXOF.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-[10px] text-slate-500">FCFA</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Processing overlay */}
        {processing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-slate-600">{t('processingPayment')}</p>
            </div>
          </div>
        )}

        {/* Admin banner */}
        {status.isAdmin && (
          <div className="px-5 pb-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">{t('adminAccess')}</p>
            </div>
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors mt-2"
            >
              {t('continueToFormulation')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Lock className="w-3 h-3" />
            {t('paymentSecure')}
          </div>
        </div>
      </div>
    </div>
  );
}
