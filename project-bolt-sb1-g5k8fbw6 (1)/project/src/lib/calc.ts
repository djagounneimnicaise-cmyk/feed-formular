import { INGREDIENTS } from './ingredients';
import { NUTRIENT_KEYS } from './nutrients';
import type { NutrientKey, ColorResult, NormRange, FeedTypeKey } from './types';
import { FEED_TYPE_MAP } from './feedTypes';

export type Percentages = Record<string, number>;
export type Prices = Record<string, number>;

export function calculateNutrients(percentages: Percentages): Record<NutrientKey, number> {
  const result = {} as Record<NutrientKey, number>;
  for (const nk of NUTRIENT_KEYS) {
    let sum = 0;
    for (const ing of INGREDIENTS) {
      const pct = percentages[ing.key] || 0;
      sum += (ing.values[nk] * pct) / 100;
    }
    result[nk] = sum;
  }
  return result;
}

export function calculateTotalPercent(percentages: Percentages): number {
  return INGREDIENTS.reduce((sum, ing) => sum + (percentages[ing.key] || 0), 0);
}

export function calculatePricePerKg(percentages: Percentages, prices: Prices): number {
  let sum = 0;
  for (const ing of INGREDIENTS) {
    const pct = percentages[ing.key] || 0;
    const price = prices[ing.key] || 0;
    sum += (price * pct) / 100;
  }
  return sum;
}

export function getColor(
  value: number,
  range: NormRange | undefined,
): ColorResult {
  if (!range) return 'green';
  const { min, max } = range;
  if (value >= min && value <= max) return 'green';
  const tolMin = min * 0.92;
  const tolMax = max * 1.08;
  if (value >= tolMin && value < min) return 'orange';
  if (value > max && value <= tolMax) return 'orange';
  return 'red';
}

export function getNormsForType(typeKey: FeedTypeKey) {
  return FEED_TYPE_MAP[typeKey]?.norms || {};
}

export function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
