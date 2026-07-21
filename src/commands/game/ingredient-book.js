import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { renderIngredientBook, getIngredientBookPageCount } from '../../renders/renderIngredientBook.js';
import config from "../../../config.js";
import { INGREDIENTS } from "../../data/ingredients.js";

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('ingredient-book')
        .setDescription('View the full ingredient index.'),
    async execute(interaction) {
        const image = renderIngredientBook();

        let page = 1;
        const totalPages = getIngredientBookPageCount();
        const attachment = new AttachmentBuilder(image, { name: 'ingredients.png' });

        const previousPage = new ButtonBuilder()
            .setCustomId(`ingredient_book_previous`)
            .setEmoji(config.emoji('misc', 'left_arrow'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1)

        const ingredientPage = new ButtonBuilder()
            .setCustomId(`ingredient_book_page`)
            .setLabel(`${page} / ${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const nextPage = new ButtonBuilder()
            .setCustomId(`ingredient_book_next`)
            .setEmoji(config.emoji('misc', 'right_arrow'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages)

        const row = new ActionRowBuilder().addComponents(previousPage, ingredientPage, nextPage)
        await interaction.reply({ files: [attachment], components: [row] });
    }
}