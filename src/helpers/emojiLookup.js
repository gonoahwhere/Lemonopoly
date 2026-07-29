import config from '../../config.js';

function getIngredientEmoji(id) {
    const category = Object.keys(config.emojis.ingredients).find(k => id in config.emojis.ingredients[k]);

    return category ? config.emoji('ingredients', category, id) : '';
}

function getRecipeEmoji(id) {
    return config.emoji('drinks', id) ?? '';
}