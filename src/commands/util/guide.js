import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { COMMAND_CATEGORIES, FEATURES } from '../../data/guideKeys.js';
import { buildGuideManifest } from '../../helpers/guideManifest.js';
import { guideSessionMap, getModePages, renderGuidePage } from '../../helpers/guideSession.js';
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
        .setDescription('Open the stand manual — commands, features, and how everything works.')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription(`Jump to a specific page (1-${manifest.totalPages})`)
                .setMinValue(1)
                .setMaxValue(manifest.totalPages)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('section')
                .setDescription('View only one part of the manual')
                .setRequired(false)
                .addChoices(
                    { name: 'Commands', value: 'commands' },
                    { name: 'Features', value: 'features' },
                )),
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

        const section = interaction.options.getString('section');
        const requestedPage = interaction.options.getInteger('page');
        const mode = section === 'commands' ? 'commands' : section === 'features' ? 'features' : 'full';

        const totalPages = getModePages(manifest, mode).length;

        // Clamp in case a page number was requested against the full-guide range
        // but the section chosen has fewer pages than that.
        let page = requestedPage ?? 1;
        page = Math.min(Math.max(page, 1), totalPages);

        guideSessionMap.set(interaction.user.id, { mode, page });

        const image = await renderGuidePage(manifest, mode, page, profile);
        const attachment = new AttachmentBuilder(image, { name: 'guide.png' });

        const components = [];
        if (totalPages > 1) {
            const previousPage = new ButtonBuilder()
                .setCustomId('guide_previous')
                .setEmoji(config.emoji('misc', 'left_arrow'))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1);

            const guidePage = new ButtonBuilder()
                .setCustomId('guide_view')
                .setLabel(`${page} / ${totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            const nextPage = new ButtonBuilder()
                .setCustomId('guide_next')
                .setEmoji(config.emoji('misc', 'right_arrow'))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages);

            components.push(new ActionRowBuilder().addComponents(previousPage, guidePage, nextPage));
        }

        await interaction.editReply({ files: [attachment], components });
    },
};