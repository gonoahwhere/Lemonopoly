import config from '../../config.js';
const FALLBACK_INGREDIENT_EMOJI = '';
const FALLBACK_RECIPE_EMOJI = config.emojis.stand?.recipe ?? '';

function flattenIngredientEmojis() {
    const groups = config.emojis.ingredients ?? {};
    const flat = {};

    for (const group of Object.values(groups)) {
        for (const [key, emoji] of Object.entries(group)) {
            flat[key] = emoji;
        }
    }

    return flat;
}

const INGREDIENT_EMOJIS = flattenIngredientEmojis();

export function getIngredientEmoji(key) {
    return INGREDIENT_EMOJIS[key] ?? FALLBACK_INGREDIENT_EMOJI;
}

export function getRecipeEmoji(recipeId) {
    return config.emojis.drinks?.[recipeId] ?? FALLBACK_RECIPE_EMOJI;
}