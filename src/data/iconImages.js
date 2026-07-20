import { loadImage } from '@napi-rs/canvas';
import path from 'path';

const cache = new Map();
const ICONS_DIR = path.join(process.cwd(), 'images', 'icons');
const CACHE_AGE = 7200000;

export async function getIconFromCache(key) {
    const cached = cache.get(key);

    if (cached) {
        clearTimeout(cached.timeout);
        cached.timeout = setTimeout(() => cache.delete(key), CACHE_AGE);

        return cached.img;
    }

    const img = await loadImage(path.join(ICONS_DIR, `${key}.png`));

    cache.set(key, {
        img,
        timeout: setTimeout(() => cache.delete(key), CACHE_AGE)
    });

    return img;
}