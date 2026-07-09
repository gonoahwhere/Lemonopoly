import { loadImage } from '@napi-rs/canvas';
import path from 'path';

const cache = new Map();
const ICONS_DIR = path.join(process.cwd(), 'images', 'icons');

export async function preloadIcons(keys) {
    await Promise.all(
        keys.map(async (key) => {
            if (cache.has(key)) return;
            try {
                const img = await loadImage(path.join(ICONS_DIR, `${key}.png`));
                cache.set(key, img);
            } catch {
                cache.set(key, null);
            }
        })
    );
}

export function getIconFromCache(key) {
    return cache.get(key) ?? null;
}