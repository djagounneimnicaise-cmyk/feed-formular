import type { IngredientDef, IngredientKey } from './types';

function v(
  EM: number, Fibres: number, MG: number, PB: number, Lys: number, Met: number,
  Met_Cys: number, Thr: number, Trp: number, Ca: number, P: number, Na: number,
  Val: number, Cl: number, Arg: number, Ile: number, K: number, A_Linol: number,
  Vit_A: number, Vit_D3: number, Vit_E: number, Vit_K: number, Vit_B1: number,
  Vit_B2: number, Vit_B6: number, Vit_B12: number, Niacine: number,
  Ac_Folique: number, Ac_Panto: number, Biotine: number, Coline: number,
  Fe: number, Cu: number, Mn: number, Zn: number, Se: number, I: number, Co: number,
) {
  return {
    EM, Fibres, MG, PB, Lys, Met, Met_Cys, Thr, Trp, Ca, P, Na,
    Val, Cl, Arg, Ile, K, A_Linol, Vit_A, Vit_D3, Vit_E, Vit_K, Vit_B1,
    Vit_B2, Vit_B6, Vit_B12, Niacine, Ac_Folique, Ac_Panto, Biotine, Coline,
    Fe, Cu, Mn, Zn, Se, I, Co,
  };
}

export const INGREDIENTS: IngredientDef[] = [
  {
    key: 'grain_mais',
    label: 'Grain de Maïs',
    isConcentrate: false,
    values: v(3300, 2.2, 4.2, 7.5, 0.23, 0.16, 0.33, 0.27, 0.07, 0.02, 0.1, 0.01, 0.4, 0.04, 0.42, 0.3, 0.35, 1.9, 0, 0, 8.55, 0.15, 1.8, 0.7, 2.3, 0, 20, 0.3, 5.5, 0, 620, 35, 3.5, 7, 20, 0.06, 0.05, 0.05),
  },
  {
    key: 'son_mais',
    label: 'Son de maïs',
    isConcentrate: false,
    values: v(2228, 9, 4.5, 10.1, 0.25, 0.15, 0.36, 0.35, 0.08, 0.03, 0.08, 0.02, 0.45, 0.05, 0.6, 0.35, 0.6, 0.85, 0, 0, 15, 0.2, 4.5, 1.1, 5.5, 0, 35, 0.3, 8, 0, 850, 80, 6, 15, 45, 0.1, 0.08, 0.08),
  },
  {
    key: 'grain_mil',
    label: 'Grain de mil',
    isConcentrate: false,
    values: v(2800, 3, 4, 11, 0.25, 0.2, 0.38, 0.38, 0.18, 0.05, 0.28, 0.01, 0.5, 0.04, 0.5, 0.45, 0.42, 1.1, 0, 0, 4.5, 0.1, 3.8, 1.8, 3.9, 0, 25, 0.25, 7.5, 0, 780, 70, 5, 12, 28, 0.08, 0.06, 0.06),
  },
  {
    key: 'son_riz',
    label: 'Son de riz',
    isConcentrate: false,
    values: v(2850, 12.5, 13.5, 13.5, 0.61, 0.26, 0.42, 0.5, 0.17, 0.07, 1.4, 0.05, 0.71, 0.08, 1.05, 0.46, 1.15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 180, 12, 110, 60, 0.35, 0.3, 0.15),
  },
  {
    key: 'grain_sorgho',
    label: 'Grain de Sorgho',
    isConcentrate: false,
    values: v(3175, 2.5, 3, 9, 0.24, 0.16, 0.34, 0.3, 0.1, 0.04, 0.1, 0.01, 0.45, 0.05, 0.38, 0.35, 0.38, 1, 0, 0, 7.5, 0.12, 3.9, 1.3, 3.2, 0, 38, 0.28, 8.5, 0, 700, 85, 8, 15, 25, 0.15, 0.07, 0.07),
  },
  {
    key: 'son_cube',
    label: 'Son cubé',
    isConcentrate: false,
    values: v(1800, 8.5, 4.2, 15.5, 0.55, 0.22, 0.48, 0.5, 0.22, 0.12, 0.35, 0.04, 0.7, 0.06, 0.95, 0.6, 1.15, 0.65, 0, 0, 20, 0.3, 8, 3, 6.8, 0, 180, 0.75, 22, 0, 1100, 180, 12, 110, 90, 0.35, 0.15, 0.12),
  },
  {
    key: 'son_ble',
    label: 'Son de blé',
    isConcentrate: false,
    values: v(1440, 9.6, 4.5, 16, 0.58, 0.23, 0.45, 0.48, 0.2, 0.14, 0.4, 0.05, 0.65, 0.07, 1, 0.65, 1.18, 0.7, 0, 0, 22, 0.35, 8.5, 3.5, 7.2, 0, 195, 0.9, 25, 0, 1250, 190, 13, 115, 95, 0.38, 0.16, 0.13),
  },
  {
    key: 'concentre_chair_5',
    label: 'Concentré chair 5%',
    isConcentrate: true,
    values: v(2800, 2.4, 5.3, 31.2, 4.4, 3.5, 4.2, 0, 0, 10.2, 4.6, 2.9, 0, 0, 0, 1.4, 0.7, 0.4, 200000, 40000, 400, 20, 20, 80, 30, 0.25, 450, 12, 180, 0, 6000, 1000, 300, 1600, 1500, 5, 25, 8),
  },
  {
    key: 'concentre_chair_10',
    label: 'Concentré chair 10%',
    isConcentrate: true,
    values: v(2590, 2.4, 4.3, 48, 7.2, 3, 7, 0, 0, 1.9, 2.8, 1.9, 0, 0, 0, 1.2, 0.65, 0.35, 150000, 30000, 300, 15, 15, 60, 25, 0.2, 350, 10, 140, 0, 5000, 800, 220, 1200, 1100, 3.5, 18, 6),
  },
  {
    key: 'concentre_ponte_5_jauni',
    label: 'Concentré Ponte 5% jaunissant',
    isConcentrate: true,
    values: v(2200, 9.5, 2.7, 30, 2.8, 2.4, 2.5, 0, 0, 2.8, 3.3, 2.9, 0, 0, 0, 1.65, 0.75, 0.45, 250000, 50000, 500, 25, 25, 90, 35, 0.3, 500, 15, 200, 0, 6500, 1200, 350, 1800, 1700, 6, 30, 10),
  },
  {
    key: 'concentre_rearer_5',
    label: 'Concentré rearer 5%',
    isConcentrate: true,
    values: v(3740, 3.5, 7, 37.2, 2.2, 2.3, 2.5, 0, 0, 1.5, 4, 2.8, 0, 0, 0, 1.5, 0.7, 0.4, 220000, 45000, 450, 22, 22, 85, 32, 0.28, 480, 13, 190, 0, 6200, 1100, 320, 1700, 1600, 5.5, 28, 9),
  },
  {
    key: 'huile_palme_rouge',
    label: "Huile de palme (Rouge)",
    isConcentrate: false,
    values: v(8600, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  },
  {
    key: 'tourteau_coton',
    label: 'Tourteau de coton',
    isConcentrate: false,
    values: v(2368, 14.6, 4.6, 42.5, 1.72, 0.59, 1.24, 1.35, 0.5, 0.2, 0.3, 0.05, 1.8, 0.04, 4.2, 1.4, 1.2, 0.5, 0, 0, 8.5, 0.18, 5.2, 4.1, 6.5, 0, 35, 1.15, 10, 0, 2100, 200, 15, 20, 65, 0.3, 0.18, 0.2),
  },
  {
    key: 'soja_grain_torrefie',
    label: 'Soja grain torifié',
    isConcentrate: false,
    values: v(3900, 6, 17.9, 37, 2.35, 0.52, 1.15, 1.45, 0.48, 0.25, 0.2, 0.01, 1.8, 0.03, 2.65, 1.85, 1.8, 9.5, 0, 0, 3, 0.4, 6.5, 2.8, 5, 0, 24, 0.85, 15, 0, 2700, 120, 12, 30, 45, 0.08, 0.12, 0.15),
  },
  {
    key: 'tourteau_soja_42',
    label: 'Tourteau de Soja 42',
    isConcentrate: false,
    values: v(2280, 5.5, 3.5, 42.5, 2.54, 0.59, 1.24, 1.8, 0.6, 0.34, 0.6, 0.04, 0, 0.02, 3.3, 2.2, 1.71, 1.8, 0, 0, 3.5, 0.5, 6, 3, 6, 0, 30, 0.7, 16, 0, 2573, 150, 18, 35, 55, 0.3, 0.3, 0.2),
  },
  {
    key: 'tourteau_soja_44',
    label: 'Tourteau de soja 44',
    isConcentrate: false,
    values: v(2350, 6, 1.5, 44, 2.75, 0.61, 1.28, 1.8, 0.6, 0.34, 0.22, 0.01, 2.15, 0.05, 3.3, 2.2, 2, 0.8, 0, 0, 3.5, 0.5, 6, 3, 6, 0, 30, 0.7, 16, 0, 2700, 250, 18, 35, 55, 0.12, 0.15, 0.18),
  },
  {
    key: 'tourteau_soja_46',
    label: 'Tourteau de soja 46',
    isConcentrate: false,
    values: v(2420, 7.4, 1.7, 46, 2.9, 0.65, 1.35, 1.8, 0.6, 0.34, 0.22, 0.01, 2.15, 0.05, 3.3, 2.2, 2, 0.8, 0, 0, 3.5, 0.5, 6, 3, 6, 0, 30, 0.7, 16, 0, 2700, 250, 18, 35, 55, 0.12, 0.15, 0.18),
  },
  {
    key: 'tourteau_soja_48',
    label: 'Tourteau de soja 48',
    isConcentrate: false,
    values: v(2440, 3.9, 1, 48.5, 3.05, 0.65, 1.38, 1.8, 0.6, 0.34, 0.22, 0.01, 2.15, 0.05, 3.3, 2.2, 2, 0.8, 0, 0, 3.5, 0.5, 6, 3, 6, 0, 30, 0.7, 16, 0, 2700, 250, 18, 35, 55, 0.12, 0.15, 0.18),
  },
  {
    key: 'methionine',
    label: 'Méthionine',
    isConcentrate: false,
    values: v(5000, 0, 0, 58, 0, 99, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  },
  {
    key: 'lysine',
    label: 'Lysine',
    isConcentrate: false,
    values: v(4000, 0, 0, 95, 78, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  },
  {
    key: 'coquilles',
    label: 'Coquilles',
    isConcentrate: false,
    values: v(0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  },
  {
    key: 'farine_os',
    label: "Farine d'os",
    isConcentrate: false,
    values: v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  },
  {
    key: 'sel',
    label: 'Sel',
    isConcentrate: false,
    values: v(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  },
  {
    key: 'huile_arachide',
    label: "Huile d'arachide",
    isConcentrate: false,
    values: v(8800, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  },
  {
    key: 'tourteau_palmixte',
    label: 'Tourteau de palmixte',
    isConcentrate: false,
    values: v(2654, 15, 10, 16, 0.6, 0.3, 0.65, 0.55, 0.15, 0.3, 0.2, 0.02, 0.8, 0.05, 0.95, 0.6, 0.75, 0.15, 0, 0, 4.5, 0.1, 2.2, 2.8, 3.2, 0, 32, 0.35, 4.5, 0, 1150, 450, 22, 180, 60, 0.2, 0.1, 0.18),
  },
  {
    key: 'farine_poisson_non_gras',
    label: 'F. de poisson non gras',
    isConcentrate: false,
    values: v(2850, 1, 8.5, 60, 4.5, 1.7, 2.4, 2.5, 0.65, 5.5, 3, 0.8, 3, 0.9, 3.8, 2.8, 0.85, 0.1, 0, 800, 8, 0.2, 1, 6.5, 4.5, 0.35, 75, 0.45, 12, 0, 3500, 380, 8, 10, 90, 2.2, 3.5, 0.25),
  },
  {
    key: 'niebe_grain',
    label: 'Niébé grain',
    isConcentrate: false,
    values: v(2800, 5.5, 1.5, 25, 1.65, 0.3, 0.55, 0.85, 0.25, 0.1, 0.15, 0.02, 1.15, 0.04, 1.6, 1.1, 1.15, 0.35, 0, 0, 3, 0.15, 7, 2.5, 3.5, 0, 18, 0.6, 18, 0, 1500, 75, 7, 18, 35, 0.1, 0.1, 0.2),
  },
  {
    key: 'tourteau_arachide',
    label: "Tourteau d'arachide",
    isConcentrate: false,
    values: v(2410, 6.8, 3.4, 49, 1.7, 0.49, 1.18, 1.25, 0.55, 0.16, 0.2, 0.02, 1.9, 0.03, 5.2, 1.7, 1.15, 0.35, 0, 0, 10, 0.25, 7.5, 3.2, 6, 0, 165, 0.65, 22, 0, 1750, 250, 16, 35, 50, 0.25, 0.2, 0.15),
  },
];

export const INGREDIENT_MAP = Object.fromEntries(
  INGREDIENTS.map((i) => [i.key, i]),
) as Record<IngredientKey, IngredientDef>;
