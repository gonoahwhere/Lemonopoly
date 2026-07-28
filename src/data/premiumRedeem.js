import { INGREDIENTS } from './ingredients.js';
import { RECIPES } from './recipes.js';

// intentially left out Event and Premium ingredients
// so that gifts don't give free users premium ingredients
const CRATE_TIER_WEIGHTS = {
    Base: 30,
    Fruit: 24,
    Sweetener: 16,
    Herb: 10,
    Spice: 10,
    Drink: 10,
    Garnish: 8,
};

function weightedIngredientPool() {
    return Object.entries(INGREDIENTS)
        .filter(([, data]) => CRATE_TIER_WEIGHTS[data.type])
        .map(([key, data]) => ({ key, weight: CRATE_TIER_WEIGHTS[data.type], data }));
}

function pickWeighted(pool, count) {
    const chosen = [];
    const available = [...pool];

    for (let i = 0; i < count && available.length > 0; i++) {
        const totalWeight = available.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = Math.random() * totalWeight;
        let index = 0;

        for (; index < available.length; index++) {
            roll -= available[index].weight;
            if (roll <= 0) break;
        }

        chosen.push(available[index]);
        available.splice(index, 1); // unique picks per roll
    }

    return chosen;
}

function rollIngredientAmount(basePrice) {
    const raw = Math.round(60 / Math.max(basePrice, 1));
    return Math.max(3, Math.min(raw, 20));
}

export function rollRandomIngredients(count = 4) {
    const pool = weightedIngredientPool();
    return pickWeighted(pool, count).map(({ key, data }) => ({
        key,
        name: data.name,
        amount: rollIngredientAmount(data.basePrice),
    }));
}

export function applyIngredientGains(profile, gains) {
    const results = [];

    for (const gain of gains) {
        let entry = profile.ingredients.find((i) => i.key === gain.key);

        if (!entry) {
            const capacity = INGREDIENTS[gain.key]?.baseCapacity ?? 40;
            profile.ingredients.push({ key: gain.key, quantity: 0, capacity });
            entry = profile.ingredients[profile.ingredients.length - 1];
        }

        const room = Math.max(entry.capacity - entry.quantity, 0);
        const added = Math.min(room, gain.amount);
        const overflow = gain.amount - added;

        entry.quantity += added;
        results.push({ key: gain.key, name: gain.name, added, overflow, newQuantity: entry.quantity });
    }

    profile.markModified('ingredients');
    return results;
}

const STORAGE_EXPANSION_AMOUNT = 15;

export function applyStorageExpansion(profile) {
    const candidates = [
        ...profile.ingredients.map((entry) => ({ kind: 'ingredient', key: entry.key, entry })),
        ...profile.drinks.map((entry) => ({ kind: 'drink', key: entry.key, entry })),
    ];

    let target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;

    if (!target) {
        profile.ingredients.push({ key: 'lemon', quantity: 0, capacity: 40 });
        target = { kind: 'ingredient', key: 'lemon', entry: profile.ingredients[profile.ingredients.length - 1] };
    }

    target.entry.capacity += STORAGE_EXPANSION_AMOUNT;
    profile.markModified(target.kind === 'drink' ? 'drinks' : 'ingredients');

    const name = target.kind === 'drink' ? (RECIPES.find((r) => r.id === target.key)?.name ?? target.key) : (INGREDIENTS[target.key]?.name ?? target.key);

    return { kind: target.kind, key: target.key, name, amount: STORAGE_EXPANSION_AMOUNT, newCapacity: target.entry.capacity };
}

const RECIPE_TICKET_DRINK_AMOUNT = 4;

export function applyRecipeTicket(profile, recipeId) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return null;

    const owned = profile.recipes.unlocked.some((r) => r.key === recipeId);
    if (!owned) return null;

    let drinkEntry = profile.drinks.find((d) => d.key === recipeId);
    if (!drinkEntry) {
        profile.drinks.push({ key: recipeId, quantity: 0, capacity: 40 });
        drinkEntry = profile.drinks[profile.drinks.length - 1];
    }

    const room = Math.max(drinkEntry.capacity - drinkEntry.quantity, 0);
    const added = Math.min(room, RECIPE_TICKET_DRINK_AMOUNT);
    const overflow = RECIPE_TICKET_DRINK_AMOUNT - added;

    drinkEntry.quantity += added;
    profile.markModified('drinks');

    return { recipeId, name: recipe.name, added, overflow, newQuantity: drinkEntry.quantity };
}