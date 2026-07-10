import { loadImage } from '@napi-rs/canvas';
import path from 'path';
import { ICON_KEY_TO_CATEGORY } from '../data/iconKeys.js';

const cache = new Map();
const ICONS_DIR = path.join(process.cwd(), 'images', 'icons');

function resolveIconPath(key) {
    const category = ICON_KEY_TO_CATEGORY[key];
    if (!category) return path.join(ICONS_DIR, `${key}.png`);
    return path.join(ICONS_DIR, category, `${key}.png`);
}

export async function preloadIcons(keys) {
    await Promise.all(
        keys.map(async (key) => {
            if (cache.has(key)) return;
            try {
                const img = await loadImage(resolveIconPath(key));
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