import { MASTERY_DEFS } from '../data/masteryDefs.js';

export function getActiveRecipe(player) {
    return player?.recipes?.unlocked?.find((r) => r.isActive) ?? null;
}

// Ingredient discount is now the sum of every unlocked recipe's mastery contribution
export function getActiveIngredientDiscount(player) {
    const unlocked = player?.recipes?.unlocked ?? [];
    if (unlocked.length === 0) return 0;

    let totalDiscount = 0;
    
    for (const recipe of unlocked) {
        const def = MASTERY_DEFS[recipe.rarity];
        if (!def) continue;

        const stars = recipe.stars ?? 0;
        totalDiscount += def.ingredientDiscountPerStar * stars;
    }

    const premiumMulti = player?.entitlements?.premium ? 2 : 1;
    totalDiscount *= premiumMulti

    return Math.min(0.9, Math.max(0, totalDiscount));
}