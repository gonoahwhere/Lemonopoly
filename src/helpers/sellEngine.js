import { RECIPES } from '../data/recipes.js';
import { calculateStars } from '../utils/recipeMastery.js';
import { getSellCooldownMs, getTipChance, getDoubleChance, TIP_RATE } from '../data/upgrades.js';
import { getSellCooldownMultiplier, getSellPriceMultiplier, getTipChanceBonus, getBulkTipChanceBonus, getTipAmountMultiplier, getBonusSaleChance, getSaleFailChance } from './eventEffects.js';
import { rollEventCustomer } from './eventCustomers.js';
import { EVENT_CUSTOMERS } from '../data/eventKeys.js';
import { MASTERY_DEFS } from '../data/masteryDefs.js';

const PREMIUM_COOLDOWN_INCREASE_MS = 15_000;
const NON_PREMIUM_COOLDOWN_INCREASE_MS = 20_000;

const EVENT_CUSTOMER_STAT_KEY = {
    tourist: 'tourists',
    kid: 'kids',
    worker: 'workers',
    rich: 'rich',
    angry: 'angry',
};

export const SELL_FAILURE = {
    NO_ACTIVE_RECIPE: 'NO_ACTIVE_RECIPE',
    RECIPE_NOT_FOUND: 'RECIPE_NOT_FOUND',
    PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
    OUT_OF_STOCK: 'OUT_OF_STOCK',
    ON_COOLDOWN: 'ON_COOLDOWN',
    SALE_FAILED: 'SALE_FAILED',
};

function getMasterySellMultiplier(activeRecipe) {
    const def = MASTERY_DEFS[activeRecipe.rarity];
    if (!def) return 1;
    return 1 + (def.sellPriceBonusPerStar * activeRecipe.stars);
}

export function getEffectiveCooldownMs(profile, liveEvent) {
    const cooldownPenaltyMs = profile.entitlements?.premium ? PREMIUM_COOLDOWN_INCREASE_MS : NON_PREMIUM_COOLDOWN_INCREASE_MS;
    const baseCooldownMs = getSellCooldownMs(profile) + cooldownPenaltyMs;
    return baseCooldownMs * getSellCooldownMultiplier(liveEvent);
}

export function getRemainingCooldownMs(profile, liveEvent) {
    const lastSold = profile.stand.lastSoldAt ? profile.stand.lastSoldAt.getTime() : 0;
    return lastSold + getEffectiveCooldownMs(profile, liveEvent) - Date.now();
}

export function attemptSell(profile, liveEvent) {
    const activeRecipe = profile.recipes.unlocked.find((r) => r.isActive);
    if (!activeRecipe) return { ok: false, reason: SELL_FAILURE.NO_ACTIVE_RECIPE };

    const recipe = RECIPES.find((r) => r.id === activeRecipe.key);
    if (!recipe) return { ok: false, reason: SELL_FAILURE.RECIPE_NOT_FOUND };

    if (recipe.unlock?.type === 'premium' && recipe.unlock?.requiresPass && !profile.entitlements?.premium) {
        return { ok: false, reason: SELL_FAILURE.PREMIUM_REQUIRED, recipe };
    }

    const stock = profile.drinks.find((d) => d.key === activeRecipe.key);
    if (!stock || stock.quantity <= 0) {
        return { ok: false, reason: SELL_FAILURE.OUT_OF_STOCK, recipe };
    }

    const remainingMs = getRemainingCooldownMs(profile, liveEvent);
    if (remainingMs > 0) {
        return { ok: false, reason: SELL_FAILURE.ON_COOLDOWN, remainingMs };
    }

    const saleFailChance = getSaleFailChance(liveEvent);
    if (saleFailChance > 0 && Math.random() < saleFailChance) {
        return { ok: false, reason: SELL_FAILURE.SALE_FAILED, recipe };
    }

    const doubled = stock.quantity >= 2 && Math.random() < getDoubleChance(profile);
    let cupsSold = doubled ? 2 : 1;

    const bonusSale = getBonusSaleChance(liveEvent);
    let bonusCup = false;
    let bonusDiscountMultiplier = 1;
    if (bonusSale.chance > 0 && stock.quantity > cupsSold && Math.random() < bonusSale.chance) {
        bonusCup = true;
        bonusDiscountMultiplier = bonusSale.discounted ? bonusSale.discountMultiplier : 1;
        cupsSold += 1;
    }

    const sellPriceMultiplier = getSellPriceMultiplier(liveEvent);
    const masteryMultiplier = getMasterySellMultiplier(activeRecipe);
    const unitPrice = recipe.sellPrice * sellPriceMultiplier * masteryMultiplier;
    const normalCups = bonusCup ? cupsSold - 1 : cupsSold;
    const saleValue = (unitPrice * normalCups) + (bonusCup ? unitPrice * bonusDiscountMultiplier : 0);

    let tipChance = getTipChance(profile) + getTipChanceBonus(liveEvent);
    if (cupsSold > 1) tipChance += getBulkTipChanceBonus(liveEvent);
    const tipped = Math.random() < tipChance;
    const tipAmountMultiplier = getTipAmountMultiplier(liveEvent);
    const tip = tipped ? Math.round(saleValue * TIP_RATE * tipAmountMultiplier) : 0;

    const earnings = saleValue + tip;

    const eventCustomerId = rollEventCustomer(liveEvent, activeRecipe.key, RECIPES);
    const eventCustomer = eventCustomerId ? EVENT_CUSTOMERS.find((c) => c.id === eventCustomerId) : null;

    stock.quantity -= cupsSold;
    if (stock.quantity <= 0) {
        profile.drinks = profile.drinks.filter((d) => d.key !== activeRecipe.key);
    }

    profile.economy.cash += earnings;
    profile.economy.lifetimeEarned.cash += earnings;
    profile.stand.lastSoldAt = new Date();

    profile.customers.cupsSold += cupsSold;
    profile.customers.totalServed += cupsSold;
    if (tip > 0) profile.customers.totalTipsEarned += tip;

    if (eventCustomer) {
        const statKey = EVENT_CUSTOMER_STAT_KEY[eventCustomer.id];
        if (statKey) profile.customers.byType[statKey] += cupsSold;
    }

    activeRecipe.timesServed += cupsSold;
    activeRecipe.progress.customersServed += cupsSold;
    activeRecipe.progress.revenueEarned += earnings;
    activeRecipe.stars = calculateStars(activeRecipe);

    return { ok: true, recipe, cupsSold, earnings, tip, doubled, bonusCup, eventCustomer };
}