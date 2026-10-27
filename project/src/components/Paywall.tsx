import { useState, useCallback, useEffect, useRef } from 'react';
import {
  CheckCircle2, Loader2, Clock, Crown, X, Lock,
  ArrowRight, Smartphone,
} from 'lucide-react';
import { useSubscription, PLANS, type PlanKey } from '@/lib/subscription';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import {
  openKkiapayWidget, onKkiapaySuccess, onKkiapayFailed, onKkiapayError,
} from '@/lib/kkiapay';
import { supabase } from '@/lib/supabase';

type PaywallProps = {
  onContinue: () => void;
};

export default function Paywall({ onContinue }: PaywallProps) {
  const { t, lang } = useI18n();
  const { activatePlan } = useSubscription();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const pendingPlanRef = useRef<PlanKey | null>(null);

  const planLabels: Record<PlanKey, string> = {
    daily: t('plan24h'),
    three_days: t('plan3days'),
    weekly: t('plan7days'),
    biweekly: t('plan14days'),
    monthly: t('plan30days'),
  };

  const activateFromServer = useCallback(async (plan: PlanKey, transactionId: string) => {
    setVerifying(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('no_session');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-kkiapay`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId, plan, amount: PLANS.find((p) => p.key === plan)?.amountXOF ?? 0 }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `verify_failed_${res.status}`);
      }

      activatePlan(plan, new Date(json.expiresAt).getTime());
      setSuccess(true);
      setTimeout(() => { onContinue(); }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        lang === 'fr'
          ? 'La vérification du paiement a échoué. Si vous avez été débité, contactez le support avec votre référence de transaction.'
          : 'Payment verification failed. If you were charged, contact support with your transaction reference.',
      );
    } finally {
      setVerifying(false);
      setProcessing(false);
      pendingPlanRef.current = null;
    }
  }, [activatePlan, onContinue, lang]);

  useEffect(() => {
    onKkiapaySuccess((response) => {
      const plan = pendingPlanRef.current;
      if (!plan) return;
      pendingPlanRef.current = null;
      const transactionId = typeof response?.transactionId === 'string' ? response.transactionId : '';
      if (transactionId) {
        activateFromServer(plan, transactionId);
      } else {
        setProcessing(false);
        setError(
          lang === 'fr'
            ? 'Paiement reçu mais référence introuvable. Contactez le support.'
            : 'Payment received but reference missing. Contact support.',
        );
      }
    });
    onKkiapayFailed(() => {
      setProcessing(false);
      pendingPlanRef.current = null;
      setError(
        lang === 'fr'
          ? 'Le paiement a échoué ou a été annulé. Vous pouvez réessayer.'
          : 'The payment failed or was cancelled. You can try again.',
      );
    });
    onKkiapayError(() => {
      setProcessing(false);
      pendingPlanRef.current = null;
      setError(
        lang === 'fr'
          ? 'Une erreur est survenue pendant le paiement. Vous pouvez réessayer.'
          : 'An error occurred during payment. You can try again.',
      );
    });
    // Listeners are registered once; plan/identity flow through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = useCallback((plan: PlanKey) => {
    setError('');
    const planDef = PLANS.find((p) => p.key === plan);
    if (!planDef) return;
    pendingPlanRef.current = plan;
    setProcessing(true);
    try {
      const meta = (user?.user_metadata ?? {}) as { last_name?: string; first_name?: string; email?: string; phone?: string };
      openKkiapayWidget({
        amount: planDef.amountXOF,
        name: [meta.first_name, meta.last_name].filter(Boolean).join(' ') || undefined,
        email: user?.email ?? meta.email,
        phone: meta.phone,
        partnerId: user?.id,
      });
    } catch (err) {
      console.error(err);
      setProcessing(false);
      pendingPlanRef.current = null;
      setError(
        lang === 'fr'
          ? 'Impossible d\'ouvrir la page de paiement. Vérifiez votre connexion internet.'
          : 'Could not open the payment page. Check your internet connection.',
      );
    }
  }, [user, lang]);

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
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>
              {lang === 'fr'
                ? 'Payez par Mobile Money (MTN, Moov, Wave) ou carte bancaire — via Kkiapay'
                : 'Pay with Mobile Money (MTN, Moov, Wave) or credit card — via Kkiapay'}
            </span>
          </div>
          {PLANS.map((plan) => {
            const isPopular = plan.key === 'weekly';
            return (
              <button
                key={plan.key}
                onClick={() => handlePay(plan.key)}
                disabled={processing || verifying}
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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
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

        {/* Verification overlay */}
        {verifying && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-slate-600">
                {lang === 'fr' ? 'Vérification du paiement...' : 'Verifying your payment...'}
              </p>
            </div>
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
