import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { renderOwnedIngredientBook, getOwnedIngredientBookPageCount } from '../../renders/renderOwnedIngredientBook.js';
import config from '../../../config.js';

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('ingredient-stock')
        .setDescription('View the ingredients you currently have.')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Jump to a specific page')
                .setMinValue(1)
                .setRequired(false)),
    async execute(interaction) {
        const profile = interaction.playerProfile

        const totalPages = getOwnedIngredientBookPageCount(profile);
        const requestedPage = interaction.options.getInteger('page');
        const page = Math.min(Math.max(requestedPage ?? 1, 1), totalPages);

        const image = await renderOwnedIngredientBook(profile, page);
        const attachment = new AttachmentBuilder(image, { name: 'my-ingredients.png' });

        const components = [];

        if (totalPages > 1) {
            const previousPage = new ButtonBuilder()
                .setCustomId(`ingredient_stock_previous_${page}`)
                .setEmoji(config.emoji('misc', 'left_arrow'))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1)

            const ingredientPage = new ButtonBuilder()
                .setCustomId(`ingredient_stock_page`)
                .setLabel(`${page} / ${totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            const nextPage = new ButtonBuilder()
                .setCustomId(`ingredient_stock_next_${page}`)
                .setEmoji(config.emoji('misc', 'right_arrow'))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages)

            components.push(new ActionRowBuilder().addComponents(previousPage, ingredientPage, nextPage))
        }

        await interaction.reply({ files: [attachment], components });
    }
}