import { loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { INGREDIENTS } from '../data/ingredients.js';

const cache = {};

export async function loadIngredientImages() {
    for (const [id, ingredient] of Object.entries(INGREDIENTS)) {

        const filePath = path.join(
            process.cwd(),
            'images',
            'ingredients',
            ingredient.icon
        );

        const buffer = fs.readFileSync(filePath);

        cache[id] = await loadImage(buffer);
    }
}

export function getIngredientFromCache(id) {
    return cache[id];
}