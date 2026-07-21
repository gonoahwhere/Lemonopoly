import { readdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = join(__dirname, '..', 'events');

export async function loadEvents(client) {
    const files = (await readdir(EVENTS_DIR)).filter((f) => f.endsWith('.js'));

    await Promise.all(files.map(async file => {
        const filePath = join(EVENTS_DIR, file);

        try {
            const { default: event } = await import(pathToFileURL(filePath).href);

            if (!event?.name || !event?.execute) {
                logger.warn(`[Events] ${file} is missing name or execute — skipped.`);
            } else {
                const method = event.once ? 'once' : 'on';
                client[method](event.name, (...args) => event.execute(...args, client));

                logger.info(`[Events] Registered ${event.once ? '(once)' : '(on)'} ${event.name}`);
            }
        } catch (err) {
            logger.error(`[Events] Failed to load ${file}: ${err.message}`);
        }
    }));
}