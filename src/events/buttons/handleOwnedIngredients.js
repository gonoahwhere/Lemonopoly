import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';
import { renderOwnedIngredientBook, getOwnedIngredientBookPageCount } from '../../renders/renderOwnedIngredientBook.js';
import { errorEmbed } from '../../utils/embed.js';

const ownedIngredientMap = new Map();

export default async function handleOwnedIngredientBook(interaction) {
    if (!interaction.customId.startsWith('ingredient_stock_')) return;

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

    let page = ownedIngredientMap.get(interaction.user.id) ?? 1;
    const totalPages = getOwnedIngredientBookPageCount(profile);

    if (interaction.customId === 'ingredient_stock_previous') {
        page = Math.max(1, page - 1);
    }

    if (interaction.customId === 'ingredient_stock_next') {
        page = Math.min(totalPages, page + 1);
    }

    ownedIngredientMap.set(interaction.user.id, page);
    const image = await renderOwnedIngredientBook(profile, page);
    const attachment = new AttachmentBuilder(image, { name: 'my-ingredients.png' });

    const previousPage = new ButtonBuilder()
        .setCustomId(`ingredient_stock_previous`)
        .setEmoji(config.emoji('misc', 'left_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1)

    const ingredientPage = new ButtonBuilder()
        .setCustomId(`ingredient_stock_page`)
        .setLabel(`${page} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextPage = new ButtonBuilder()
        .setCustomId(`ingredient_stock_next`)
        .setEmoji(config.emoji('misc', 'right_arrow'))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages)

    const row = new ActionRowBuilder().addComponents(previousPage, ingredientPage, nextPage)
    await interaction.update({ files: [attachment], components: [row] });
    return true;
}