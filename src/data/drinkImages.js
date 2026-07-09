import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';

const cache = new Map();
const DRINKS_DIR = path.join(process.cwd(), 'images', 'drinks');

export async function preloadDrinkImages(recipes) {
    for (const recipe of recipes) {
        if (!recipe.image || cache.has(recipe.image)) continue;
        try {
            const img = await loadImage(path.join(DRINKS_DIR, recipe.image));
            cache.set(recipe.image, img);
        } catch {
            cache.set(recipe.image, null);
        }
    }
}

export function getDrinkImageFromCache(filename) {
    return cache.get(filename) || null;
}