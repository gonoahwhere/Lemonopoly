import { SlashCommandBuilder, MessageFlags, AttachmentBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed } from '../../utils/embed.js';
import { renderMonthlyClaim } from '../../renders/renderPremiumMonthly.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('lemon-illuminati')
        .setDescription('Claim a monthly package for being a premium user.'),
    async execute(interaction) {
        await interaction.deferReply();

        const profile = interaction.playerProfile;
        const userIsPremium = Boolean(profile?.entitlements?.premium);

        if (!userIsPremium) {
            return interaction.editReply({
                components: [errorEmbed('Premium pass required!', 'Monthly rewards are a premium perk. Use `/premium-perks` to learn more.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const buffer = await renderMonthlyClaim();
        const attachment = new AttachmentBuilder(buffer, { name: 'premium-claim.png' });

        await interaction.editReply({ files: [attachment ]});
    }
}