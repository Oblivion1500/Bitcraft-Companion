// Bitcraft item and recipe database (partial, for demo)
// This should be generated or imported from a larger dataset in production

import type { Recipe, Resource } from "./models";
// @ts-ignore
import itemsData from './raw/bitcraft_items.json';
// @ts-ignore
import recipesData from './raw/bitcraft_recipes.json';

export interface ItemWithTier extends Resource {
  tier: number;
  rarity?: string;
  icon?: string;
  recipeIds?: string[]; // IDs of recipes that produce this item
}

// --- AUTO-GENERATED FULL DATASET BELOW ---
// eslint-disable-next-line
export const ITEMS: ItemWithTier[] = itemsData as ItemWithTier[];
// eslint-disable-next-line
export const RECIPES: Recipe[] = recipesData as Recipe[];
