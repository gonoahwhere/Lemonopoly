import { RARITY_TIERS, MASTERY_DEFS } from '../data/masteryDefs.js';

export function calculateStars(recipe) {
    const def = MASTERY_DEFS[recipe.rarity];
    const custStars = Math.floor(recipe.progress.customersServed / def.customersPerStar);
    const revStars = Math.floor(recipe.progress.revenueEarned / def.revenuePerStar);
    return Math.min(5, custStars, revStars);
}

export function getMasteryBonuses(recipe) {
    const tierIndex = RARITY_TIERS.indexOf(recipe.rarity);
    let sellPriceBonus = 0;
    let ingredientDiscount = 0;

    for (let i = 0; i < tierIndex; i++) {
        const def = MASTERY_DEFS[RARITY_TIERS[i]];
        sellPriceBonus += def.sellPriceBonusPerStar * 5;
        ingredientDiscount += def.ingredientDiscountPerStar * 5;
    }

    const currentDef = MASTERY_DEFS[recipe.rarity];
    sellPriceBonus += currentDef.sellPriceBonusPerStar * recipe.stars;
    ingredientDiscount += currentDef.ingredientDiscountPerStar * recipe.stars;

    return {
        sellPriceMultiplier: 1 + sellPriceBonus,
        ingredientDiscount: Math.min(ingredientDiscount, 0.9),
    };
}

export function canMaster(recipe, playerPrestigeLevel) {
    if (recipe.stars < 5) return { ok: false, reason: 'NOT_ENOUGH_STARS' };

    const tierIndex = RARITY_TIERS.indexOf(recipe.rarity);
    const nextTier = RARITY_TIERS[tierIndex + 1];
    if (!nextTier) return { ok: false, reason: 'MAX_TIER' };

    const required = MASTERY_DEFS[nextTier].prestigeRequired ?? 0;
    if (playerPrestigeLevel < required) {
        return { ok: false, reason: 'PRESTIGE_LOCKED', required, nextTier };
    }

    return { ok: true, nextTier };
}

export function masterRecipe(recipe, playerPrestigeLevel) {
    const check = canMaster(recipe, playerPrestigeLevel);
    if (!check.ok) return check;

    recipe.rarity = check.nextTier;
    recipe.stars = 0;
    recipe.progress.customersServed = 0;
    recipe.progress.revenueEarned = 0;

    return { ok: true, newRarity: check.nextTier };
}

export function getStarProgressFraction(entry) {
    const def = MASTERY_DEFS[entry.rarity];
    if (entry.stars >= 5) return 1;

    const nextStarCustomers = def.customersPerStar * (entry.stars + 1);
    const nextStarRevenue = def.revenuePerStar * (entry.stars + 1);

    const custFrac = entry.progress.customersServed / nextStarCustomers;
    const revFrac = entry.progress.revenueEarned / nextStarRevenue;

    return Math.max(0, Math.min(1, Math.min(custFrac, revFrac)));
}