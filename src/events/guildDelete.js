import GuildStats from '../models/guildData.js';
import SilentContainer from 'silent-container';
import { stripIndents } from 'common-tags';
import { MessageFlags } from 'discord.js';
import mongoose from 'mongoose';
// const topggManager = require("../utils/topgg-stats");

export default {
    name: 'guildDelete',
    async execute(guild) {
        const client = guild.client;

        let ownerTag = 'Unknown';
        try {
            const owner = await client.users.fetch(guild.ownerId);
            if (owner) ownerTag = owner.tag;
        } catch {}

        const saved = await GuildStats.findOne({ guildId: guild.id });
        if (!saved || !guild.available) return;

        const guildName = guild.name ?? saved?.guildName ?? "Unknown";
        const ownerId = guild.ownerId ?? saved?.ownerId ?? "Unknown";
        const finalOwnerTag = ownerTag !== "Unknown" ? ownerTag : saved?.ownerTag ?? "Unknown";

        if (saved) await saved.deleteOne();

        const totalGuilds = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);

        // Logging
        const container = new SilentContainer()
            .addHeading(`📜 Lemonopoly ∘ Removed from Guild`)
            .addDivider()
            .addText(stripIndents`
                ∘ **Server Name:** ${guild.name}
                ∘ **Server ID:** ${guild.id}
                ∘ **Owner:** ${ownerTag} (${guild.ownerId})
            `)
            .addDivider()
            .addText(`-# ${totalGuilds} Guilds ∘ ${totalMembers.toLocaleString()} Members`);

        const logChannel = client.channels.cache.get("1528475457421574285");
        if (logChannel) await logChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        // topggManager.scheduleUpdate(client);
    }
}