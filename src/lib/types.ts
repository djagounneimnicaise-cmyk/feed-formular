export type IngredientKey =
  | 'grain_mais'
  | 'son_mais'
  | 'grain_mil'
  | 'grain_sorgho'
  | 'son_cube'
  | 'son_ble'
  | 'concentre_chair_5'
  | 'concentre_chair_10'
  | 'concentre_ponte_5_jauni'
  | 'concentre_rearer_5'
  | 'huile_palme_rouge'
  | 'tourteau_coton'
  | 'soja_grain_torrefie'
  | 'son_riz'
  | 'tourteau_soja_42'
  | 'tourteau_soja_44'
  | 'tourteau_soja_46'
  | 'tourteau_soja_48'
  | 'methionine'
  | 'lysine'
  | 'coquilles'
  | 'farine_os'
  | 'sel'
  | 'huile_arachide'
  | 'tourteau_palmixte'
  | 'farine_poisson_non_gras'
  | 'niebe_grain'
  | 'tourteau_arachide';

export type NutrientKey =
  | 'EM' | 'Fibres' | 'MG' | 'PB' | 'Lys' | 'Met' | 'Met_Cys' | 'Thr'
  | 'Trp' | 'Ca' | 'P' | 'Na' | 'Val' | 'Cl' | 'Arg' | 'Ile' | 'K'
  | 'A_Linol' | 'Vit_A' | 'Vit_D3' | 'Vit_E' | 'Vit_K' | 'Vit_B1'
  | 'Vit_B2' | 'Vit_B6' | 'Vit_B12' | 'Niacine' | 'Ac_Folique'
  | 'Ac_Panto' | 'Biotine' | 'Coline' | 'Fe' | 'Cu' | 'Mn' | 'Zn'
  | 'Se' | 'I' | 'Co';

export type NutrientDef = {
  key: NutrientKey;
  label: string;
  unit: string;
  decimals: number;
};

export type IngredientDef = {
  key: IngredientKey;
  label: string;
  isConcentrate: boolean;
  values: Record<NutrientKey, number>;
};

export type NormRange = {
  min: number;
  max: number;
};

export type FeedTypeKey =
  | 'demarrage_ponte'
  | 'demarrage_chair'
  | 'croissance_chair'
  | 'croissance_ponte'
  | 'finition_chair'
  | 'poulette'
  | 'preponte'
  | 'ponte_1'
  | 'ponte_2'
  | 'predemarrage'
  | 'goliath_adulte';

export type FeedTypeDef = {
  key: FeedTypeKey;
  label: string;
  norms: Partial<Record<NutrientKey, NormRange>>;
};

export type ColorResult = 'green' | 'orange' | 'red';

export type Percentages = Record<string, number>;
export type Prices = Record<string, number>;
