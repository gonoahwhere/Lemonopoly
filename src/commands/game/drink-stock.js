import { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { renderDrinkStock } from '../../renders/renderDrinkStock.js';
import { RECIPES } from '../../data/recipes.js';
import config from '../../../config.js';

const OWNED_DRINKS_PER_PAGE = 12;

export default {
    devOnly: false,
    cooldown: 5,
    category: 'Game',
    data: new SlashCommandBuilder()
        .setName('drink-stock')
        .setDescription('View the lemonade you\'ve mixed.'),
    async execute(interaction) {
        const profile = interaction.playerProfile;

        const stockByKey = new Map((profile.drinks || []).map(stock => [stock.key, stock]));
        const ownedCount = RECIPES.filter(recipe => (stockByKey.get(recipe.id)?.quantity || 0) > 0).length;

        const page = 1;
        const totalPages = Math.max(1, Math.ceil(ownedCount / OWNED_DRINKS_PER_PAGE));
        const image = await renderDrinkStock(profile, page);
        const attachment = new AttachmentBuilder(image, { name: 'my-drinks.png' });

        const components = [];

        if (totalPages > 1) {
            const previousPage = new ButtonBuilder()
                .setCustomId(`drink_stock_previous`)
                .setEmoji(config.emoji('misc', 'left_arrow'))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1);

            const drinkPage = new ButtonBuilder()
                .setCustomId(`drink_stock_page`)
                .setLabel(`${page} / ${totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            const nextPage = new ButtonBuilder()
                .setCustomId(`drink_stock_next`)
                .setEmoji(config.emoji('misc', 'right_arrow'))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages);

            components.push(new ActionRowBuilder().addComponents(previousPage, drinkPage, nextPage));
        }

        await interaction.reply({ files: [attachment], components });
    }
}