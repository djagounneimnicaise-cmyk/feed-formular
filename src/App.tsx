import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Wheat, Scale, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Calculator, RotateCcw,
  FlaskConical, DollarSign, Package, Download, Save, FolderOpen,
  Trash2, FileText, Loader2, Share2, Lock,
  Info, Settings as SettingsIcon, Calculator as CalcIcon,
  Clock, Crown,
} from 'lucide-react';
import { INGREDIENTS } from '@/lib/ingredients';
import { NUTRIENTS } from '@/lib/nutrients';
import { FEED_TYPES } from '@/lib/feedTypes';
import {
  calculateNutrients, calculateTotalPercent, calculatePricePerKg,
  getColor, getNormsForType, formatNumber,
} from '@/lib/calc';
import type { Percentages, Prices, FeedTypeKey, ColorResult } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { useCurrency } from '@/lib/currency';
import LandingPage from '@/components/LandingPage';
import AuthScreen from '@/components/AuthScreen';
import ConnectionGate from '@/components/ConnectionGate';
import UtilityTab from '@/components/UtilityTab';
import SettingsTab from '@/components/SettingsTab';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import AboutTab from '@/components/AboutTab';
import Paywall from '@/components/Paywall';
import UpdatePrompt from '@/components/UpdatePrompt';
import { useSubscription, ensureTrialStarted } from '@/lib/subscription';

const STORAGE_KEY_PCT = 'feed_formular_percentages';
const STORAGE_KEY_PRICE = 'feed_formular_prices';
const STORAGE_KEY_TYPE = 'feed_formular_feed_type';
const STORAGE_KEY_FORMULAS = 'feed_formular_saved_formulas';

const COLOR_STYLES: Record<ColorResult, string> = {
  green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  orange: 'bg-amber-100 text-amber-700 border-amber-300',
  red: 'bg-red-100 text-red-700 border-red-300',
};

const COLOR_DOT: Record<ColorResult, string> = {
  green: 'bg-emerald-500',
  orange: 'bg-amber-500',
  red: 'bg-red-500',
};

type SavedFormula = {
  id: string;
  name: string;
  feedType: FeedTypeKey;
  percentages: Percentages;
  prices: Prices;
  date: string;
};

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return fallback;
}

function loadFormulas(): SavedFormula[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FORMULAS);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

type MainTab = 'formulation' | 'utilite' | 'parametres' | 'apropos';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('recovery') === 'true') {
        setRecoveryMode(true);
        url.searchParams.delete('recovery');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (recoveryMode && user) {
    return (
      <ConnectionGate>
        <AuthScreen
          onBack={() => setRecoveryMode(false)}
          recoveryMode
          onRecoveryDone={() => setRecoveryMode(false)}
        />
      </ConnectionGate>
    );
  }

  if (!user) {
    if (showAuth) {
      return (
        <ConnectionGate>
          <AuthScreen onBack={() => setShowAuth(false)} />
        </ConnectionGate>
      );
    }
    return <LandingPage onStart={() => setShowAuth(true)} />;
  }

  return (
    <ConnectionGate>
      <FeedFormulator userEmail={user.email} signOut={signOut} />
    </ConnectionGate>
  );
}

function FeedFormulator({ userEmail, signOut }: { userEmail: string | undefined; signOut: () => Promise<void> }) {
  const { t } = useI18n();
  const { status: subStatus } = useSubscription();
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('formulation');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { user } = useAuth();

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
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt]);

  useEffect(() => {
    if (user) {
      ensureTrialStarted(user.id);
    }
  }, [user]);

  const TABS: { key: MainTab; label: TranslationKey; icon: typeof Package }[] = [
    { key: 'formulation', label: 'formulation', icon: Package },
    { key: 'utilite', label: 'utility', icon: CalcIcon },
    { key: 'parametres', label: 'settings', icon: SettingsIcon },
    { key: 'apropos', label: 'about', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-white shadow-md border-b border-slate-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shrink-0">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">{t('appName')}</h1>
              <p className="text-[10px] text-slate-500">PRAVET PLUS — {t('addressValue')}</p>
            </div>
          </div>
          {subStatus.isActive && !subStatus.isAdmin && subStatus.timeLeftText && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[10px] font-semibold text-emerald-700 whitespace-nowrap">
                {subStatus.timeLeftText}
              </span>
            </div>
          )}
          {subStatus.isAdmin && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
              <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[10px] font-semibold text-amber-700">
                {t('adminAccess')}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Tab content */}
      <main className="pb-20">
        <UpdatePrompt />
        {showPrivacy ? (
          <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
        ) : (
          <>
            {activeMainTab === 'formulation' && <FormulationContent canCalculate={subStatus.isActive} freeTrialsLeft={subStatus.freeTrialsLeft} onNeedSubscription={() => setShowPaywall(true)} onTrialUsed={() => {}} />}
            {activeMainTab === 'utilite' && <UtilityTab />}
            {activeMainTab === 'parametres' && (
              <SettingsTab
                onLogout={signOut}
                userEmail={userEmail}
                installPrompt={installPrompt}
                onInstall={handleInstall}
                isInstalled={isInstalled}
                onOpenPrivacy={() => setShowPrivacy(true)}
                isAdmin={subStatus.isAdmin}
              />
            )}
            {activeMainTab === 'apropos' && <AboutTab />}
          </>
        )}
      </main>

      {/* Paywall modal */}
      {showPaywall && (
        <Paywall onContinue={() => setShowPaywall(false)} />
      )}

      {/* Bottom tab bar — mobile first */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg print:hidden ${showPrivacy ? 'hidden' : ''}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-around">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveMainTab(tab.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 flex-1 transition-colors ${
                activeMainTab === tab.key
                  ? 'text-emerald-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t(tab.label)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function FormulationContent({ canCalculate, freeTrialsLeft, onNeedSubscription, onTrialUsed }: { canCalculate: boolean; freeTrialsLeft: number; onNeedSubscription: () => void; onTrialUsed: () => void }) {
  const { t, lang } = useI18n();
  const { incrementTrial } = useSubscription();
  const { formatPrice, convertFromXOF, convertToXOF, symbol, currency } = useCurrency();
  const [percentages, setPercentages] = useState<Percentages>(() =>
    loadState(STORAGE_KEY_PCT, {}),
  );
  const [prices, setPrices] = useState<Prices>(() =>
    loadState(STORAGE_KEY_PRICE, {}),
  );
  const [feedType, setFeedType] = useState<FeedTypeKey | ''>(() =>
    (localStorage.getItem(STORAGE_KEY_TYPE) as FeedTypeKey) || '',
  );
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'formulation' | 'analysis'>('formulation');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<{
    totalPct: number;
    pricePerKg: number;
    pricePer50kg: number;
  } | null>(null);
  const [savedFormulas, setSavedFormulas] = useState<SavedFormula[]>(() => loadFormulas());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [formulaName, setFormulaName] = useState('');
  const [feedTypeOpen, setFeedTypeOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const feedTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (feedTypeRef.current && !feedTypeRef.current.contains(e.target as Node)) {
        setFeedTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PCT, JSON.stringify(percentages));
  }, [percentages]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRICE, JSON.stringify(prices));
  }, [prices]);
  useEffect(() => {
    if (feedType) {
      localStorage.setItem(STORAGE_KEY_TYPE, feedType);
    } else {
      localStorage.removeItem(STORAGE_KEY_TYPE);
    }
  }, [feedType]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FORMULAS, JSON.stringify(savedFormulas));
  }, [savedFormulas]);

  const totalPct = useMemo(() => calculateTotalPercent(percentages), [percentages]);
  const pricePerKg = useMemo(() => calculatePricePerKg(percentages, prices), [percentages, prices]);
  const pricePer50kg = pricePerKg * 50;
  const calculated = useMemo(() => calculateNutrients(percentages), [percentages]);
  const norms = useMemo(() => feedType ? getNormsForType(feedType) : {}, [feedType]);

  const totalColor: ColorResult = totalPct === 100 ? 'green' : Math.abs(totalPct - 100) <= 2 ? 'orange' : 'red';

  const updatePct = useCallback((key: string, value: number) => {
    setPercentages((prev: Percentages) => ({ ...prev, [key]: value }));
    setHasCalculated(false);
  }, []);

  const updatePrice = useCallback((key: string, value: number) => {
    setPrices((prev: Prices) => ({ ...prev, [key]: convertToXOF(value) }));
    setHasCalculated(false);
  }, [convertToXOF]);

  const resetAll = useCallback(() => {
    setPercentages({});
    setPrices({});
    setFeedType('');
    setHasCalculated(false);
    setCalculationResult(null);
  }, []);

  const canExecuteCalculate = feedType !== '' && totalPct === 100;

  const handleCalculate = useCallback(() => {
    if (!feedType || totalPct !== 100) return;

    setIsCalculating(true);
    setTimeout(() => {
      setCalculationResult({
        totalPct,
        pricePerKg,
        pricePer50kg,
      });
      setHasCalculated(true);
      setIsCalculating(false);
      setActiveTab('analysis');
      if (!canCalculate) {
        incrementTrial();
        onTrialUsed();
      }
    }, 5000);
  }, [feedType, totalPct, pricePerKg, pricePer50kg, canCalculate, incrementTrial, onTrialUsed]);

  const handleSaveFormula = useCallback(() => {
    const name = formulaName.trim();
    if (!name) return;
    const formula: SavedFormula = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      feedType: feedType || 'demarrage_ponte',
      percentages,
      prices,
      date: new Date().toLocaleDateString('fr-FR'),
    };
    setSavedFormulas((prev) => [...prev, formula]);
    setFormulaName('');
    setShowSaveDialog(false);
  }, [formulaName, feedType, percentages, prices]);

  const handleLoadFormula = useCallback((formula: SavedFormula) => {
    setPercentages(formula.percentages);
    setPrices(formula.prices);
    setFeedType(formula.feedType);
    setHasCalculated(false);
    setShowLoadDialog(false);
  }, []);

  const handleDeleteFormula = useCallback((id: string) => {
    setSavedFormulas((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const nutrientResults = useMemo(() => {
    return NUTRIENTS.map((nut) => {
      const value = calculated[nut.key];
      const range = norms[nut.key];
      const color = getColor(value, range);
      return { nut, value, range, color };
    });
  }, [calculated, norms]);

  const greenCount = nutrientResults.filter((r) => r.range && r.color === 'green').length;
  const orangeCount = nutrientResults.filter((r) => r.range && r.color === 'orange').length;
  const redCount = nutrientResults.filter((r) => r.range && r.color === 'red').length;
  const totalNorms = nutrientResults.filter((r) => r.range).length;

  const currentFeedType = FEED_TYPES.find((f) => f.key === feedType);
  const currentFeedLabel = currentFeedType?.[lang === 'fr' ? 'label' : 'labelEn'] || '';

  const handleShareFormula = useCallback(() => {
    const activeIngredients = INGREDIENTS.filter((ing) => (percentages[ing.key] || 0) > 0);
    const ingredientList = activeIngredients
      .map((ing) => `  • ${ing.label}: ${(percentages[ing.key] || 0).toFixed(1)}%`)
      .join('\n');
    const shareText = lang === 'fr'
      ? `Ma formule d'aliment volaille (${currentFeedLabel}):\n${ingredientList}\n\nTotal: ${totalPct.toFixed(1)}%\nPrix/kg: ${formatPrice(pricePerKg)}\nPrix sac 50kg: ${formatPrice(pricePer50kg)}\n\n— Partagé via Feed Formular (PRAVET PLUS)`
      : `My poultry feed formula (${currentFeedLabel}):\n${ingredientList}\n\nTotal: ${totalPct.toFixed(1)}%\nPrice/kg: ${formatPrice(pricePerKg)}\n50kg bag: ${formatPrice(pricePer50kg)}\n\n— Shared via Feed Formular (PRAVET PLUS)`;

    if (navigator.share) {
      navigator.share({ title: 'Feed Formular', text: shareText, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
    }
  }, [percentages, currentFeedLabel, totalPct, pricePerKg, pricePer50kg, formatPrice]);

  return (
    <div className="">
      {/* Print-only section */}
      <div ref={printRef} className="hidden print:block">
        <PrintReport
          feedTypeLabel={currentFeedLabel}
          percentages={percentages}
          prices={prices}
          totalPct={totalPct}
          pricePerKg={pricePerKg}
          pricePer50kg={pricePer50kg}
          nutrientResults={nutrientResults}
          greenCount={greenCount}
          orangeCount={orangeCount}
          redCount={redCount}
          totalNorms={totalNorms}
        />
      </div>

      {/* Screen-only content */}
      <div className="print:hidden">
        {/* Sticky summary bar */}
        <div className="sticky top-[49px] z-30 bg-white border-b border-slate-200 px-3 sm:px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border ${hasCalculated ? COLOR_STYLES[totalColor] : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                <Scale className="w-3.5 h-3.5" />
                <span className="text-xs sm:text-sm font-bold">
                  {hasCalculated ? `${totalPct.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300">
                <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  {hasCalculated ? formatPrice(pricePerKg) : `— ${symbol}`}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300">
                <Package className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-sm font-bold text-slate-700">
                  {hasCalculated ? formatPrice(pricePer50kg) : `— ${symbol}`}
                </span>
              </div>
            </div>

            {/* Mobile formulation/analysis tabs */}
            <div className="flex gap-1 sm:hidden">
              <button
                onClick={() => setActiveTab('formulation')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'formulation' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t('formulation')}
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'analysis' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t('analysis')}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
          {/* Feed type selector + action buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <label className="text-sm font-semibold text-slate-700">
                  {t('feedType')}
                </label>
              </div>
              <div ref={feedTypeRef} className="relative flex-1 sm:flex-none min-w-[200px]">
                <button
                  type="button"
                  onClick={() => setFeedTypeOpen(!feedTypeOpen)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                    feedTypeOpen ? 'ring-2 ring-emerald-500 border-transparent' : 'border-slate-300'
                  }`}
                >
                  <span className={feedType ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                    {feedType ? (currentFeedType?.label) : t('selectFeedType')}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${feedTypeOpen ? 'rotate-180' : ''}`} />
                </button>
                {feedTypeOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg max-h-64 overflow-y-auto">
                    {FEED_TYPES.map((ft) => (
                      <button
                        key={ft.key}
                        type="button"
                        onClick={() => {
                          setFeedType(ft.key);
                          setFeedTypeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-emerald-50 ${
                          ft.key === feedType ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {ft.label}
                      </button>
                    ))}
                  </div>
                )}
                {!feedType && (
                  <p className="mt-1 text-xs font-medium text-red-600" role="alert">
                    Veuillez sélectionner type d'aliment
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('save')}</span>
              </button>
              <button
                onClick={() => setShowLoadDialog(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('formulas')}</span>
                {savedFormulas.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-emerald-600 text-white rounded-full">
                    {savedFormulas.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('exportPdf')}</span>
              </button>
              <button
                onClick={handleShareFormula}
                disabled={totalPct === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('shareFormula')}</span>
              </button>
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('reset')}</span>
              </button>
            </div>

          </div>

          {/* Formulation Table */}
          <div className={`${activeTab === 'formulation' ? 'block' : 'hidden'} sm:block`}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold sticky left-0 bg-slate-800 z-10 min-w-[180px]">
                        {t('ingredient')}
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap min-w-[90px]">
                        {t('inclusionPercent')}
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap min-w-[110px]">
                        {t('pricePerKg')} ({symbol})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {INGREDIENTS.map((ing, idx) => {
                      const pct = percentages[ing.key] || 0;
                      const price = convertFromXOF(prices[ing.key] || 0);
                      return (
                        <tr
                          key={ing.key}
                          className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                            ing.isConcentrate ? 'bg-emerald-50/40' : ''
                          } ${idx < 4 ? 'border-t-2 border-t-emerald-200' : ''}`}
                        >
                          <td className="px-3 py-2 sticky left-0 bg-inherit z-10">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono w-5 text-right">
                                {idx + 1}
                              </span>
                              <span className={`text-xs sm:text-sm ${ing.isConcentrate ? 'font-semibold text-emerald-700' : 'text-slate-700'}`}>
                                {ing.label}
                              </span>
                              {ing.isConcentrate && (
                                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-200 text-emerald-800 font-medium">
                                  C
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              max="100"
                              step="0.5"
                              value={pct || ''}
                              onChange={(e) => updatePct(ing.key, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              disabled={!feedType}
                              className={`w-16 sm:w-20 px-2 py-1.5 text-center text-sm rounded-md border focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow ${
                                feedType ? 'border-slate-300' : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step={currency === 'XOF' ? '10' : '0.01'}
                              value={price ? (currency === 'XOF' ? Math.round(price) : Number(price.toFixed(2))) : ''}
                              onChange={(e) => updatePrice(ing.key, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-20 sm:w-24 px-2 py-1.5 text-center text-sm rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td className="px-3 py-2.5 sticky left-0 bg-slate-100 z-10 text-xs sm:text-sm text-slate-700">
                        {t('total')}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          totalPct === 100 ? 'bg-emerald-100 text-emerald-700' :
                          totalPct > 100 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {totalPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center text-sm text-slate-700">
                        {hasCalculated ? `${formatPrice(pricePerKg)}/kg` : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            {/* Price per 50kg bag on mobile — only after Calculate */}
            {hasCalculated && (
            <div className="sm:hidden mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white text-center">
              <p className="text-xs uppercase tracking-wide opacity-90">{t('bag50kg')}</p>
              <p className="text-2xl font-bold">{formatPrice(pricePer50kg)}</p>
            </div>
            )}
          </div>

          {/* Total validation + Calculate button */}
          {feedType && (
          <div className="text-center my-2 min-h-6" role="status" aria-live="polite">
            {totalPct === 100 ? (
              <p className="text-sm font-semibold text-emerald-600">Total : 100%</p>
            ) : totalPct < 100 ? (
              <p className="text-sm font-medium text-red-600">
                Le total d'inclusion est inférieur à 100% (actuellement : {totalPct.toFixed(1)}%). Veuillez compléter à 100%
              </p>
            ) : (
              <p className="text-sm font-medium text-red-600">
                Le total d'inclusion dépasse 100% (actuellement : {totalPct.toFixed(1)}%). Veuillez ramener à 100%
              </p>
            )}
          </div>
          )}
          <div className="flex justify-center my-4">
            {canCalculate || freeTrialsLeft > 0 ? (
            <button
              onClick={handleCalculate}
              disabled={isCalculating || !canExecuteCalculate}
              className="flex items-center gap-2 px-8 py-3 text-base font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('analyzingFormula')}
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  {t('calculate')}
                </>
              )}
            </button>
            ) : (
            <button
              onClick={onNeedSubscription}
              className="flex items-center gap-2 px-8 py-3 text-base font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
            >
              <Lock className="w-5 h-5" />
              {t('subscribeToCalculate')}
            </button>
            )}
          </div>

          {/* Free trials counter */}
          {!canCalculate && freeTrialsLeft > 0 && (
            <p className="text-center text-xs text-slate-500 mb-2">
              {t('freeTrialsLeft', { n: freeTrialsLeft })}
            </p>
          )}
          {!canCalculate && freeTrialsLeft === 0 && (
            <p className="text-center text-xs text-red-500 mb-2">
              {t('noTrialsLeft')}
            </p>
          )}

          {/* Calculating overlay */}
          {isCalculating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 animate-pulse">{t('analyzingFormula')}</p>
            </div>
          )}

          {/* Analysis Section — only after Calculate */}
          {hasCalculated && !isCalculating ? (
          <div className={`${activeTab === 'analysis' ? 'block' : 'hidden'} sm:block mt-4`}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => setAnalysisOpen(!analysisOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 text-white"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {t('nutritionalAnalysis')} — {currentFeedLabel}
                  </span>
                </div>
                {analysisOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {analysisOpen && (
                <div className="p-3 sm:p-4">
                  {/* Summary badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">
                        {t('conform')}: {greenCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">
                        {t('tolerance')}: {orangeCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-medium text-red-700">
                        {t('outOfRange')}: {redCount}
                      </span>
                    </div>
                  </div>

                  {/* Nutrient grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {nutrientResults.map(({ nut, value, range, color }) => (
                      <div
                        key={nut.key}
                        className={`rounded-lg border px-3 py-2 ${COLOR_STYLES[color]}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${COLOR_DOT[color]}`} />
                            <span className="text-xs font-medium truncate">
                              {nut.label}
                            </span>
                          </div>
                          <span className="text-xs font-bold whitespace-nowrap">
                            {formatNumber(value, nut.decimals)}
                          </span>
                        </div>
                        {range && (
                          <div className="text-[10px] mt-1 opacity-75">
                            {t('norm')}: {formatNumber(range.min, nut.decimals)} — {formatNumber(range.max, nut.decimals)} {nut.unit}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      {t('inRange')}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      {t('tolerancePercent')}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      {t('outOfNorm')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : (
          <div className="mt-4 p-6 rounded-xl bg-white border border-dashed border-slate-300 text-center">
            <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {t('analysisPlaceholder')}
            </p>
          </div>
          )}

          {/* Footer */}
          <div className="mt-6 mb-4 text-center text-[10px] text-slate-400">
            <p>{t('footer')}</p>
          </div>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5">
              <div className="flex items-center gap-2 mb-3">
                <Save className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-semibold text-slate-800">{t('saveFormula')}</h2>
              </div>
              <input
                type="text"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                placeholder={t('formulaName')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-3"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveFormula(); }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveFormula}
                  disabled={!formulaName.trim()}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('save')}
                </button>
                <button
                  onClick={() => { setShowSaveDialog(false); setFormulaName(''); }}
                  className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load Dialog */}
        {showLoadDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-semibold text-slate-800">{t('savedFormulas')}</h2>
                </div>
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              {savedFormulas.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  {t('noSavedFormulas')}
                </p>
              ) : (
                <div className="space-y-2">
                  {savedFormulas.map((f) => {
                    const feedLabel = FEED_TYPES.find((ft) => ft.key === f.feedType)?.label || f.feedType;
                    const fTotal = calculateTotalPercent(f.percentages);
                    const fPrice = calculatePricePerKg(f.percentages, f.prices);
                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {feedLabel} · {fTotal.toFixed(1)}% · {formatPrice(fPrice)}/kg · {f.date}
                          </p>
                        </div>
                        <button
                          onClick={() => handleLoadFormula(f)}
                          className="px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors shrink-0"
                        >
                          {t('load')}
                        </button>
                        <button
                          onClick={() => handleDeleteFormula(f.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Print report component
type PrintReportProps = {
  feedTypeLabel: string;
  percentages: Percentages;
  prices: Prices;
  totalPct: number;
  pricePerKg: number;
  pricePer50kg: number;
  nutrientResults: { nut: typeof NUTRIENTS[number]; value: number; range: { min: number; max: number } | undefined; color: ColorResult }[];
  greenCount: number;
  orangeCount: number;
  redCount: number;
  totalNorms: number;
};

function PrintReport({
  feedTypeLabel, percentages, prices, totalPct, pricePerKg, pricePer50kg,
  nutrientResults, greenCount, orangeCount, redCount, totalNorms,
}: PrintReportProps) {
  const { t, lang } = useI18n();
  const { formatPrice, convertFromXOF } = useCurrency();
  const activeIngredients = INGREDIENTS.filter((ing) => (percentages[ing.key] || 0) > 0);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#1e293b', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #059669', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>Feed Formular</h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>{t('reportTitle')}</p>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date().toLocaleDateString()}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{t('feedType')}: {feedTypeLabel}</h2>
        <div style={{ display: 'flex', gap: '30px', fontSize: '13px' }}>
          <span>{t('total')}: <strong>{totalPct.toFixed(1)}%</strong></span>
          <span>{t('pricePerKg')}: <strong>{formatPrice(pricePerKg)}</strong></span>
          <span>{t('bag50kg')}: <strong>{formatPrice(pricePer50kg)}</strong></span>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#1e293b', color: 'white' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #334155' }}>{t('ingredient')}</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #334155' }}>{t('inclusionPercent')}</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #334155' }}>{t('pricePerKg')}</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #334155' }}>{t('partialCost')}</th>
          </tr>
        </thead>
        <tbody>
          {activeIngredients.map((ing) => {
            const pct = percentages[ing.key] || 0;
            const price = convertFromXOF(prices[ing.key] || 0);
            const partialCost = convertFromXOF((prices[ing.key] || 0) * pct / 100);
            return (
              <tr key={ing.key}>
                <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>{ing.label}</td>
                <td style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{pct.toFixed(1)}%</td>
                <td style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{formatPrice(price)}</td>
                <td style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{formatPrice(partialCost)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
            <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{t('total')}</td>
            <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{totalPct.toFixed(1)}%</td>
            <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>—</td>
            <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{formatPrice(pricePerKg)}</td>
          </tr>
        </tfoot>
      </table>

      <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{t('nutritionalAnalysis')}</h2>
      <div style={{ fontSize: '12px', marginBottom: '10px' }}>
        <span style={{ color: '#059669' }}>{t('conform')}: {greenCount}</span>
        {' | '}
        <span style={{ color: '#d97706' }}>{t('tolerance')}: {orangeCount}</span>
        {' | '}
        <span style={{ color: '#dc2626' }}>{t('outOfRange')}: {redCount}</span>
        {' | '}
        <span>{t('totalNorms')}: {totalNorms}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ background: '#1e293b', color: 'white' }}>
            <th style={{ padding: '4px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t('ingredient')}</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', border: '1px solid #334155' }}>{t('nutrientValue')}</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', border: '1px solid #334155' }}>{t('normMin')}</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', border: '1px solid #334155' }}>{t('normMax')}</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', border: '1px solid #334155' }}>{t('status')}</th>
          </tr>
        </thead>
        <tbody>
          {nutrientResults.map(({ nut, value, range, color }) => (
            <tr key={nut.key}>
              <td style={{ padding: '3px 6px', border: '1px solid #e2e8f0' }}>{nut.label}</td>
              <td style={{ padding: '3px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{formatNumber(value, nut.decimals)}</td>
              <td style={{ padding: '3px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{range ? formatNumber(range.min, nut.decimals) : '—'}</td>
              <td style={{ padding: '3px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{range ? formatNumber(range.max, nut.decimals) : '—'}</td>
              <td style={{
                padding: '3px 6px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                color: color === 'green' ? '#059669' : color === 'orange' ? '#d97706' : '#dc2626',
                fontWeight: 'bold',
              }}>
                {color === 'green' ? 'OK' : color === 'orange' ? 'Tol.' : 'Hors'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
