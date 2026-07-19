import { ActivityType } from 'discord.js';
import logger from '../utils/logger.js';
import PlayerProfile from '../models/player.js';
import BotStats from '../models/botData.js';
import GuildStats from '../models/guildData.js';

export default {
    name: 'clientReady',
    once: true,
    async execute(client) {
        try {

            // -- SYNCS GUILDS TO DATABASE
            let createdCount = 0;
            await client.guilds.fetch();

            for (const [guildId, guild] of client.guilds.cache) {
                const exists = await GuildStats.findOne({ guildId });

                if (!exists) {
                    let ownerTag = 'Unknown';
                    try {
                        const owner = await client.users.fetch(guild.ownerId);
                        if (owner) ownerTag = owner.tag;
                    } catch {}

                    await GuildStats.create({
                        guildId,
                        guildName: guild.name,
                        ownerId: guild.ownerId,
                        ownerTag
                    });

                    createdCount++;
                    logger.info(`[GUILD DATA] Added missing guild entry → ${guild.name} (${guildId})`);
                }
            }

            logger.info(`[GUILD DATA] Guild sync complete. Created ${createdCount} missing entries.`);

            // -- LOGIN STATUS
            logger.info(`[CLIENT] Logged in as ${client.user.tag} (${client.user.id})`);

            const formatNumber = (num) => {
                if (num < 1e3) return num.toString();
                if (num < 1e6) return (num / 1e3).toFixed(1) + "K";
                if (num < 1e9) return (num / 1e6).toFixed(1) + "M";
                if (num < 1e12) return (num / 1e9).toFixed(1) + "B";
                return (num / 1e12).toFixed(1) + "T";
            };

            // -- SHARED FUNCTION
            const getCustomerTotals = async () => {
                try {
                    const [totals] = await PlayerProfile.aggregate([
                        {
                            $group: {
                                _id: null,
                                totalCustomersServed: { $sum: '$customers.totalServed' },
                                totalCupsSold: { $sum: '$customers.cupsSold' },
                            },
                        },
                    ]);

                    return {
                        totalCustomersServed: totals?.totalCustomersServed ?? null,
                        totalCupsSold: totals?.totalCupsSold ?? null,
                    };
                } catch (err) {
                    logger.error(`Failed to fetch customer/cup totals: ${err.message}`);
                    return { totalCustomersServed: null, totalCupsSold: null };
                }
            };

            // -- BOT PRESENCE
            const setBotPresence = async () => {
                const serverNum = client.guilds.cache.size;
                const userNum = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

                let profileCount = null

                try {
                    profileCount = await PlayerProfile.countDocuments();
                } catch (err) {
                    logger.error(`Failed to fetch profile count for presence: ${err.message}`);
                }

                const { totalCustomersServed, totalCupsSold } = await getCustomerTotals();

                const watchingStatus = [
                    `over ${formatNumber(userNum)} users`,
                    `over ${formatNumber(serverNum)} servers`,
                    `for /help`,
                    `Your childhood memories be monopolized!`
                ];

                if (profileCount !== null) {
                    watchingStatus.push(`over ${formatNumber(profileCount)} lemonade stands.`);
                }

                if (totalCustomersServed !== null) {
                    watchingStatus.push(`${formatNumber(totalCustomersServed)}+ customers being served.`);
                }

                if (totalCupsSold !== null) {
                    watchingStatus.push(`${formatNumber(totalCupsSold)}+ cups of lemonade being sold.`);
                }
                
                logger.info(`[CLIENT] Currently in ${serverNum} server(s) with a total of ${userNum} user(s).`);

                const statusMessage = watchingStatus[Math.floor(Math.random() * watchingStatus.length)];
                client.user.setPresence({
                    activities: [{ 
                        name: statusMessage, 
                        type: ActivityType.Streaming, 
                        url: 'https://twitch.tv/gonoahwhere' 
                    }],
                    status: 'dnd',
                });
            };

            // -- LEMONOPOLY STATS
            async function updateStats() {
                try {
                    const serverNum = client.guilds.cache.size;
                    const userNum = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                    const shardNum = client.shard?.count ?? 1;
                    const standCount = await PlayerProfile.countDocuments();
                    const slashCmds = client.commands.filter(cmd => cmd.data).size;
                    const { totalCustomersServed, totalCupsSold } = await getCustomerTotals();

                    await BotStats.findOneAndUpdate(
                        { name: 'bot_statistics' },
                        {
                            $set: {
                                guildCount: serverNum,
                                userCount: userNum,
                                shardCount: shardNum,
                                standCount,
                                slashCmds,
                                customersServed: totalCustomersServed ?? 0,
                                cupsSold: totalCupsSold ?? 0,
                            },
                        },
                        { upsert: true, returnDocument: 'after' }
                    );
                } catch (err) {
                    logger.error(`[BOT STATS] Failed to update bot stats: ${err.message}`);
                }
            }

            logger.info(`[CLIENT] Serving ${client.guilds.cache.size} guild(s) on shard ${client.shard?.ids[0] ?? 0}`);
            logger.info(`[CLIENT] Loaded ${client.commands.size} command(s).`);

            // -- ONLY START THE SCHEDULERS ONCE
            if (!global.__READY_INTERVALS__) {
                global.__READY_INTERVALS__ = true;

                setBotPresence();
                updateStats();

                setInterval(setBotPresence, 3600000);
                setInterval(updateStats, 10000);
            }
        } catch (err) {
            logger.error(`[CLIENT] Error during clientReady: ${err.message}`);
        }
    },
};