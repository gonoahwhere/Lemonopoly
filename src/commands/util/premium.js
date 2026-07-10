
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { renderPremiumPerks } from '../../renders/renderPremiumBenefits.js';
import PlayerProfile from '../../models/player.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
    data: new SlashCommandBuilder()
        .setName('premium-perks')
        .setDescription('View the perks you get with the Premium Pass'),
    async execute(interaction) {
        await interaction.deferReply();

        const profile = interaction.playerProfile;
        const isPremium = Boolean(profile?.entitlements?.premium);
    
        const buffer = await renderPremiumPerks(profile);
        const attachment = new AttachmentBuilder(buffer, { name: 'premium-perks.png' });

        await interaction.editReply({ files: [attachment ]});
    }
}