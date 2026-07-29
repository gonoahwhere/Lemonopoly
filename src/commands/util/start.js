import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed } from '../../utils/embed.js';
import { renderStandDisplay } from '../../renders/renderStandDisplay.js';
import logger from '../../utils/logger.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Open your very own lemonade stand!'),
    async execute(interaction) {
        const existing = await PlayerProfile.findOne({ discordId: interaction.user.id });

        if (existing) {
            return interaction.reply({
                components: [errorEmbed('You\'re already open!', 'You already have a stand up and running - check it with `/stand`.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        let profile;
        try {
            profile = await PlayerProfile.create({
                discordId: interaction.user.id,
                username: interaction.user.tag,
            });
        } catch (err) {
            if (err.code === 11000) {
                return interaction.reply({
                    components: [errorEmbed('You\'re already open!', 'You already have a stand up and running - check it with `/stand`.')],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            logger.error(`Failed to create stand for ${interaction.user.tag}: ${err.message}`);
            return interaction.reply({
                components: [errorEmbed('Something went wrong!', 'Couldn\'t open your stand right now. Please try again shortly.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const buffer = renderStandDisplay(profile);
        await interaction.reply({ files: [{ attachment: buffer, name: 'stand.png' }] });
    }
}