import { ShardingManager } from 'discord.js';
import config from './config.js';
import logger from './src/utils/logger.js';

const manager = new ShardingManager('./bot.js', {
    token: config.token,
    totalShards: config.sharding.totalShards,
});

manager.on('shardCreate', (shard) => {
    logger.info(`[Shard ${shard.id} Launched]`);
    shard.on("ready", () => logger.info(`[Shard ${shard.id}] Ready`));
    shard.on("disconnect", () => logger.warn(`[Shard ${shard.id}] Disconnected`));
    shard.on("reconnecting", () => logger.info(`[Shard ${shard.id}] Reconnecting...`));
    shard.on("death", () => logger.error(`[Shard ${shard.id}] Died`));
    shard.on("error", (err) => logger.error(`[Shard ${shard.id}] Error: ${err.message}`));
});

manager.spawn().catch((err) => {
    logger.error(`Failed to spawn shards: ${err.message}`);
    process.exit(1);
});