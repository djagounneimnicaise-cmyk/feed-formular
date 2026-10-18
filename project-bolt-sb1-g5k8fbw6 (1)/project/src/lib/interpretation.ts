import type { ColorResult, NutrientDef, NutrientKey } from './types';
import { INGREDIENTS } from './ingredients';
import type { Percentages } from './types';

export type InterpretationResult = {
  overall: string;
  details: string[];
};

type ResultItem = {
  nut: NutrientDef;
  value: number;
  range: { min: number; max: number } | undefined;
  color: ColorResult;
};

// +3 = "+++" strong raise, -3 = "---" strong lower. 0 = no significant effect.
type Impact = number;

// Unified impact matrix (per ingredient, effect on each nutrient)
export const MATRICE_IMPACT: Record<string, Partial<Record<NutrientKey, Impact>>> = {
  grain_mais: { EM: 3, MG: 1, Fibres: -1, PB: -1 },
  grain_mil: { EM: 2, PB: 1, Fibres: -1 },
  grain_sorgho: { EM: 2, PB: 1, Fibres: -1 },
  tourteau_soja_42: { PB: 3, Lys: 3, Fibres: 2, EM: -1 },
  tourteau_soja_44: { PB: 3, Lys: 3, Met: 1, Fibres: 1, EM: -1 },
  tourteau_soja_46: { PB: 3, Lys: 3, Met: 1, Fibres: 1, EM: -1 },
  tourteau_soja_48: { PB: 3, Lys: 3, Met: 1, Fibres: 1, EM: -1 },
  tourteau_arachide: { PB: 3, MG: 2, Fibres: 1 },
  farine_poisson_non_gras: { PB: 3, Lys: 2, Met: 2, P: 2, Na: 1 },
  son_ble: { Fibres: 3, EM: -3, P: 1 },
  son_riz: { Fibres: 3, EM: -2, MG: 1 },
  huile_palme_rouge: { EM: 3, MG: 3 },
  coquilles: { Ca: 3 },
  phosphate_dicalcium: { Ca: 2, P: 3 },
  farine_os: { Ca: 2, P: 3 },
  sel: { Na: 3 },
  concentre_chair_5: { Lys: 3, Met: 3, Vit_A: 3, PB: 1 },
  concentre_chair_10: { Lys: 3, Met: 3, Vit_A: 3, PB: 1 },
  concentre_ponte_5_jauni: { Lys: 3, Met: 3, Vit_A: 3, PB: 1 },
  concentre_ola_ponte_5: { Lys: 3, Met: 3, Vit_A: 3, PB: 1 },
  concentre_rearer_5: { Lys: 3, Met: 3, Vit_A: 3, PB: 1 },
  methionine: { Met: 3 },
  lysine: { Lys: 3 },
  son_mais: { Fibres: 3, EM: -2 },
  son_cube: { Fibres: 3, EM: -2 },
  huile_arachide: { EM: 3, MG: 3 },
  tourteau_coton: { PB: 2, Fibres: 2 },
  tourteau_palmixte: { PB: 2, MG: 2, Fibres: 1 },
  niebe_grain: { PB: 2, Fibres: 2 },
  soja_grain_torrefie: { PB: 2, Lys: 2, MG: 2, EM: 2 },
};

const NUTRIENT_LABEL: Partial<Record<NutrientKey, { fr: string; en: string }>> = {
  EM: { fr: 'Énergie', en: 'Energy' },
  PB: { fr: 'Protéine', en: 'Protein' },
  MG: { fr: 'Matière Grasse', en: 'Crude Fat' },
  Fibres: { fr: 'Fibres', en: 'Fiber' },
  Lys: { fr: 'Lysine', en: 'Lysine' },
  Met: { fr: 'Méthionine', en: 'Methionine' },
  Ca: { fr: 'Calcium', en: 'Calcium' },
  P: { fr: 'Phosphore', en: 'Phosphorus' },
  Na: { fr: 'Sodium', en: 'Sodium' },
};

function nutLabel(key: NutrientKey, fr: boolean): string {
  const l = NUTRIENT_LABEL[key];
  if (l) return fr ? l.fr : l.en;
  return key;
}

function ingLabel(key: string, fr: boolean): string {
  const ing = INGREDIENTS.find((i) => i.key === key);
  if (!ing) return key;
  return fr ? ing.label : ing.labelEn;
}

// RÈGLE #1 : les concentrés ont un taux fixe imposé par le fabricant.
// Interdit de recommander de les augmenter ou de les diminuer.
function estConcentre(key: string): boolean {
  const ing = INGREDIENTS.find((i) => i.key === key);
  const n = `${key} ${ing ? ing.label : ''}`.toLowerCase();
  return n.includes('concentr') || n.includes('horla') || n.includes('chair') || n.includes('ponte');
}

type Action =
  | { kind: 'add'; ingredient: string; eliminated: { key: string; conflict: NutrientKey }[] }
  | { kind: 'augment'; ingredient: string }
  | { kind: 'reduce'; ingredient: string }
  | { kind: 'complex' };

type LowPlan = {
  nutrient: NutrientKey;
  action: Action | null;
  mergedWith: NutrientKey | null;
};

export function buildInterpretation(
  results: ResultItem[],
  percentages: Percentages,
  lang: 'fr' | 'en',
): InterpretationResult {
  const fr = lang === 'fr';
  const withNorms = results.filter((r) => r.range);
  if (withNorms.length === 0) {
    return {
      overall: fr
        ? "Sélectionnez un type d'aliment avec des normes pour obtenir une interprétation."
        : 'Select a feed type with standards to get an interpretation.',
      details: [],
    };
  }

  // Only out-of-standard nutrients are reported. Tolerance (±8%) is ignored.
  const tooLow = withNorms.filter((r) => r.color === 'red' && r.range && r.value < r.range.min);
  const tooHigh = withNorms.filter((r) => r.color === 'red' && r.range && r.value > r.range.max);

  if (tooLow.length === 0 && tooHigh.length === 0) {
    return {
      overall: fr
        ? `Excellente formule : les ${withNorms.length} nutriments analysés respectent tous les normes recommandées. Vous pouvez l'utiliser telle quelle.`
        : `Excellent formula: all ${withNorms.length} analysed nutrients meet the recommended standards. You can use it as is.`,
      details: [],
    };
  }

  const usedKeys = INGREDIENTS.filter((ing) => (percentages[ing.key] || 0) > 0).map((ing) => ing.key);
  const unusedKeys = INGREDIENTS.filter((ing) => (percentages[ing.key] || 0) === 0).map((ing) => ing.key);
  // RÈGLE #1 : on ne modifie QUE les ingrédients non-concentrés déjà dans la formule.
  const modifiables = usedKeys.filter((k) => !estConcentre(k));
  const fixedConcentres = usedKeys.filter((k) => estConcentre(k));
  const impactOf = (key: string): Partial<Record<NutrientKey, Impact>> => MATRICE_IMPACT[key] ?? {};
  const highKeys = new Set(tooHigh.map((h) => h.nut.key));
  const lowKeys = new Set(tooLow.map((l) => l.nut.key));

  // Candidate raises N strongly and does not push any already-too-high nutrient higher (>= +2).
  const conflictFree = (key: string, nutrient: NutrientKey): boolean => {
    if ((impactOf(key)[nutrient] ?? 0) < 2) return false;
    for (const h of highKeys) {
      if ((impactOf(key)[h] ?? 0) >= 2) return false;
    }
    return true;
  };

  const bestIn = (keys: string[], nutrient: NutrientKey): string | null => {
    const ok = keys.filter((k) => conflictFree(k, nutrient));
    if (ok.length === 0) return null;
    return ok.sort((a, b) => (impactOf(b)[nutrient] ?? 0) - (impactOf(a)[nutrient] ?? 0))[0];
  };

  const culpritFor = (nutrient: NutrientKey): string | null => {
    // RÈGLE #1 : on ne diminue jamais un concentré — recherche limitée aux modifiables.
    const withImpact = modifiables
      .filter((k) => (impactOf(k)[nutrient] ?? 0) >= 2)
      .sort((a, b) => (impactOf(b)[nutrient] ?? 0) - (impactOf(a)[nutrient] ?? 0));
    if (withImpact.length > 0) return withImpact[0];
    // Fallback: strongest positive contributor even if moderate (+1)
    const moderate = modifiables
      .filter((k) => (impactOf(k)[nutrient] ?? 0) >= 1)
      .sort((a, b) => (impactOf(b)[nutrient] ?? 0) - (impactOf(a)[nutrient] ?? 0));
    return moderate.length > 0 ? moderate[0] : null;
  };

  // --- Plans for each too-low nutrient (unified rules; sodium low stays silent) ---
  const plans: LowPlan[] = [];
  for (const r of tooLow) {
    const key = r.nut.key;
    if (key === 'Na') continue;

    let action: Action | null = null;
    // Step A: raise a modifiable ingredient already in the formula (conflict-free).
    // RÈGLE #1 : les concentrés à taux fixe ne sont jamais proposés ici.
    const inFormula = bestIn(modifiables, key);
    if (inFormula) {
      action = { kind: 'augment', ingredient: inFormula };
    } else {
      // Step B: add a new ingredient (conflict-free), remembering eliminated options.
      // On préfère un ingrédient classique ; un concentré neuf garde son taux fixe.
      const add = bestIn(unusedKeys.filter((k) => !estConcentre(k)), key)
        ?? bestIn(unusedKeys.filter((k) => estConcentre(k)), key);
      if (add) {
        const eliminated = unusedKeys
          .filter((k) => (impactOf(k)[key] ?? 0) >= 2 && !conflictFree(k, key))
          .map((k) => {
            const conflict = [...highKeys].find((h) => (impactOf(k)[h] ?? 0) >= 2) as NutrientKey;
            return { key: k, conflict };
          });
        action = { kind: 'add', ingredient: add, eliminated };
      } else {
        action = { kind: 'complex' };
      }
    }
    plans.push({ nutrient: key, action, mergedWith: null });
  }

  // --- Too-high culprits ---
  const highCulprits = new Map<NutrientKey, string>();
  for (const h of tooHigh) {
    const culprit = culpritFor(h.nut.key);
    if (culprit) highCulprits.set(h.nut.key, culprit);
  }

  // --- Merge: when the ingredient to reduce is the cause of a deficiency ---
  for (const plan of plans) {
    if (plan.action?.kind !== 'augment') continue;
    for (const [highKey, culprit] of highCulprits) {
      if ((impactOf(culprit)[plan.nutrient] ?? 0) <= -2) {
        plan.mergedWith = highKey;
        (plan.action as { reduceIngredient?: string }).reduceIngredient = culprit;
        highCulprits.delete(highKey);
        break;
      }
    }
  }

  // Drop plans whose nutrient got merged away (their info lives in the merged line)
  const consumed = new Set(plans.map((p) => p.mergedWith).filter(Boolean) as NutrientKey[]);

  // --- Render ---
  const details: string[] = [];

  // RÈGLE #1 : si un concentré de la formule est une source (même légère) d'un nutriment
  // en carence, on précise d'emblée qu'il reste à son dosage fixe.
  if (fixedConcentres.length > 0) {
    const touchedByConcentre = tooLow.some((l) =>
      fixedConcentres.some((c) => (impactOf(c)[l.nut.key] ?? 0) >= 1));
    if (touchedByConcentre) {
      const names = fixedConcentres.map((c) => ingLabel(c, fr)).join(', ');
      details.push(fr
        ? `${names} à son taux fixe (ne pas modifier).`
        : `${names} stays at its fixed rate (do not change).`);
    }
  }

  const emitAdd = (plan: LowPlan) => {
    const a = plan.action as Extract<Action, { kind: 'add' }>;
    const name = ingLabel(a.ingredient, fr);
    const isNewConcentre = estConcentre(a.ingredient);
    let msg = fr
      ? `${nutLabel(plan.nutrient, fr)} faible -> Ajoutez ${name}`
      : `${nutLabel(plan.nutrient, fr)} low -> Add ${name}`;
    if (isNewConcentre) {
      msg += fr ? ' (à son dosage fixe)' : ' (at its fixed rate)';
    } else if (fr) {
      msg += ' (pas encore dans votre formule)';
    } else {
      msg += ' (not yet in your formula)';
    }
    if (a.eliminated.length > 0) {
      const parts = a.eliminated.map((e) => fr
        ? `${ingLabel(e.key, fr)} (${nutLabel(e.conflict, fr)} haut)`
        : `${ingLabel(e.key, fr)} (${nutLabel(e.conflict, fr)} high)`);
      msg += fr
        ? ` — pas ${parts.join(' ni ')}`
        : ` — not ${parts.join(' or ')}`;
    }
    details.push(msg + '.');
  };

  const emitAugment = (plan: LowPlan) => {
    const a = plan.action as Extract<Action, { kind: 'augment' }>;
    const name = ingLabel(a.ingredient, fr);
    details.push(fr
      ? `${nutLabel(plan.nutrient, fr)} faible -> Augmentez ${name} (déjà dans la formule).`
      : `${nutLabel(plan.nutrient, fr)} low -> Increase ${name} (already in the formula).`);
  };

  for (const plan of plans) {
    if (plan.action?.kind === 'add') emitAdd(plan);
  }
  for (const plan of plans) {
    if (plan.action?.kind === 'augment' && !plan.mergedWith && !consumed.has(plan.nutrient)) {
      emitAugment(plan);
    }
  }

  // Merged lines: deficiency + excess share the same root cause
  for (const plan of plans) {
    if (!plan.mergedWith || plan.action?.kind !== 'augment') continue;
    const reduceName = ingLabel((plan.action as { reduceIngredient?: string }).reduceIngredient ?? '', fr);
    const augmentName = ingLabel(plan.action.ingredient, fr);
    details.push(fr
      ? `${nutLabel(plan.nutrient, fr)} faible + ${nutLabel(plan.mergedWith, fr)} haut -> Diminuez ${reduceName} et Augmentez ${augmentName} (déjà dans la formule).`
      : `${nutLabel(plan.nutrient, fr)} low + ${nutLabel(plan.mergedWith, fr)} high -> Reduce ${reduceName} and Increase ${augmentName} (already in the formula).`);
  }

  // Remaining too-high nutrients not already covered
  for (const [highKey, culprit] of highCulprits) {
    const name = ingLabel(culprit, fr);
    details.push(fr
      ? `${nutLabel(highKey, fr)} haut -> Diminuez ${name} (déjà dans la formule).`
      : `${nutLabel(highKey, fr)} high -> Reduce ${name} (already in the formula).`);
  }

  for (const plan of plans) {
    if (plan.action?.kind === 'complex' && !consumed.has(plan.nutrient)) {
      details.push(fr
        ? `${nutLabel(plan.nutrient, fr)} faible et conflit avec les autres écarts : situation complexe, contactez un expert.`
        : `${nutLabel(plan.nutrient, fr)} low, conflicting with other deviations: complex situation, contact an expert.`);
    }
  }

  return { overall: '', details: details.slice(0, 7) };
}
