import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { renderRecipeBook } from '../../renders/renderRecipeBook.js';
import config from "../../../config.js";
import { RECIPES } from "../../data/recipes.js";

const recipeBookSessionMap = new Map();
const RECIPES_PER_PAGE = 3;

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('recipe-book')
        .setDescription('View your very own recipe book.')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Jump to a specific page')
                .setMinValue(1)
                .setRequired(false)),
    async execute(interaction) {
        const profile = interaction.playerProfile;

        const totalPages = Math.max(1, Math.ceil(RECIPES.length / RECIPES_PER_PAGE));
        const requestedPage = interaction.options.getInteger('page');
        const page = Math.min(Math.max(requestedPage ?? 1, 1), totalPages);

        recipeBookSessionMap.set(interaction.user.id, page);

        const image = await renderRecipeBook(profile, page);
        const attachment = new AttachmentBuilder(image, { name: 'recipes.png' });

        const previousPage = new ButtonBuilder()
            .setCustomId(`recipe_book_previous_${page}`)
            .setEmoji(config.emoji('misc', 'left_arrow'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1)

        const recipePage = new ButtonBuilder()
            .setCustomId(`recipe_book_page`)
            .setLabel(`${page} / ${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const nextPage = new ButtonBuilder()
            .setCustomId(`recipe_book_next_${page}`)
            .setEmoji(config.emoji('misc', 'right_arrow'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages)

        const row = new ActionRowBuilder().addComponents(previousPage, recipePage, nextPage)
        await interaction.reply({ files: [attachment], components: [row] });
    }
}