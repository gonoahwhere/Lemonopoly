import { loadImage } from '@napi-rs/canvas';
import path from 'path';

const cache = new Map();
const DRINKS_DIR = path.join(process.cwd(), 'images', 'drinks');
const CACHE_AGE = 7200000;

export async function getDrinkImageFromCache(id) {
    const cached = cache.get(id);

    if (cached) {
        clearTimeout(cached.timeout);
        cached.timeout = setTimeout(() => cache.delete(id), CACHE_AGE);

        return cached.img;
    }

    const img = await loadImage(path.join(DRINKS_DIR, `${id}.png`));

    cache.set(id, {
        img,
        timeout: setTimeout(() => cache.delete(id), CACHE_AGE)
    });

    return img;
}