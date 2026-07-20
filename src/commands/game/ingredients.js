import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { renderOwnedIngredientBook, getOwnedIngredientBookPageCount } from '../../renders/renderOwnedIngredientBook.js';
import { INGREDIENTS } from '../../data/ingredients.js';
import config from '../../../config.js';
import PlayerProfile from '../../models/player.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('ingredient-stock')
        .setDescription('View the ingredients you currently have.'),
    async execute(interaction) {
        const profile = interaction.playerProfile

        let page = 1
        const totalPages = getOwnedIngredientBookPageCount(profile);
        const image = await renderOwnedIngredientBook(profile, page);
        const attachment = new AttachmentBuilder(image, { name: 'my-ingredients.png' });

        const components = [];

        if (totalPages > 1) {
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

            components.push(new ActionRowBuilder().addComponents(previousPage, ingredientPage, nextPage))
        }

        await interaction.reply({ files: [attachment], components });
    }
}