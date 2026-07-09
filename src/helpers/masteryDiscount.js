import { MASTERY_DEFS } from '../data/masteryDefs.js';

export function getActiveRecipe(player) {
    return player?.recipes?.unlocked?.find((r) => r.isActive) ?? null;
}

// Ingredient discount is tied to mastery of whatever recipe is currently active.
export function getActiveIngredientDiscount(player) {
    const active = getActiveRecipe(player);
    if (!active) return 0;

    const def = MASTERY_DEFS[active.rarity];
    if (!def) return 0;

    const stars = active.stars ?? 0;
    const discount = def.ingredientDiscountPerStar * stars;

    return Math.min(0.9, Math.max(0, discount));
}