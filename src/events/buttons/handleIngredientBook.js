import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { renderIngredientBook, getIngredientBookPageCount } from '../../renders/renderIngredientBook.js';
import { errorEmbed } from '../../utils/embed.js';

export default async function handleIngredientBook(interaction) {
    if (!interaction.customId.startsWith('ingredient_book_')) return;

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

    const totalPages = getIngredientBookPageCount();

    // customId is now e.g. "ingredient_book_previous_3" or "ingredient_book_next_3"
    const [, , action, currentPageStr] = interaction.customId.split('_');
    let page = parseInt(currentPageStr, 10) || 1;

    if (action === 'previous') {
        page = Math.max(1, page - 1);
    }

    if (action === 'next') {
        page = Math.min(totalPages, page + 1);
    }

    const image = await renderIngredientBook(page);
    const attachment = new AttachmentBuilder(image, { name: 'ingredients.png' });

    const previousPage = new ButtonBuilder()
        .setCustomId(`ingredient_book_previous_${page}`)
        .setEmoji(config.emojis.misc.left_arrow)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1)
    
    const ingredientPage = new ButtonBuilder()
        .setCustomId(`ingredient_book_page`)
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId(`ingredient_book_next_${page}`)
        .setEmoji(config.emojis.misc.right_arrow)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages)
    
    const row = new ActionRowBuilder().addComponents(previousPage, ingredientPage, nextPage)
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}