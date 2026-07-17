import { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../../../config.js';
import { renderPrestige } from '../../renders/renderPrestige.js';
import { isPrestigeReady } from '../../data/upgrades.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('prestige')
        .setDescription('Reset your maxed upgrades for a permanent prestige boost.'),
    async execute(interaction) {
        await interaction.deferReply();

        const profile = interaction.playerProfile;
        const image = await renderPrestige(profile);
        const attachment = new AttachmentBuilder(image, { name: 'prestige.png' });

        if (!isPrestigeReady(profile)) {
            return interaction.editReply({ files: [attachment] });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prestige_confirm')
                .setEmoji(config.emojis.stand.prestige)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('prestige_cancel')
                .setEmoji(config.emojis.misc.disabled)
                .setStyle(ButtonStyle.Secondary),
        );

        await interaction.editReply({ files: [attachment], components: [row] });
    },
};