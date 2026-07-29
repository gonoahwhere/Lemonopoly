import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { COMMAND_CATEGORIES, FEATURES } from '../../data/guideKeys.js';
import { buildGuideManifest } from '../../helpers/guideManifest.js';
import { guideSessionMap, getModePages, renderGuidePage } from '../../helpers/guideSession.js';
import { errorEmbed } from '../../utils/embed.js';

const manifest = buildGuideManifest(COMMAND_CATEGORIES, FEATURES);

export default async function handleGuideView(interaction) {
    if (!interaction.customId.startsWith('guide_')) return;

    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: `${config.emoji('misc', 'disabled')} Only the original user can interact with this.`, flags: MessageFlags.Ephemeral });
    }

    const profile = await PlayerProfile.findOne({ discordId: interaction.user.id });

    if (!profile) {
        return interaction.reply({
            components: [errorEmbed('You don\'t have a stand open yet!', 'You need to open your stand first - run `/start` to get going.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    const session = guideSessionMap.get(interaction.user.id) ?? { mode: 'full', page: 1 };
    const { mode } = session;
    const totalPages = getModePages(manifest, mode).length;

    let page = session.page ?? 1;

    if (interaction.customId === 'guide_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'guide_next') {
        page = Math.min(totalPages, page + 1);
    }

    guideSessionMap.set(interaction.user.id, { mode, page });

    const image = await renderGuidePage(manifest, mode, page, profile);
    const attachment = new AttachmentBuilder(image, { name: 'guide.png' });

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

    const row = new ActionRowBuilder().addComponents(previousPage, guidePage, nextPage);
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}