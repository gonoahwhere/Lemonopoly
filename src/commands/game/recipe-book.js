import { SlashCommandBuilder, AttachmentBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import PlayerProfile from '../../models/player.js';
import { errorEmbed } from '../../utils/embed.js';
import { renderRecipeBook } from '../../renders/renderRecipeBook.js';
import config from "../../../config.js";
import { RECIPES } from "../../data/recipes.js";

const RECIPES_PER_PAGE = 3;

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('recipe-book')
        .setDescription('View your very own recipe book.'),
    async execute(interaction) {
        const profile = interaction.playerProfile
        const image = await renderRecipeBook(profile);

        let page = 1;
        const totalPages = Math.max(1, Math.ceil(RECIPES.length / RECIPES_PER_PAGE));
        const attachment = new AttachmentBuilder(image, { name: 'recipes.png' });

        const previousPage = new ButtonBuilder()
            .setCustomId(`recipe_book_previous`)
            .setEmoji(config.emojis.misc.left_arrow)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1)
        
        const recipePage = new ButtonBuilder()
            .setCustomId(`recipe_book_page`)
            .setLabel(`${page} / ${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const nextPage = new ButtonBuilder()
            .setCustomId(`recipe_book_next`)
            .setEmoji(config.emojis.misc.right_arrow)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages)

        const row = new ActionRowBuilder().addComponents(previousPage, recipePage, nextPage)
        await interaction.reply({ files: [attachment], components: [row] });
    }
}