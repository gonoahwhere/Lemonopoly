import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { COMMAND_CATEGORIES, FEATURES } from '../../data/guideKeys.js';
import { buildGuideManifest } from '../../helpers/guideManifest.js';
import { renderGuideContents, renderGuideCommands, renderGuideFeature } from '../../renders/renderInstructionGuide.js';
import { errorEmbed } from '../../utils/embed.js';

const guidePageMap = new Map();
const manifest = buildGuideManifest(COMMAND_CATEGORIES, FEATURES);

async function renderGuidePage(profile, page) {
    if (page === 1) {
        return renderGuideContents(manifest.sections, profile, page, manifest.totalPages);
    }

    const entry = manifest.pages[page - 2];
    if (entry.type === 'commands') {
        return renderGuideCommands(entry.category, entry.commands, profile, page, manifest.totalPages, entry.part);
    }

    return renderGuideFeature(entry.feature, profile, page, manifest.totalPages, entry.part);
}

export default async function handleGuideView(interaction) {
    if (!interaction.customId.startsWith('guide_')) return;

    if (interaction.user.id !== interaction.message.interaction?.user.id) {
        return interaction.reply({ content: `${config.emojis.misc.disabled} Only the original user can interact with this.`, flags: MessageFlags.Ephemeral });
    }

    const profile = await PlayerProfile.findOne({ discordId: interaction.user.id });

    if (!profile) {
        return interaction.reply({
            components: [errorEmbed('You don\'t have a stand open yet!', 'You need to open your stand first - run `/start` to get going.')],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    const totalPages = manifest.totalPages;
    let page = guidePageMap.get(interaction.user.id) ?? 1;

    if (interaction.customId === 'guide_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'guide_next') {
        page = Math.min(totalPages, page + 1);
    }

    guidePageMap.set(interaction.user.id, page);

    const image = await renderGuidePage(profile, page);
    const attachment = new AttachmentBuilder(image, { name: 'guide.png' });

    const previousPage = new ButtonBuilder()
        .setCustomId('guide_previous')
        .setEmoji(config.emojis.misc.left_arrow)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1);

    const guidePage = new ButtonBuilder()
        .setCustomId('guide_view')
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId('guide_next')
        .setEmoji(config.emojis.misc.right_arrow)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages);

    const row = new ActionRowBuilder().addComponents(previousPage, guidePage, nextPage);
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}