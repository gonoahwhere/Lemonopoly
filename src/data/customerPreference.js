import { RECIPES } from './recipes.js';

const FRUIT_INGREDIENTS = new Set([
    'lime', 'strawberry', 'blueberry', 'raspberry', 'cherry', 'maraschino_cherry',
    'mango', 'pineapple', 'watermelon', 'kiwi', 'passionfruit', 'dragonfruit',
    'orange', 'orange_slice', 'pomegranate', 'cranberry', 'banana', 'grape',
    'green_apple', 'blackberry', 'coconut',
]);

function isFruitFlavoured(recipe) {
    return recipe.ingredients.some(ing => FRUIT_INGREDIENTS.has(ing.id));
}

function sortByPrice(recipes) {
    return [...recipes].sort((a, b) => a.sellPrice - b.sellPrice);
}

const ANGRY_POOL_SIZE = 25;
const RICH_POOL_SIZE = 25;

export function getPreferredRecipes(customerId, recipes = RECIPES) {
    switch (customerId) {
        case 'tourist':
        case 'worker':
            // No restriction — they'll order anything.
            return recipes;

        case 'kid':
            return recipes.filter(isFruitFlavoured);

        case 'angry':
            // Cheapest 25 by sellPrice.
            return sortByPrice(recipes).slice(0, ANGRY_POOL_SIZE);

        case 'rich':
            // Priciest 25 by sellPrice (mirrors the angry customer's logic).
            return sortByPrice(recipes).slice(-RICH_POOL_SIZE).reverse();

        default:
            return recipes;
    }
}

export function pickRecipeForCustomer(customerId, recipes = RECIPES) {
    const pool = getPreferredRecipes(customerId, recipes);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}