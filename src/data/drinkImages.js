import { loadImage } from '@napi-rs/canvas';
import path from 'path';

const cache = new Map();
const DRINKS_DIR = path.join(process.cwd(), 'images', 'drinks');
const CACHE_AGE = 7200000;

export async function getDrinkImageFromCache(filename) {
    const cached = cache.get(filename);

    if (cached) {
        clearTimeout(cached.timeout);
        cached.timeout = setTimeout(() => cache.delete(filename), CACHE_AGE);

        return cached.img;
    }

    const img = await loadImage(path.join(DRINKS_DIR, filename));

    cache.set(filename, {
        img,
        timeout: setTimeout(() => cache.delete(filename), CACHE_AGE)
    });

    return img;
}