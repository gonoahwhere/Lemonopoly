import GuildStats from '../models/guildData.js';
import SilentContainer from 'silent-container';
import { stripIndents } from 'common-tags';
import { MessageFlags } from 'discord.js';
import mongoose from 'mongoose';
// const topggManager = require("../utils/topgg-stats");

export default {
    name: 'guildCreate',
    async execute(guild) {
        const client = guild.client;

        let ownerTag = 'Unknown';
        try {
            const owner = await client.users.fetch(guild.ownerId);
            if (owner) ownerTag = owner.tag;
        } catch {}

        await GuildStats.findOneAndUpdate(
            { guildId: guild.id },
            {
                guildId: guild.id,
                guildName: guild.name,
                ownerId: guild.ownerId,
                ownerTag,
            },
            { upsert: true }
        );

        const totalGuilds = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);

        // Logging
        const container = new SilentContainer()
            .addHeading(`📜 Lemonopoly ∘ Added to Guild`)
            .addDivider()
            .addText(stripIndents`
                ∘ **Server Name:** ${guild.name}
                ∘ **Server ID:** ${guild.id}
                ∘ **Owner:** ${ownerTag} (${guild.ownerId})
            `)
            .addDivider()
            .addText(`-# ${totalGuilds} Guilds ∘ ${totalMembers.toLocaleString()} Members`);

        const logChannel = client.channels.cache.get("1528475373824643343");
        if (logChannel) await logChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        // topggManager.scheduleUpdate(client);
    }
}