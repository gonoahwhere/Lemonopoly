import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { COMMAND_CATEGORIES, FEATURES } from '../../data/guideKeys.js';
import { buildGuideManifest } from '../../helpers/guideManifest.js';
import { renderGuideContents } from '../../renders/renderInstructionGuide.js';
import { errorEmbed } from '../../utils/embed.js';
import logger from '../../utils/logger.js';
import config from '../../../config.js';

const manifest = buildGuideManifest(COMMAND_CATEGORIES, FEATURES);

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Util',
    data: new SlashCommandBuilder()
        .setName('getting-started')
        .setDescription('Open the stand manual — commands, features, and how everything works.'),
    async execute(interaction) {
        await interaction.deferReply();

        let profile;
        try {
            profile = await PlayerProfile.findOne({ discordId: interaction.user.id });
        } catch (err) {
            logger.error(`Failed to load profile for ${interaction.user.tag} in /getting-started: ${err.message}`);
            return interaction.editReply({
                components: [errorEmbed('Something went wrong!', 'Couldn\'t open the manual right now. Please try again shortly.')],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        const page = 1;
        const image = await renderGuideContents(manifest.sections, profile, page, manifest.totalPages);
        const attachment = new AttachmentBuilder(image, { name: 'guide.png' });

        const components = [];
        if (manifest.totalPages > 1) {
            const previousPage = new ButtonBuilder()
                .setCustomId('guide_previous')
                .setEmoji(config.emojis.misc.left_arrow)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1);

            const guidePage = new ButtonBuilder()
                .setCustomId('guide_view')
                .setLabel(`${page} / ${manifest.totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            const nextPage = new ButtonBuilder()
                .setCustomId('guide_next')
                .setEmoji(config.emojis.misc.right_arrow)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === manifest.totalPages);

            components.push(new ActionRowBuilder().addComponents(previousPage, guidePage, nextPage));
        }

        await interaction.editReply({ files: [attachment], components });
    },
};