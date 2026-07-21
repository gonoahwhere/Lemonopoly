import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { renderMasteryBook } from '../../renders/renderMasteryBook.js';
import { RECIPES } from '../../data/recipes.js';
import { errorEmbed } from '../../utils/embed.js';

const RECIPES_PER_PAGE = 3;
const ownRecipeMap = new Map();

export default async function handleRecipeBook(interaction) {
    if (!interaction.customId.startsWith('recipe_view_')) return;

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

    let page = ownRecipeMap.get(interaction.user.id) ?? 1;
    const totalPages = Math.max(1, Math.ceil(RECIPES.length / RECIPES_PER_PAGE));

    if (interaction.customId === 'recipe_view_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'recipe_view_next') {
        page = Math.min(totalPages, page + 1);
    }

    ownRecipeMap.set(interaction.user.id, page);
    const image = renderMasteryBook(profile, page);
    const attachment = new AttachmentBuilder(image, { name: 'my-recipes.png' });

    const previousPage = new ButtonBuilder()
        .setCustomId(`recipe_view_previous`)
        .setEmoji(config.emoji('misc', 'left_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1)

    const recipePage = new ButtonBuilder()
        .setCustomId(`recipe_view_page`)
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId(`recipe_view_next`)
        .setEmoji(config.emoji('misc', 'right_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages)

    const row = new ActionRowBuilder().addComponents(previousPage, recipePage, nextPage)
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}