import { loadImage } from '@napi-rs/canvas';
import path from 'path';

const CACHE_AGE = 7200000;

function createCache(dir) {
    const cache = new Map();
    
    return async function(id) {
        const cached = cache.get(id);

        if (cached) {
            clearTimeout(cached.timeout);
            cached.timeout = setTimeout(() => cache.delete(id), CACHE_AGE);

            return cached.img;
        }

        const img = await loadImage(path.join(dir, `${id}.png`));

        cache.set(id, {
            img,
            timeout: setTimeout(() => cache.delete(id), CACHE_AGE)
        });

        return img;
    }
}

export default {
    getDrinkImage: createCache(path.join(process.cwd(), 'images', 'drinks')),
    getIconImage: createCache(path.join(process.cwd(), 'images', 'icons')),
    getIngredientImage: createCache(path.join(process.cwd(), 'images', 'ingredients'))
}