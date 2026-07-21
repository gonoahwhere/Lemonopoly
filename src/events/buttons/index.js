import { readdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import logger from '../../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUTTONS_DIR = __dirname;

export async function loadButtons() {
    const handlers = [];
    const files = (await readdir(BUTTONS_DIR)).filter(
        (f) => f.endsWith('.js') && f !== 'index.js'
    );

    await Promise.all(files.map(async file => {
        const filePath = join(BUTTONS_DIR, file);

        try {
            const { default: handler } = await import(pathToFileURL(filePath).href);

            if (typeof handler !== 'function') {
                logger.warn(`[Buttons] ${file} does not export a default function.`);
            } else {
                handlers.push(handler);
                logger.info(`[Buttons] Loaded ${file}`);
            }
        } catch (err) {
            logger.error(`[Buttons] Failed to load ${file}: ${err.message}`);
        }
    }));

    return handlers;
}