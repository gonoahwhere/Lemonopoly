import { readdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = join(__dirname, '..', 'commands');

export async function loadCommands(client) {
    let loaded = 0;
    const categories = await readdir(COMMANDS_DIR);

    for (const category of categories) {
        const files = await readdir(join(COMMANDS_DIR, category));

        for (const file of files.filter((f) => f.endsWith('.js'))) {
            const filePath = join(COMMANDS_DIR, category, file);

            try {
                const { default: command } = await import(pathToFileURL(filePath).href);

                if (!command?.data || !command?.execute) {
                    logger.warn(`[Commands] ${file} is missing data or execute — skipped.`);
                    continue;
                }

                client.commands.set(command.data.name, command);
                loaded++;
                logger.info(`[Commands] Loaded [${category}] /${command.data.name}`);
            } catch (err) {
                logger.error(`[Commands] Failed to load ${file}: ${err.message}`);
            }
        }
    }

    logger.info(`[Commands] ${loaded} command(s) ready across ${categories.length} category(s).`);
}