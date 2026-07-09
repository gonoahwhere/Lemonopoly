import { REST, Routes } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import config from './config.js';
import logger from './src/utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsPath = join(__dirname, 'src', 'commands');

const commands = [];

const categoryDirs = await readdir(commandsPath);

for (const category of categoryDirs) {
  const files = await readdir(join(commandsPath, category));

  for (const file of files.filter((f) => f.endsWith('.js'))) {
    const filePath = join(commandsPath, category, file);
    const { default: command } = await import(pathToFileURL(filePath).href);

    if (!command?.data?.toJSON) {
      logger.warn(`Skipping ${file} — missing data or toJSON()`);
      continue;
    }

    commands.push(command.data.toJSON());
    logger.info(`Queued [${category}] /${command.data.name}`);
  }
}

const rest = new REST().setToken(config.token);

const route = config.guildId
  ? Routes.applicationGuildCommands(config.clientId, config.guildId)
  : Routes.applicationCommands(config.clientId);

const scope = config.guildId ? `guild ${config.guildId}` : 'global';

try {
  logger.info(`Deploying ${commands.length} command(s) ${scope}...`);
  const data = await rest.put(route, { body: commands });
  logger.info(`Successfully deployed ${data.length} command(s) to ${scope}.`);
} catch (err) {
  logger.error(`Deploy failed: ${err.message}`);
}
