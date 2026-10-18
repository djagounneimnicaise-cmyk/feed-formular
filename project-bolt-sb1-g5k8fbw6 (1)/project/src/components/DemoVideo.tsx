import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { FEED_TYPES } from '@/lib/feedTypes';
import { INGREDIENT_MAP } from '@/lib/ingredients';
import type { IngredientKey } from '@/lib/types';

type Scene = {
  captionKey: TranslationKey;
  duration: number; // seconds
  render: (progress: number) => JSX.Element;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Ingredients used in the sample formula, in display order
const DEMO_RECIPE: { key: IngredientKey; pct: number; price: number }[] = [
  { key: 'grain_mais', pct: 55, price: 275 },
  { key: 'tourteau_soja_44', pct: 22, price: 480 },
  { key: 'son_ble', pct: 12, price: 190 },
  { key: 'concentre_ponte_5_jauni', pct: 5, price: 950 },
  { key: 'coquilles', pct: 4, price: 100 },
  { key: 'farine_os', pct: 1.5, price: 350 },
  { key: 'sel', pct: 0.5, price: 150 },
];

export default function DemoVideo({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const scenes = useScenes(lang === 'fr');
  const totalDuration = scenes.reduce((s, sc) => s + sc.duration, 0);

  // Playback loop
  useEffect(() => {
    if (!playing || ended) return;
    const tick = (ts: number) => {
      if (lastTsRef.current != null) {
        const dt = (ts - lastTsRef.current) / 1000;
        setTime((prev) => {
          const nextT = prev + dt;
          if (nextT >= totalDuration) {
            setPlaying(false);
            setEnded(true);
            return totalDuration;
          }
          return nextT;
        });
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, ended, totalDuration]);

  const togglePlay = useCallback(() => {
    if (ended) {
      setTime(0);
      setEnded(false);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  }, [ended]);

  const replay = () => {
    setTime(0);
    setEnded(false);
    setPlaying(true);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    setTime(ratio * totalDuration);
    setEnded(false);
  };

  // Active scene
  let elapsed = 0;
  let activeIdx = 0;
  let sceneProgress = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (time < elapsed + scenes[i].duration || i === scenes.length - 1) {
      activeIdx = i;
      sceneProgress = clamp((time - elapsed) / scenes[i].duration, 0, 1);
      break;
    }
    elapsed += scenes[i].duration;
  }
  const active = scenes[activeIdx];

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = (time / totalDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Video area — a simulated phone screen */}
        <div className="relative aspect-[4/3] bg-white overflow-hidden select-none" onClick={togglePlay}>
          <div className="absolute inset-0">{active.render(sceneProgress)}</div>

          {/* Play/pause flash overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!playing && (
              <div className="w-14 h-14 rounded-full bg-slate-900/60 flex items-center justify-center">
                {ended ? <RotateCcw className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
              </div>
            )}
          </div>

          {/* Header chip */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {t('demoVideo')}
          </div>

          {/* Language switch inside video top-right */}
          <div className="absolute top-2 right-2 pointer-events-auto">
            <LanguageSwitcher compact />
          </div>
        </div>

        {/* Caption bar */}
        <div className="bg-slate-800 px-4 py-3">
          <p className="text-sm text-slate-100 leading-relaxed min-h-[40px]">{t(active.captionKey)}</p>
        </div>

        {/* Controls */}
        <div className="bg-slate-900 px-4 py-3">
          {/* Progress bar */}
          <div
            className="h-1.5 bg-slate-700 rounded-full cursor-pointer mb-3 relative"
            onClick={seek}
          >
            <div className="h-full bg-emerald-500 rounded-full transition-[width] duration-75" style={{ width: `${pct}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow"
              style={{ left: `calc(${pct}% - 6px)` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="w-4 h-4" /> : ended ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={replay}
                className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                aria-label={t('demoReplay')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {fmt(time)} / {fmt(totalDuration)}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label={t('demoClose')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Screen mockups (the "video frames") ---------- */

function PhoneChrome({ children, progress = 1 }: { children: React.ReactNode; progress?: number }) {
  return (
    <div className="absolute inset-3 rounded-xl border-2 border-slate-200 bg-white overflow-hidden flex flex-col">
      <div className="h-6 bg-emerald-600 flex items-center justify-center shrink-0">
        <span className="text-white text-[9px] font-bold">Feed Formular</span>
      </div>
      <div className="flex-1 relative overflow-hidden">{children}</div>
      <div className="h-5 border-t border-slate-100 flex items-center justify-around shrink-0 bg-slate-50" style={{ opacity: progress > 0.05 ? 1 : 0.3 }}>
        <span className="text-[7px] text-slate-400">●</span>
        <span className="text-[7px] text-slate-300">●</span>
        <span className="text-[7px] text-slate-300">●</span>
      </div>
    </div>
  );
}

function FeedTypeScene({ progress, fr }: { progress: number; fr: boolean }) {
  const options = FEED_TYPES.slice(0, 6);
  const reveal = Math.floor(progress * options.length);
  return (
    <PhoneChrome>
      <div className="p-2.5">
        <div className="text-[10px] font-bold text-slate-800 mb-2">{fr ? "Type d'aliment" : 'Feed type'}</div>
        <div className="h-8 rounded-lg border border-slate-300 flex items-center px-2 text-[9px] text-slate-700 mb-2 bg-white">
          {fr ? '▼ Sélectionnez type...' : '▼ Select type...'}
        </div>
        <div className="space-y-1">
          {options.slice(0, Math.max(1, reveal)).map((ft, i) => (
            <div
              key={ft.key}
              className={`px-2 py-1.5 rounded-md text-[8px] transition-colors ${
                reveal === i + 1 && progress > 0.85
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-100'
              }`}
            >
              {fr ? ft.label : ft.labelEn}
            </div>
          ))}
        </div>
      </div>
    </PhoneChrome>
  );
}

function IngredientsScene({ progress, fr }: { progress: number; fr: boolean }) {
  const reveal = Math.ceil(progress * DEMO_RECIPE.length);
  return (
    <PhoneChrome>
      <div className="p-2.5">
        <div className="text-[10px] font-bold text-slate-800 mb-2">{fr ? 'Ingrédients' : 'Ingredients'}</div>
        <div className="space-y-1">
          {DEMO_RECIPE.slice(0, reveal).map((r) => {
            const ing = INGREDIENT_MAP[r.key];
            return (
              <div key={r.key} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                <span className="text-[8px] text-slate-700 truncate max-w-[55%]">{fr ? ing.label : ing.labelEn}</span>
                <span className="text-[8px] font-bold text-emerald-700">{r.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Total badge */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className={`px-2 py-1 rounded-md text-center text-[9px] font-bold ${
          progress > 0.95 ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-amber-900'
        }`}>
          {fr ? 'Total' : 'Total'} : {(progress * 100).toFixed(1)}%
        </div>
      </div>
    </PhoneChrome>
  );
}

function PricesScene({ progress, fr }: { progress: number; fr: boolean }) {
  const reveal = Math.ceil(progress * DEMO_RECIPE.length);
  return (
    <PhoneChrome>
      <div className="p-2.5">
        <div className="text-[10px] font-bold text-slate-800 mb-2">{fr ? 'Prix / kg' : 'Price / kg'}</div>
        <div className="space-y-1">
          {DEMO_RECIPE.slice(0, reveal).map((r) => {
            const ing = INGREDIENT_MAP[r.key];
            return (
              <div key={r.key} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                <span className="text-[8px] text-slate-700 truncate max-w-[50%]">{fr ? ing.label : ing.labelEn}</span>
                <span className="flex items-center gap-1">
                  <span className="text-[8px] text-slate-400">{r.price}</span>
                  <span className="text-[8px] font-bold text-slate-800">XOF</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneChrome>
  );
}

function CalculatingScene({ progress, fr }: { progress: number; fr: boolean }) {
  const spin = progress * 720;
  return (
    <PhoneChrome>
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <div
          className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full"
          style={{ borderWidth: 3, transform: `rotate(${spin}deg)` }}
        />
        <div className="text-[10px] font-bold text-slate-700">{fr ? 'Calcul en cours...' : 'Calculating...'}</div>
        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </PhoneChrome>
  );
}

function ResultsScene({ progress, fr }: { progress: number; fr: boolean }) {
  const partialCost = DEMO_RECIPE.reduce((s, r) => s + (r.pct / 100) * r.price, 0);
  const pricePerKg = partialCost;
  const bagPrice = pricePerKg * 50;
  const rows = [
    { key: 'PB', value: 17.2, min: 17.0, max: 18.5 },
    { key: 'EM', value: 2850, min: 2800, max: 2900 },
    { key: 'Ca', value: 3.6, min: 3.5, max: 4.0 },
    { key: 'Lys', value: 0.84, min: 0.80, max: 0.88 },
  ];
  const reveal = Math.ceil(progress * rows.length);
  const fmtV = (v: number) => (v >= 1000 ? v.toFixed(0) : v.toFixed(2));
  return (
    <PhoneChrome>
      <div className="p-2.5">
        {/* Price results */}
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5">
            <div className="text-[7px] text-slate-500">{fr ? 'Prix / kg' : 'Price / kg'}</div>
            <div className="text-[10px] font-bold text-emerald-700">{pricePerKg.toFixed(0)} XOF</div>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5">
            <div className="text-[7px] text-slate-500">{fr ? 'Sac 50 kg' : '50 kg bag'}</div>
            <div className="text-[10px] font-bold text-emerald-700">{bagPrice.toFixed(0)} XOF</div>
          </div>
        </div>
        {/* Nutrient rows */}
        <div className="space-y-1">
          {rows.slice(0, reveal).map((r) => {
            const ok = r.value >= r.min && r.value <= r.max;
            return (
              <div key={r.key} className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                <span className="text-[8px] font-medium text-slate-700">{r.key}</span>
                <span className="text-[8px] text-slate-500">{fmtV(r.min)}–{fmtV(r.max)}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {fmtV(r.value)} {ok ? '✓' : '~'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneChrome>
  );
}

function RecommendationsScene({ progress, fr }: { progress: number; fr: boolean }) {
  const recs = [
    fr ? 'Protéine faible -> Ajoutez Tourteau de Soja.' : 'Protein low -> Add Soybean meal.',
    fr ? 'Calcium faible -> Ajoutez Coquilles.' : 'Calcium low -> Add Oyster shells.',
    fr ? 'Fibres trop hautes -> Diminuez Son de blé.' : 'Fiber too high -> Reduce Wheat bran.',
  ];
  const reveal = Math.ceil(progress * recs.length);
  return (
    <PhoneChrome>
      <div className="p-2.5">
        <div className="text-[10px] font-bold text-slate-900 mb-2">{fr ? 'Recommandations' : 'Recommendations'}</div>
        <div className="space-y-1">
          {recs.slice(0, reveal).map((r, i) => (
            <div key={i} className="px-2 py-1.5 rounded-md bg-white border border-slate-200">
              <span className="text-[8px] italic text-slate-900">• {r}</span>
            </div>
          ))}
        </div>
        {progress > 0.9 && (
          <div className="mt-2 px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
            <span className="text-[7px] italic text-slate-500">
              {fr ? 'Actions sans conflit : n\'aggravent aucun autre nutriment.' : 'Conflict-free actions: no other nutrient is worsened.'}
            </span>
          </div>
        )}
      </div>
    </PhoneChrome>
  );
}

function SaveScene({ progress, fr }: { progress: number; fr: boolean }) {
  const nameProgress = clamp(progress * 3, 0, 1);
  const formulaName = fr ? 'Ponte 1 —Ferme Zinvié' : 'Layer 1 — Zinvié Farm';
  const shownName = formulaName.slice(0, Math.ceil(nameProgress * formulaName.length));
  return (
    <PhoneChrome>
      <div className="p-2.5 h-full flex flex-col">
        <div className="text-[10px] font-bold text-slate-800 mb-2">{fr ? 'Sauvegarder la formule' : 'Save formula'}</div>
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/50 px-2 py-2 mb-3">
          <div className="text-[7px] text-slate-500 mb-0.5">{fr ? 'Nom de la formule' : 'Formula name'}</div>
          <div className="text-[9px] font-bold text-slate-800">
            {shownName}
            <span className="inline-block w-1.5 h-2.5 bg-emerald-600 ml-0.5 animate-pulse" />
          </div>
        </div>
        <div className={`mt-auto flex gap-1.5 transition-opacity ${progress > 0.6 ? 'opacity-100' : 'opacity-30'}`}>
          <div className="flex-1 py-1.5 rounded-md bg-emerald-600 text-white text-[8px] font-bold text-center">
            {fr ? 'Sauvegarder' : 'Save'}
          </div>
          <div className="flex-1 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[8px] font-bold text-center">
            PDF
          </div>
          <div className="flex-1 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[8px] font-bold text-center">
            WhatsApp
          </div>
        </div>
      </div>
    </PhoneChrome>
  );
}

/* ---------- helpers ---------- */

function useScenes(isFr: boolean): Scene[] {
  return [
    { captionKey: 'demoStep1Title', duration: 5, render: (p) => <FeedTypeScene progress={p} fr={isFr} /> },
    { captionKey: 'demoStep2Title', duration: 6, render: (p) => <IngredientsScene progress={p} fr={isFr} /> },
    { captionKey: 'demoStep3Title', duration: 5, render: (p) => <PricesScene progress={p} fr={isFr} /> },
    { captionKey: 'demoStep4Title', duration: 3, render: (p) => <CalculatingScene progress={p} fr={isFr} /> },
    { captionKey: 'demoStep5Title', duration: 6, render: (p) => <ResultsScene progress={p} fr={isFr} /> },
    { captionKey: 'demoStep5Text', duration: 6, render: (p) => <RecommendationsScene progress={p} fr={isFr} /> },
    { captionKey: 'demoStep6Title', duration: 5, render: (p) => <SaveScene progress={p} fr={isFr} /> },
  ];
}
