import { ActivityType } from 'discord.js';
import logger from '../utils/logger.js';
import PlayerProfile from '../models/player.js';

export default {
    name: 'clientReady',
    once: true,
    execute(client) {
        logger.info(`Logged in as ${client.user.tag} (${client.user.id})`);
        logger.info(`Serving ${client.guilds.cache.size} guild(s) on shard ${client.shard?.ids[0] ?? 0}`);

        const { guilds, commands } = client;
        const serverNum = guilds.cache.size;
        const userNum = guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        logger.info(`Currently in ${serverNum} server(s) with a total of ${userNum} user(s).`);
        logger.info(`Loaded ${commands.size} command(s).`);

        const formatNumber = (num) => {
            if (num < 1e3) return num.toString();
            if (num < 1e6) return (num / 1e3).toFixed(1) + "K";
            if (num < 1e9) return (num / 1e6).toFixed(1) + "M";
            if (num < 1e12) return (num / 1e9).toFixed(1) + "B";
            return (num / 1e12).toFixed(1) + "T";
        };

        const setBotPresence = async () => {
            let profileCount = null
            let totalCustomersServed = null;
            let totalCupsSold = null;

            try {
                profileCount = await PlayerProfile.countDocuments();
            } catch (err) {
                logger.error(`Failed to fetch profile count for presence: ${err.message}`);
            }

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

                if (totals) {
                    totalCustomersServed = totals.totalCustomersServed;
                    totalCupsSold = totals.totalCupsSold;
                }
            } catch (err) {
                logger.error(`Failed to fetch customer/cup totals for presence: ${err.message}`);
            }

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

            const statusMessage = watchingStatus[Math.floor(Math.random() * watchingStatus.length)];

            client.user.setPresence({
                activities: [{ name: statusMessage, type: ActivityType.Streaming, url: 'https://twitch.tv/gonoahwhere' }],
                status: 'dnd',
            });
        };

        setBotPresence();
        setInterval(setBotPresence, 3600000);
    },
};