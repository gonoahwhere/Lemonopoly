import { Client, GatewayIntentBits, Collection } from 'discord.js';
import mongoose from 'mongoose';
import config from './config.js';
import logger from './src/utils/logger.js';

import { loadCommands } from './src/handlers/commandHandler.js';
import { loadEvents } from './src/handlers/eventHandler.js';
import { loadButtons } from './src/events/buttons/index.js';
import { loadSprites } from './src/data/sprites.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.buttonHandlers = await loadButtons();

try {
    await mongoose.connect(config.MongoURI);
    logger.info('[MONGOOSE] Connected to MongoDB');
} catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
}

await loadSprites();
await loadCommands(client);
await loadEvents(client);

client.login(config.token).catch((err) => {
    logger.error(`Login failed: ${err.message}`);
    process.exit(1);
});